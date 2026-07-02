import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { computeSHA256 } from '../utils/helpers';
import { uploadToIPFS } from '../utils/ipfs';

const InputDiagnosis = () => {
  const { contract, account, role } = useWeb3();
  const [form, setForm] = useState({ patientAddress: '', complaint: '', diagnosis: '', therapy: '' });
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [txHash, setTxHash] = useState('');

  const isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const hash = await computeSHA256(f);
    setFileHash(hash);
  };

  const handleNext = async () => {
    if (!isValidAddress(form.patientAddress)) {
      alert('Format alamat wallet pasien tidak valid.');
      return;
    }
    try {
      const hasAccess = await contract.checkAccess(form.patientAddress, account);
      if (!hasAccess) {
        alert('Anda belum memiliki izin akses ke pasien ini.');
        return;
      }
      setStep(2);
    } catch (err) {
      alert('Gagal verifikasi akses: ' + (err.reason || err.message));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let cidToStore = '';
      let hashToStore = '0x' + '0'.repeat(64);

      if (file) {
        setUploading(true);
        cidToStore = await uploadToIPFS(file);
        hashToStore = fileHash;
        setUploading(false);
      }

      const tx = await contract.addMedicalRecord(
        form.patientAddress,
        form.complaint,
        form.diagnosis,
        form.therapy,
        cidToStore,
        hashToStore
      );
      setTxHash(tx.hash);
      await tx.wait();
      setStep(3);
    } catch (err) {
      console.error(err);
      setUploading(false);
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) alert('Transaksi dibatalkan.');
      else alert('Gagal submit: ' + (err.reason || err.message));
    }
    setLoading(false);
  };

  const resetForm = () => {
    setStep(1);
    setForm({ patientAddress: '', complaint: '', diagnosis: '', therapy: '' });
    setFile(null); setFileHash(''); setTxHash('');
  };

  if (role !== 'doctor') {
    return <div className="min-h-screen bg-ink pt-28 px-6 flex items-center justify-center"><p className="text-mist">Halaman ini hanya untuk dokter.</p></div>;
  }

  return (
    <div className="min-h-screen bg-ink pt-28 px-6 pb-12">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <p className="text-violet-400 text-sm mb-1">Tenaga medis</p>
          <h1 className="font-heading text-3xl font-bold text-white">Input diagnosa baru</h1>
        </div>

        {step === 1 && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-7 space-y-5">
            <div>
              <label className="block text-mist text-xs mb-2 uppercase tracking-wide">Alamat wallet pasien</label>
              <input type="text" placeholder="0x..." value={form.patientAddress}
                onChange={e => setForm({...form, patientAddress: e.target.value.trim()})}
                className="w-full bg-white/[0.03] border border-white/10 focus:border-violet-500 rounded-xl px-4 py-3 text-white outline-none placeholder:text-mist/50 font-mono text-sm" />
            </div>
            <div>
              <label className="block text-mist text-xs mb-2 uppercase tracking-wide">Keluhan pasien</label>
              <textarea rows={3} value={form.complaint}
                onChange={e => setForm({...form, complaint: e.target.value})}
                className="w-full bg-white/[0.03] border border-white/10 focus:border-violet-500 rounded-xl px-4 py-3 text-white outline-none resize-none" />
            </div>
            <div>
              <label className="block text-mist text-xs mb-2 uppercase tracking-wide">Diagnosa</label>
              <input type="text" value={form.diagnosis}
                onChange={e => setForm({...form, diagnosis: e.target.value})}
                className="w-full bg-white/[0.03] border border-white/10 focus:border-violet-500 rounded-xl px-4 py-3 text-white outline-none" />
            </div>
            <div>
              <label className="block text-mist text-xs mb-2 uppercase tracking-wide">Terapi / resep</label>
              <textarea rows={2} value={form.therapy}
                onChange={e => setForm({...form, therapy: e.target.value})}
                className="w-full bg-white/[0.03] border border-white/10 focus:border-violet-500 rounded-xl px-4 py-3 text-white outline-none resize-none" />
            </div>
            <div>
              <label className="block text-mist text-xs mb-2 uppercase tracking-wide">Dokumen pendukung (opsional)</label>
              <label className="flex items-center justify-center w-full h-24 border border-dashed border-white/15 hover:border-violet-500/50 rounded-xl cursor-pointer transition-colors">
                <p className="text-mist text-sm">{file ? file.name : 'Klik untuk upload'}</p>
                <input type="file" accept=".pdf,image/*" onChange={handleFileChange} className="hidden" />
              </label>
              {fileHash && (
                <p className="text-emerald-400 text-xs mt-2 font-mono break-all">✓ Hash siap: {fileHash.slice(0, 30)}...</p>
              )}
            </div>
            <button
              onClick={handleNext}
              disabled={!form.patientAddress || !form.diagnosis || !form.complaint}
              className="w-full bg-brand-gradient text-white font-semibold py-3 rounded-full transition-all disabled:opacity-30"
            >
              Lanjutkan
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-7">
            <h2 className="font-heading text-lg font-semibold text-white mb-5">Tinjau data</h2>
            <div className="space-y-3 mb-7">
              {[
                ['Pasien', form.patientAddress], ['Keluhan', form.complaint],
                ['Diagnosa', form.diagnosis], ['Terapi', form.therapy || '—'],
                ['File', file ? file.name : 'Tidak ada file'],
              ].map(([label, value], i) => (
                <div key={i} className="border-b border-white/5 pb-2.5">
                  <p className="text-mist text-xs">{label}</p>
                  <p className="text-white text-sm break-all">{value}</p>
                </div>
              ))}
            </div>
            {uploading && (
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 mb-4">
                <p className="text-violet-400 text-xs">⏳ Mengunggah dokumen ke IPFS...</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-white/10 text-mist py-3 rounded-full text-sm">Edit</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-brand-gradient text-white font-semibold py-3 rounded-full disabled:opacity-50 text-sm">
                {loading ? 'Menyimpan...' : 'Simpan ke blockchain'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-7 text-center">
            <div className="w-14 h-14 bg-brand-gradient rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h2 className="font-heading text-xl font-semibold text-white mb-2">Rekam medis tersimpan</h2>
            {txHash && (
              <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-violet-400 text-xs underline break-all">
                Lihat di Etherscan
              </a>
            )}
            <button onClick={resetForm} className="mt-6 bg-brand-gradient text-white font-semibold px-6 py-2.5 rounded-full text-sm">
              Input baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputDiagnosis;