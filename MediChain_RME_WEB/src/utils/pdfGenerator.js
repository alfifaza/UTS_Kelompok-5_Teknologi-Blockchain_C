import jsPDF from 'jspdf';
import { formatDate } from './helpers';

export const generateMedicalRecordPDF = (record, patientAddress) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFillColor(124, 92, 255);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('MediChain', 15, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Rekam Medis Elektronik Terdesentralisasi', 15, 23);
  doc.text('Ethereum Sepolia Testnet', 15, 29);

  y = 48;

  doc.setTextColor(20, 20, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`Rekam Medis #${record.id + 1}`, 15, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 120);
  doc.text(`${formatDate(record.timestamp)}`, 15, y);
  y += 8;

  doc.setDrawColor(220, 220, 230);
  doc.line(15, y, pageWidth - 15, y);
  y += 10;

  const addField = (label, value, isBold = false) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(124, 92, 255);
    doc.text(label.toUpperCase(), 15, y);
    y += 6;

    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(isBold ? 13 : 11);
    doc.setTextColor(20, 20, 40);
    const lines = doc.splitTextToSize(value || '-', pageWidth - 30);
    doc.text(lines, 15, y);
    y += (lines.length * (isBold ? 6 : 5.5)) + 8;
  };

  addField('Diagnosa', record.diagnosis, true);
  addField('Keluhan Pasien', record.complaint);
  addField('Terapi / Resep', record.therapy);

  y += 2;
  doc.setDrawColor(220, 220, 230);
  doc.line(15, y, pageWidth - 15, y);
  y += 10;

  // Info administratif (lebih kecil)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 160);
  doc.text('INFORMASI ADMINISTRATIF', 15, y);
  y += 6;

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 130);
  doc.text(`Pasien: ${patientAddress}`, 15, y); y += 4.5;
  doc.text(`Dokter: ${record.doctor}`, 15, y); y += 4.5;
  if (record.cid) {
    doc.text(`Dokumen IPFS CID: ${record.cid}`, 15, y); y += 4.5;
  }
  y += 4;

  // Footer note
  doc.setFillColor(240, 247, 255);
  doc.roundedRect(15, y, pageWidth - 30, 20, 3, 3, 'F');
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 100);
  const note = doc.splitTextToSize(
    'Data ini tercatat permanen di blockchain Ethereum Sepolia dan tidak dapat diubah secara sepihak.',
    pageWidth - 45
  );
  doc.text(note, 20, y);

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 160);
  doc.text(`Dokumen dibuat otomatis pada ${new Date().toLocaleString('id-ID')}`, 15, pageHeight - 12);
  doc.text('MediChain — Sistem RME Terdesentralisasi', 15, pageHeight - 8);

  const fileName = `Rekam-Medis-${record.id + 1}-${record.diagnosis.slice(0, 20).replace(/\s/g, '-')}.pdf`;
  doc.save(fileName);
};