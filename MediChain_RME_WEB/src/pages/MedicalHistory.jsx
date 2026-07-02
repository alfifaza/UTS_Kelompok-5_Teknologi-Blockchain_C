import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { formatDate, computeSHA256FromBlob } from '../utils/helpers';
import { fetchFromIPFS, getIPFSUrl } from '../utils/ipfs';
import { generateMedicalRecordPDF } from '../utils/pdfGenerator';

const MedicalHistory = () => {
  const { contract, account, role } = useWeb3();
  const [searchParams] = useSearchParams();
  const queryPatient = searchParams.get('patient');
  const targetPatient = role === 'doctor' && queryPatient ? queryPatient : account;

  const [records, setRecords] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [verifyStatus, setVerifyStatus] = useState({});

  const loadRecords = useCallback(async () => {
    if (!contract || !targetPatient) return;
    setFetching(true);
    setError('');
    try {
      const result = await contract.getRecords(targetPatient);
      const [complaints, diagnoses, therapies, cids, hashes, doctors, timestamps] = result;
      setRecords(complaints.map((complaint, i) => ({
        id: i,
        complaint,
        diagnosis: diagnoses[i],
        therapy: therapies[i],
        cid: cids[i],
        hash: hashes[i],
        doctor: doctors[i],
        timestamp: timestamps[i],
      })));
    } catch (err) {
      setError('Anda tidak memiliki izin akses ke rekam medis ini.');
      setRecords([]);
    }
    setFetching(false);
  }, [contract, targetPatient]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const verifyRecord = useCallback(async (record) => {
    if (!record.cid) {
      setVerifyStatus(prev => ({ ...prev, [record.id]: 'no-file' }));
      return;
    }
    setVerifyStatus(prev => ({ ...prev, [record.id]: 'checking' }));
    try {
      const blob = await fetchFromIPFS(record.cid);
      const recalculatedHash = await computeSHA256FromBlob(blob);
      const isValid = recalculatedHash.toLowerCase() === record.hash.toLowerCase();
      setVerifyStatus(prev => ({ ...prev, [record.id]: isValid ? 'valid' : 'invalid' }));
    } catch (err) {
      console.error('Verifikasi gagal:', err);
      setVerifyStatus(prev => ({ ...prev, [record.id]: 'error' }));
    }
  }, []);

  useEffect(() => {
    records.forEach(rec => verifyRecord(rec));
  }, [records, verifyRecord]);

  const handleDownloadPDF = (record) => {
    generateMedicalRecordPDF(record, targetPatient);
  };

  const renderVerifyBadge = (recordId) => {
    const status = verifyStatus[recordId];
    if (status === 'checking') return <span className="text-amber-400 text-xs">⏳ Memverifikasi...</span>;
    if (status === 'valid') return <span className="text-emerald-400 text-xs font-medium">✅ Terverifikasi asli</span>;
    if (status === 'invalid') return <span className="text-red-400 text-xs font-medium">⚠️ Hash tidak cocok</span>;
    if (status === 'no-file') return <span className="text-mist text-xs">— Tidak ada dokumen</span>;
    if (status === 'error') return <span className="text-red-400 text-xs">Gagal memuat dari IPFS</span>;
    return null;
  };

  return (
    <div className="min-h-screen bg-ink pt-28 px-6 pb-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-violet-400 text-sm mb-1">Riwayat</p>
          <h1 className="font-heading text-3xl font-bold text-white">Rekam medis</h1>
          {role === 'doctor' && queryPatient && (
            <p className="text-mist mt-1 font-mono text-xs break-all">Pasien: {queryPatient}</p>
          )}
        </div>

        {fetching ? (
          <p className="text-mist text-sm text-center py-12">Memuat data dari blockchain...</p>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
            <p className="text-mist text-sm">Belum ada rekam medis tersimpan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((rec) => (
              <div key={rec.id} className="bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-heading font-semibold text-white">{rec.diagnosis}</p>
                  <div className="flex items-center gap-3">
                    {renderVerifyBadge(rec.id)}
                    <button
                      onClick={() => handleDownloadPDF(rec)}
                      className="bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                    >
                      Unduh PDF
                    </button>
                  </div>
                </div>
                <p className="text-mist text-xs mb-4">
                  oleh <span className="font-mono text-white">{rec.doctor.slice(0,6)}...{rec.doctor.slice(-4)}</span> · {formatDate(rec.timestamp)}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/[0.02] rounded-xl p-3">
                    <p className="text-mist text-xs mb-1">Keluhan</p>
                    <p className="text-white text-sm">{rec.complaint}</p>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-3">
                    <p className="text-mist text-xs mb-1">Terapi</p>
                    <p className="text-white text-sm">{rec.therapy || '—'}</p>
                  </div>
                </div>

                {rec.cid && (
                  <div className="border-t border-white/5 pt-3">
                    <p className="text-xs">
                      <span className="text-mist">Dokumen: </span>
                      <a href={getIPFSUrl(rec.cid)} target="_blank" rel="noopener noreferrer" className="text-violet-400 underline">
                        Lihat dokumen pendukung
                      </a>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;