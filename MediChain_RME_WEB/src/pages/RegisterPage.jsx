import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const RegisterPage = () => {
  const { account, contract, refreshUserStatus } = useWeb3();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [txHash, setTxHash] = useState('');

  const handleSubmit = async () => {
    if (!idNumber || !selectedRole) {
      alert('Harap lengkapi semua field!');
      return;
    }
    if (!contract) {
      alert('Wallet belum terhubung. Silakan connect MetaMask dulu.');
      return;
    }
    setLoading(true);
    try {
      const roleIndex = { patient: 1, doctor: 2, admin: 3 };
      const tx = await contract.registerUser(idNumber, roleIndex[selectedRole]);
      setTxHash(tx.hash);
      await tx.wait();
      await refreshUserStatus();
      setStep(3);
      setTimeout(() => {
  navigate(
    selectedRole === 'patient' ? '/dashboard/patient' :
    selectedRole === 'doctor' ? '/dashboard/doctor' :
    '/dashboard/admin'
  );
}, 2000);
    } catch (err) {
      console.error(err);
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        alert('Transaksi dibatalkan di MetaMask.');
      } else {
        alert('Transaksi gagal: ' + (err.reason || err.message));
      }
    }
    setLoading(false);
  };

  const roles = [
  { value: 'patient', label: 'Pasien', desc: 'Kelola rekam medis & izin akses dokter Anda' },
  { value: 'doctor', label: 'Dokter', desc: 'Input diagnosa & kelola data pasien' },
  { value: 'admin', label: 'Admin', desc: 'Akses penuh: kelola semua user & rekam medis' },
];

  if (!account) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-6 pt-20">
        <div className="text-center">
          <p className="text-mist mb-4">Silakan hubungkan wallet terlebih dahulu</p>
          <button onClick={() => navigate('/')} className="bg-brand-gradient text-white font-semibold px-6 py-3 rounded-full">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${step >= s ? 'bg-brand-gradient text-white' : 'bg-white/5 text-mist'}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`flex-1 h-px transition-all ${step > s ? 'bg-violet-500' : 'bg-white/10'}`}></div>}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
          {step === 1 && (
            <>
              <h2 className="font-heading text-xl font-semibold text-white mb-1">Pilih peran Anda</h2>
              <p className="text-mist text-sm mb-7">Menentukan hak akses di dalam sistem</p>
              <div className="space-y-3">
                {roles.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setSelectedRole(r.value)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${selectedRole === r.value ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 hover:border-white/20'}`}
                  >
                    <div>
                      <p className="font-medium text-white">{r.label}</p>
                      <p className="text-sm text-mist mt-0.5">{r.desc}</p>
                    </div>
                    {selectedRole === r.value && <div className="w-2 h-2 bg-violet-400 rounded-full"></div>}
                  </button>
                ))}
              </div>
              <button
                onClick={() => selectedRole && setStep(2)}
                disabled={!selectedRole}
                className="w-full mt-6 bg-brand-gradient disabled:opacity-30 text-white font-semibold py-3 rounded-full transition-all"
              >
                Lanjutkan
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-heading text-xl font-semibold text-white mb-1">Identitas digital</h2>
              <p className="text-mist text-sm mb-7">Tersimpan permanen di blockchain</p>

              <div className="mb-4">
                <label className="block text-mist text-xs mb-2 uppercase tracking-wide">Alamat wallet aktif</label>
                <div className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-violet-400 break-all">
                  {account}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-mist text-xs mb-2 uppercase tracking-wide">
                  {selectedRole === 'doctor' ? 'Nomor SIP' : 'NIK'}
                </label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                  placeholder={selectedRole === 'doctor' ? 'Surat Izin Praktek...' : 'Nomor Induk Kependudukan...'}
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-violet-500 rounded-xl px-4 py-3 text-white outline-none transition-colors placeholder:text-mist/50"
                />
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 mb-6">
                <p className="text-amber-300/90 text-xs leading-relaxed">Transaksi ini memerlukan gas fee kecil di Sepolia Testnet.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-white/10 text-mist py-3 rounded-full hover:bg-white/5 transition-all text-sm">
                  Kembali
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !idNumber}
                  className="flex-1 bg-brand-gradient text-white font-semibold py-3 rounded-full transition-all disabled:opacity-50 text-sm"
                >
                  {loading ? 'Menunggu...' : 'Daftar ke blockchain'}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-brand-gradient rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-white text-2xl">✓</span>
              </div>
              <h2 className="font-heading text-xl font-semibold text-white mb-2">Registrasi berhasil</h2>
              <p className="text-mist text-sm mb-4">Identitas Anda tercatat di blockchain Sepolia</p>
              {txHash && (
                
                  <a href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-violet-400 text-xs underline break-all"
                >
                  Lihat transaksi di Etherscan
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;