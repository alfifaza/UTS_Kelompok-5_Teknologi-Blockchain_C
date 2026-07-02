import React, { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';

const ManageAccess = () => {
  const { contract, account, role } = useWeb3();
  const [searchAddr, setSearchAddr] = useState('');
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(null);
  const [authorized, setAuthorized] = useState([]);
  const [fetching, setFetching] = useState(true);

  const loadAuthorizedDoctors = useCallback(async () => {
    if (!contract || !account) return;
    setFetching(true);
    try {
      const doctorAddresses = await contract.getAuthorizedDoctors(account);
      const doctorsData = await Promise.all(
        doctorAddresses.map(async (addr) => {
          try {
            const userData = await contract.getUser(addr);
            return { address: addr, idNumber: userData[0] };
          } catch { return { address: addr, idNumber: '-' }; }
        })
      );
      setAuthorized(doctorsData);
    } catch (err) { console.error(err); }
    setFetching(false);
  }, [contract, account]);

  useEffect(() => { loadAuthorizedDoctors(); }, [loadAuthorizedDoctors]);

  const isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const handleGrantAccess = async () => {
    if (!isValidAddress(searchAddr)) {
      alert('Format alamat wallet tidak valid.');
      return;
    }
    if (searchAddr.toLowerCase() === account.toLowerCase()) {
      alert('Tidak bisa memberi akses ke alamat sendiri.');
      return;
    }
    setLoading(true);
    try {
      const tx = await contract.grantAccess(searchAddr);
      await tx.wait();
      setSearchAddr('');
      await loadAuthorizedDoctors();
    } catch (err) {
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) alert('Transaksi dibatalkan.');
      else alert('Gagal: ' + (err.reason || err.message));
    }
    setLoading(false);
  };

  const handleRevoke = async (doctorAddress) => {
    if (!window.confirm('Cabut akses dokter ini?')) return;
    setRevoking(doctorAddress);
    try {
      const tx = await contract.revokeAccess(doctorAddress);
      await tx.wait();
      await loadAuthorizedDoctors();
    } catch (err) {
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) alert('Transaksi dibatalkan.');
      else alert('Gagal mencabut akses: ' + (err.reason || err.message));
    }
    setRevoking(null);
  };

  if (role !== 'patient') {
    return <div className="min-h-screen bg-ink pt-28 px-6 flex items-center justify-center"><p className="text-mist">Halaman ini hanya untuk pasien.</p></div>;
  }

  return (
    <div className="min-h-screen bg-ink pt-28 px-6 pb-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-violet-400 text-sm mb-1">Pasien</p>
          <h1 className="font-heading text-3xl font-bold text-white">Kelola izin akses</h1>
          <p className="text-mist text-sm mt-1">Atur siapa yang dapat melihat rekam medis Anda</p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="font-heading text-base font-semibold text-white mb-4">Beri akses dokter baru</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Alamat wallet dokter (0x...)"
              value={searchAddr}
              onChange={e => setSearchAddr(e.target.value.trim())}
              className="flex-1 bg-white/[0.03] border border-white/10 focus:border-violet-500 rounded-xl px-4 py-3 text-white outline-none placeholder:text-mist/50 font-mono text-sm"
            />
            <button
              onClick={handleGrantAccess}
              disabled={loading || !searchAddr}
              className="bg-brand-gradient text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-50 whitespace-nowrap text-sm"
            >
              {loading ? '...' : 'Beri akses'}
            </button>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <h2 className="font-heading text-base font-semibold text-white mb-4">
            Dokter terotorisasi <span className="text-mist font-normal">({authorized.length})</span>
          </h2>
          {fetching ? (
            <p className="text-mist text-sm text-center py-8">Memuat...</p>
          ) : authorized.length === 0 ? (
            <p className="text-mist text-sm text-center py-8">Belum ada dokter yang diberi akses</p>
          ) : (
            <div className="space-y-3">
              {authorized.map((doc, i) => (
                <div key={i} className="flex items-center justify-between bg-white/[0.02] rounded-xl px-4 py-4">
                  <div>
                    <p className="text-white text-sm font-medium">SIP: {doc.idNumber}</p>
                    <p className="text-mist font-mono text-xs break-all mt-0.5">{doc.address}</p>
                  </div>
                  <button
                    onClick={() => handleRevoke(doc.address)}
                    disabled={revoking === doc.address}
                    className="text-red-400 hover:text-red-300 text-sm transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {revoking === doc.address ? 'Mencabut...' : 'Cabut akses'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAccess;