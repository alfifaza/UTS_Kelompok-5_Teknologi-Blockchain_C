import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const PatientDashboard = () => {
  const { account, contract } = useWeb3();
  const [authorizedCount, setAuthorizedCount] = useState(0);
  const [recordCount, setRecordCount] = useState(0);
  const [fetching, setFetching] = useState(true);

  const loadStats = useCallback(async () => {
    if (!contract || !account) return;
    setFetching(true);
    try {
      const doctors = await contract.getAuthorizedDoctors(account);
      setAuthorizedCount(doctors.length);
      const count = await contract.getRecordCount(account);
      setRecordCount(Number(count));
    } catch (err) {
      console.error('Gagal load stats:', err);
    }
    setFetching(false);
  }, [contract, account]);

  useEffect(() => { loadStats(); }, [loadStats]);

  return (
    <div className="min-h-screen bg-ink pt-28 px-6 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <p className="text-violet-400 text-sm font-medium mb-1">Dashboard Pasien</p>
          <h1 className="font-heading text-3xl font-bold text-white">Selamat datang</h1>
          <p className="text-mist font-mono text-xs mt-1 break-all">{account}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="text-3xl font-heading font-bold text-white mb-1">{fetching ? '—' : recordCount}</div>
            <div className="text-mist text-sm">Rekam medis tersimpan</div>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="text-3xl font-heading font-bold text-white mb-1">{fetching ? '—' : authorizedCount}</div>
            <div className="text-mist text-sm">Dokter terotorisasi</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/manage-access" className="bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/20 rounded-2xl p-6 transition-all">
            <h3 className="font-heading font-semibold text-white mb-1">Kelola izin akses</h3>
            <p className="text-mist text-sm">Beri atau cabut akses dokter ke rekam medis Anda</p>
          </Link>
          <Link to="/medical-history" className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-2xl p-6 transition-all">
            <h3 className="font-heading font-semibold text-white mb-1">Riwayat medis</h3>
            <p className="text-mist text-sm">Lihat semua rekam medis Anda</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;