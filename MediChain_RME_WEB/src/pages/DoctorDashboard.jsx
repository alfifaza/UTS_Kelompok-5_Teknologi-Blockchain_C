import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const DoctorDashboard = () => {
  const { account, contract } = useWeb3();
  const navigate = useNavigate();
  const [patientAddr, setPatientAddr] = useState('');
  const [checking, setChecking] = useState(false);

  const isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const handleCheckPatient = async () => {
    if (!isValidAddress(patientAddr)) {
      alert('Format alamat wallet pasien tidak valid.');
      return;
    }
    setChecking(true);
    try {
      const hasAccess = await contract.checkAccess(patientAddr, account);
      if (hasAccess) {
        navigate(`/medical-history?patient=${patientAddr}`);
      } else {
        alert('Anda belum memiliki izin akses ke pasien ini.');
      }
    } catch (err) {
      alert('Gagal cek akses: ' + (err.reason || err.message));
    }
    setChecking(false);
  };

  return (
    <div className="min-h-screen bg-ink pt-28 px-6 pb-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <p className="text-violet-400 text-sm font-medium mb-1">Dashboard Dokter</p>
          <h1 className="font-heading text-3xl font-bold text-white">Panel tenaga medis</h1>
          <p className="text-mist font-mono text-xs mt-1 break-all">{account}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Link to="/input-diagnosis" className="bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/20 rounded-2xl p-6 transition-all">
            <h3 className="font-heading font-semibold text-white mb-1">Input diagnosa baru</h3>
            <p className="text-mist text-sm">Tambah rekam medis pasien ke blockchain</p>
          </Link>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <h3 className="font-heading font-semibold text-white mb-3">Cari pasien</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Alamat wallet pasien"
                value={patientAddr}
                onChange={e => setPatientAddr(e.target.value.trim())}
                className="flex-1 bg-white/[0.03] border border-white/10 focus:border-violet-500 rounded-xl px-3 py-2 text-white text-sm outline-none placeholder:text-mist/50 font-mono"
              />
              <button
                onClick={handleCheckPatient}
                disabled={checking || !patientAddr}
                className="bg-brand-gradient text-white text-sm px-4 py-2 rounded-xl transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {checking ? '...' : 'Cek'}
              </button>
            </div>
          </div>
        </div>

        <p className="text-mist text-sm">
          Pasien harus memberi izin akses ke alamat wallet Anda terlebih dahulu sebelum Anda dapat melihat atau menambahkan rekam medis mereka.
        </p>
      </div>
    </div>
  );
};

export default DoctorDashboard;