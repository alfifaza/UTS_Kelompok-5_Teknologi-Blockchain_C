import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const LandingPage = () => {
  const { account, isLoggedIn, login, switchAccount, isRegistered, role, loading } = useWeb3();
  const navigate = useNavigate();

  const handleContinue = () => {
  if (!isRegistered) navigate('/register');
  else if (role === 'patient') navigate('/dashboard/patient');
  else if (role === 'doctor') navigate('/dashboard/doctor');
  else if (role === 'admin') navigate('/dashboard/admin');
};

  const steps = [
    { title: 'Login dengan wallet', desc: 'Identitas digital Anda terverifikasi lewat MetaMask, tanpa kata sandi.' },
    { title: 'Daftar peran', desc: 'Pilih sebagai pasien atau dokter, identitas tercatat permanen di blockchain.' },
    { title: 'Kelola akses', desc: 'Pasien menentukan dokter mana yang dapat melihat rekam medisnya.' },
  ];

  return (
    <div className="min-h-screen bg-ink relative overflow-hidden">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-20 blur-[120px]"
           style={{ background: 'radial-gradient(circle, #7C5CFF, #4F7CFF, transparent)' }}></div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-40 pb-24">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-4 py-1.5 mb-10">
            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full"></div>
            <span className="text-mist text-xs font-medium tracking-wide">Ethereum Sepolia Testnet</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Rekam medis Anda,<br />
            <span className="text-transparent bg-clip-text bg-brand-gradient">di tangan Anda sendiri.</span>
          </h1>

          <p className="text-mist text-lg max-w-xl mx-auto mb-12 leading-relaxed">
            Sistem rekam medis terdesentralisasi. Anda menentukan siapa yang boleh melihat
            data kesehatan Anda — tercatat transparan di blockchain.
          </p>

          {!isLoggedIn ? (
            <button
              onClick={login}
              disabled={loading}
              className="inline-flex items-center gap-2.5 bg-brand-gradient text-white font-heading font-semibold text-base px-8 py-3.5 rounded-full transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/30 disabled:opacity-50"
            >
              {loading ? 'Menghubungkan...' : 'Login dengan MetaMask'}
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-mist text-sm font-mono">{account.slice(0,6)}...{account.slice(-4)}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={switchAccount}
                  disabled={loading}
                  className="border border-white/15 text-mist hover:text-white hover:border-white/30 font-medium px-5 py-2.5 rounded-full transition-all text-sm disabled:opacity-50"
                >
                  Ganti Akun MetaMask
                </button>
                <button
                  onClick={handleContinue}
                  className="bg-brand-gradient text-white font-heading font-semibold px-7 py-2.5 rounded-full transition-all hover:scale-[1.02] text-sm"
                >
                  {isRegistered ? 'Masuk ke dashboard' : 'Daftarkan identitas'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5">
          {steps.map((s, i) => (
            <div key={i} className="bg-ink p-8">
              <span className="text-transparent bg-clip-text bg-brand-gradient font-heading font-bold text-3xl">0{i + 1}</span>
              <h3 className="font-heading font-semibold text-white mt-4 mb-2">{s.title}</h3>
              <p className="text-mist text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;