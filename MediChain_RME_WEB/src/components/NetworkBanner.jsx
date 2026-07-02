import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ensureSepoliaNetwork } from '../utils/network';

const NetworkBanner = () => {
  const { isWrongNetwork, account } = useWeb3();

  if (!account || !isWrongNetwork) return null;

  const handleSwitch = async () => {
    await ensureSepoliaNetwork();
  };

  return (
    <div className="fixed top-16 w-full z-40 bg-red-500/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
        <p className="text-white text-sm font-medium">
          ⚠️ Anda terhubung ke jaringan yang salah. Aplikasi ini hanya berjalan di Sepolia Testnet.
        </p>
        <button
          onClick={handleSwitch}
          className="bg-white text-red-600 text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-red-50 transition-all whitespace-nowrap"
        >
          Beralih ke Sepolia
        </button>
      </div>
    </div>
  );
};

export default NetworkBanner;