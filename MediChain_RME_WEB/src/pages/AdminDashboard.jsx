import React, { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { formatDate } from '../utils/helpers';

const AdminDashboard = () => {
  const { contract, account } = useWeb3();
  const [allUsers, setAllUsers] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patientRecords, setPatientRecords] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('users');

  const loadAllUsers = useCallback(async () => {
    if (!contract) return;
    setLoadingUsers(true);
    try {
      const addresses = await contract.getAllUsers();
      const usersData = await Promise.all(
        addresses.map(async (addr) => {
          const userData = await contract.getUser(addr);
          return {
            address: addr,
            idNumber: userData[0],
            role: Number(userData[1]),
            isRegistered: userData[2],
          };
        })
      );
      setAllUsers(usersData);
    } catch (err) {
      console.error('Gagal load users:', err);
    }
    setLoadingUsers(false);
  }, [contract]);

  useEffect(() => { loadAllUsers(); }, [loadAllUsers]);

  const getRoleLabel = (role) => {
    if (role === 1) return { label: 'Pasien', color: 'text-blue-400 bg-blue-500/10' };
    if (role === 2) return { label: 'Dokter', color: 'text-emerald-400 bg-emerald-500/10' };
    if (role === 3) return { label: 'Admin', color: 'text-violet-400 bg-violet-500/10' };
    return { label: 'Unknown', color: 'text-mist bg-white/5' };
  };

  const handleLoadRecords = async (patientAddr) => {
    if (!patientAddr) return;
    setSelectedPatient(patientAddr);
    setLoadingRecords(true);
    setActiveTab('records');
    try {
      const result = await contract.getRecordsAdmin(patientAddr);
      const [complaints, diagnoses, therapies, cids, hashes, doctors, timestamps] = result;
      setPatientRecords(complaints.map((complaint, i) => ({
        id: i, complaint, diagnosis: diagnoses[i],
        therapy: therapies[i], cid: cids[i],
        hash: hashes[i], doctor: doctors[i],
        timestamp: timestamps[i],
      })));
    } catch (err) {
      alert('Gagal ambil rekam medis: ' + (err.reason || err.message));
    }
    setLoadingRecords(false);
  };

  const handleDeactivate = async (addr) => {
    if (!window.confirm(`Nonaktifkan user ${addr.slice(0,10)}...?`)) return;
    setActionLoading(addr);
    try {
      const tx = await contract.deactivateUser(addr);
      await tx.wait();
      await loadAllUsers();
      alert('User berhasil dinonaktifkan!');
    } catch (err) {
      alert('Gagal: ' + (err.reason || err.message));
    }
    setActionLoading(null);
  };

  const handleReactivate = async (addr) => {
    if (!window.confirm(`Aktifkan kembali user ${addr.slice(0,10)}...?`)) return;
    setActionLoading(addr);
    try {
      const tx = await contract.reactivateUser(addr);
      await tx.wait();
      await loadAllUsers();
      alert('User berhasil diaktifkan kembali!');
    } catch (err) {
      alert('Gagal: ' + (err.reason || err.message));
    }
    setActionLoading(null);
  };

  const patients = allUsers.filter(u => u.role === 1);
  const doctors = allUsers.filter(u => u.role === 2);
  const admins = allUsers.filter(u => u.role === 3);

  return (
    <div className="min-h-screen bg-ink pt-28 px-6 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-violet-400 text-sm mb-1">Super Admin</p>
          <h1 className="font-heading text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-mist font-mono text-xs mt-1 break-all">{account}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="text-3xl font-heading font-bold text-blue-400 mb-1">{patients.length}</div>
            <div className="text-mist text-sm">Total Pasien</div>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="text-3xl font-heading font-bold text-emerald-400 mb-1">{doctors.length}</div>
            <div className="text-mist text-sm">Total Dokter</div>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="text-3xl font-heading font-bold text-violet-400 mb-1">{allUsers.length}</div>
            <div className="text-mist text-sm">Total User</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'users', label: 'Manajemen User' },
            { key: 'records', label: 'Rekam Medis' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-brand-gradient text-white' : 'bg-white/[0.03] border border-white/10 text-mist hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Manajemen User */}
        {activeTab === 'users' && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <h2 className="font-heading text-lg font-semibold text-white mb-5">
              Semua User Terdaftar
              <span className="ml-2 text-mist font-normal text-sm">({allUsers.length} user)</span>
            </h2>
            {loadingUsers ? (
              <p className="text-mist text-sm text-center py-8">Memuat data dari blockchain...</p>
            ) : allUsers.length === 0 ? (
              <p className="text-mist text-sm text-center py-8">Belum ada user terdaftar</p>
            ) : (
              <div className="space-y-3">
                {allUsers.map((user, i) => {
                  const roleInfo = getRoleLabel(user.role);
                  return (
                    <div key={i} className="flex items-center justify-between bg-white/[0.02] rounded-xl px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleInfo.color}`}>
                              {roleInfo.label}
                            </span>
                            {!user.isRegistered && (
                              <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                                Nonaktif
                              </span>
                            )}
                          </div>
                          <p className="text-mist text-xs font-mono break-all">{user.address}</p>
                          <p className="text-white/60 text-xs mt-0.5">ID: {user.idNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.role === 1 && (
                          <button
                            onClick={() => handleLoadRecords(user.address)}
                            className="text-violet-400 hover:text-violet-300 text-xs bg-violet-500/10 hover:bg-violet-500/20 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                          >
                            Lihat Rekam Medis
                          </button>
                        )}
                        {user.isRegistered ? (
                          <button
                            onClick={() => handleDeactivate(user.address)}
                            disabled={actionLoading === user.address}
                            className="text-red-400 hover:text-red-300 text-xs bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 whitespace-nowrap"
                          >
                            {actionLoading === user.address ? '...' : 'Nonaktifkan'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(user.address)}
                            disabled={actionLoading === user.address}
                            className="text-emerald-400 hover:text-emerald-300 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 whitespace-nowrap"
                          >
                            {actionLoading === user.address ? '...' : 'Aktifkan'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Rekam Medis */}
        {activeTab === 'records' && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <h2 className="font-heading text-lg font-semibold text-white mb-5">
              Rekam Medis Pasien
            </h2>

            {/* Pilih Pasien */}
            <div className="flex gap-3 mb-6">
              <select
                value={selectedPatient}
                onChange={e => e.target.value && handleLoadRecords(e.target.value)}
                className="flex-1 bg-white/[0.03] border border-white/10 focus:border-violet-500 rounded-xl px-4 py-3 text-white outline-none text-sm"
              >
                <option value="">-- Pilih Pasien --</option>
                {patients.map((p, i) => (
                  <option key={i} value={p.address}>
                    {p.address.slice(0, 10)}... (ID: {p.idNumber})
                  </option>
                ))}
              </select>
            </div>

            {loadingRecords ? (
              <p className="text-mist text-sm text-center py-8">Memuat rekam medis...</p>
            ) : !selectedPatient ? (
              <p className="text-mist text-sm text-center py-8">Pilih pasien untuk melihat rekam medisnya</p>
            ) : patientRecords.length === 0 ? (
              <p className="text-mist text-sm text-center py-8">Pasien ini belum memiliki rekam medis</p>
            ) : (
              <div className="space-y-3">
                {patientRecords.map((rec) => (
                  <div key={rec.id} className="bg-white/[0.02] rounded-xl p-5">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-heading font-semibold text-white">{rec.diagnosis}</p>
                      <span className="text-mist text-xs">#{rec.id + 1}</span>
                    </div>
                    <p className="text-mist text-xs mb-3">
                      oleh <span className="font-mono text-white">{rec.doctor.slice(0,6)}...{rec.doctor.slice(-4)}</span> · {formatDate(rec.timestamp)}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/[0.02] rounded-xl p-3">
                        <p className="text-mist text-xs mb-1">Keluhan</p>
                        <p className="text-white text-sm">{rec.complaint}</p>
                      </div>
                      <div className="bg-white/[0.02] rounded-xl p-3">
                        <p className="text-mist text-xs mb-1">Terapi</p>
                        <p className="text-white text-sm">{rec.therapy || '—'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;