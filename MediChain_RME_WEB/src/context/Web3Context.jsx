import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/contractABI';
import { ensureSepoliaNetwork } from '../utils/network';

const Web3Context = createContext();
const SESSION_KEY = 'rme_session_active';

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [role, setRole] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Ambil status user (role, registered) dari blockchain untuk address tertentu
  const fetchUserStatus = useCallback(async (web3Contract, address) => {
    try {
      const userData = await web3Contract.getUser(address);
      const roleNumber = Number(userData[1]);
      const registered = userData[2];
      if (registered) {
        const roleMap = { 1: 'patient', 2: 'doctor', 3: 'admin' };
        return { role: roleMap[roleNumber] || null, isRegistered: true };
      }
      return { role: null, isRegistered: false };
    } catch (err) {
      console.error('Gagal cek status user:', err);
      return { role: null, isRegistered: false };
    }
  }, []);

  // LOGIN — proses sengaja, dipanggil saat klik tombol "Login / Hubungkan Wallet"
  const login = useCallback(async () => {
    if (!window.ethereum) {
      alert('MetaMask tidak ditemukan! Silakan install MetaMask terlebih dahulu.');
      return;
    }
    setLoading(true);
    try {
      const switched = await ensureSepoliaNetwork();
      if (!switched) {
        alert('Gagal beralih ke jaringan Sepolia.');
        setLoading(false);
        return;
      }

      // Munculkan popup pilih akun (selalu, supaya user sadar akun mana yang dipakai)
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        setLoading(false);
        return;
      }

      const address = accounts[0];
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const web3Contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);

      const status = await fetchUserStatus(web3Contract, address);

      setAccount(address);
      setContract(web3Contract);
      setRole(status.role);
      setIsRegistered(status.isRegistered);
      setIsLoggedIn(true);
      setStatusChecked(true);

      // Tandai sesi aktif di sessionStorage (hilang otomatis saat tab ditutup)
      sessionStorage.setItem(SESSION_KEY, address);
    } catch (err) {
      console.error('Login error:', err);
      if (err.code !== 4001) {
        alert('Gagal login: ' + (err.reason || err.message));
      }
    }
    setLoading(false);
  }, [fetchUserStatus]);

  // LOGOUT — putus sesi total, tidak akan auto-login lagi sampai klik Login
  const logout = useCallback(() => {
    setAccount(null);
    setContract(null);
    setRole(null);
    setIsRegistered(false);
    setIsLoggedIn(false);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  // Ganti akun TANPA logout (untuk pindah role saat masih login)
  const switchAccount = useCallback(async () => {
    if (!window.ethereum || !isLoggedIn) return;
    setLoading(true);
    try {
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        logout();
        setLoading(false);
        return;
      }
      const address = accounts[0];
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const web3Contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);
      const status = await fetchUserStatus(web3Contract, address);

      setAccount(address);
      setContract(web3Contract);
      setRole(status.role);
      setIsRegistered(status.isRegistered);
      sessionStorage.setItem(SESSION_KEY, address);
    } catch (err) {
      console.error('Switch account error:', err);
    }
    setLoading(false);
  }, [isLoggedIn, fetchUserStatus, logout]);

  const refreshUserStatus = useCallback(async () => {
    if (contract && account) {
      const status = await fetchUserStatus(contract, account);
      setRole(status.role);
      setIsRegistered(status.isRegistered);
    }
  }, [contract, account, fetchUserStatus]);

  // Saat pertama load: cek apakah ada sesi aktif tersimpan (dari tab yang sama, belum di-close)
  useEffect(() => {
    const checkExistingSession = async () => {
      const savedAddress = sessionStorage.getItem(SESSION_KEY);

      if (!savedAddress || !window.ethereum) {
        setStatusChecked(true);
        return;
      }

      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        // Hanya restore sesi jika akun yang tersimpan MASIH sama dengan akun aktif di MetaMask
        if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          const web3Signer = await web3Provider.getSigner();
          const web3Contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);
          const status = await fetchUserStatus(web3Contract, accounts[0]);

          setAccount(accounts[0]);
          setContract(web3Contract);
          setRole(status.role);
          setIsRegistered(status.isRegistered);
          setIsLoggedIn(true);
        } else {
          // Akun sudah berubah di luar aplikasi, sesi lama tidak valid
          sessionStorage.removeItem(SESSION_KEY);
        }
      } catch (err) {
        console.error('Restore session error:', err);
        sessionStorage.removeItem(SESSION_KEY);
      }
      setStatusChecked(true);
    };

    checkExistingSession();
  }, [fetchUserStatus]);

  // Kalau user logout dari MetaMask langsung (disconnect semua akun), ikut logout di web
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        logout();
      }
      // Kalau cuma ganti-ganti akun di MetaMask tanpa lewat tombol switchAccount,
      // sengaja TIDAK auto-update di sini supaya user harus klik "Ganti Akun" secara sadar.
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [logout]);

  return (
    <Web3Context.Provider value={{
      account, contract, role, isRegistered, loading, statusChecked, isLoggedIn,
      login, logout, switchAccount, refreshUserStatus
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);