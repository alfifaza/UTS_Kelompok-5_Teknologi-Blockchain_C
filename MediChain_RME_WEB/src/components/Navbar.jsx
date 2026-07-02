import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { shortenAddress } from '../utils/helpers';

const Navbar = () => {
  const { account, role, isLoggedIn, login, logout, switchAccount, loading } = useWeb3();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-ink/70 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">RM</span>
          </div>
          <span className="font-heading font-bold text-white text-lg tracking-tight">MediChain</span>
        </Link>

        <div className="flex items-center gap-3">
          {isLoggedIn && account ? (
            <>
              <span className="text-sm text-mist hidden sm:inline">
                <span className="capitalize text-violet-400 font-medium">{role || 'Belum Terdaftar'}</span>
              </span>

              <button
                onClick={switchAccount}
                disabled={loading}
                className="flex items-center gap-2 bg-white/[0.03] border border-white/10 hover:border-violet-500/40 rounded-full px-4 py-2 transition-all disabled:opacity-50"
                title="Ganti akun MetaMask"
              >
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                <span className="text-sm font-mono text-white">{shortenAddress(account)}</span>
              </button>

              <button onClick={handleLogout} className="text-sm text-mist hover:text-white transition-colors px-2">
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={login}
              disabled={loading}
              className="bg-brand-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20"
            >
              {loading ? 'Menghubungkan...' : 'Login dengan MetaMask'}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;