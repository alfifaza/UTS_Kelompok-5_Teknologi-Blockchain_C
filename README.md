# MediChain - Website Rekam Medis Elektronik Berbasis Blockchain

Platform rekam medis elektronik terdesentralisasi yang mengintegrasikan teknologi *blockchain* dengan penyimpanan *off-chain* berbasis IPFS untuk menjamin keamanan, privasi, dan kedaulatan data kesehatan pasien.

**LINK WEBSITE TERDEPLOY DI VERCEL :** [MEDICHAIN - RME](https://kelompok-5-teknologi-blockchain-c.vercel.app)

**LINK LIVE DEMO YOUTUBE :** [LIVE DEMO MEDICHAIN](https://youtu.be/XrKVT3AunU8?si=nhyWD3mY7R6_ekSC) 

###### Ringkasan Proyek
MediChain mengintegrasikan teknologi *blockchain* (Solidity) dengan penyimpanan *off-chain* (IPFS) untuk memastikan transparansi dan kedaulatan data kesehatan. Pasien memiliki kontrol penuh atas hak akses rekam medis mereka melalui mekanisme otorisasi *on-chain* yang ketat.

###### Fitur Utama
* **Manajemen Identitas Terstruktur**: Pendaftaran dengan pembagian peran (Pasien, Dokter, Admin).
* **Otorisasi On-Chain**: Pasien dapat memberikan (`grantAccess`) dan mencabut (`revokeAccess`) izin akses kepada dokter secara langsung.
* **Integritas Data**: Menggunakan `sha256Hash` dan IPFS CID untuk menjamin data medis bersifat *tamper-proof*.
* **Kontrol Administratif**: Admin memiliki akses untuk moderasi pengguna (`deactivateUser`/`reactivateUser`) dan pengawasan sistem.

###### Tech Stack
* **Blockchain**: Solidity (Smart Contract `RME.sol`)
* **Frontend**: React.js & Ethers.js
* **Storage**: IPFS (Off-chain)
* **Wallet**: MetaMask (Ethereum Sepolia Tesnet Network)

###### Arsitektur Smart Contract (RME.sol)
* **`onlyRegistered`**: Memastikan hanya pengguna yang terdaftar yang dapat berinteraksi.
* **`onlyDoctor` / `onlyPatient` / `onlyAdmin`**: Membatasi fungsi berdasarkan *role* pengguna.
* **`hasAccess(address patient)`**: *Modifier* keamanan utama yang memvalidasi izin akses dokter atau admin terhadap data pasien sebelum data diakses.

###### Fungsi Smart Contract (RME.sol)
Kontrak pintar ini berfungsi sebagai *single source of truth*. Fungsi inti meliputi:
* **Registrasi**: `registerUser()` untuk pendaftaran pengguna baru.
* **Manajemen Akses**: `grantAccess()`, `revokeAccess()`, dan `checkAccess()`.
* **Rekam Medis**: 
    * `addMedicalRecord()`: Penambahan data oleh dokter terotorisasi.
    * `getRecords()`: Pengambilan riwayat medis dengan pengecekan `hasAccess` modifier.
    * `verifyIntegrity()`: Verifikasi hash untuk memastikan data tidak berubah.
* **Fungsi Admin**: `deactivateUser()`, `reactivateUser()`, dan `getRecordsAdmin()`.

###### Cara Menjalankan Project
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) dan mengonfigurasi [MetaMask](https://metamask.io/).

1. **Clone Repository**
   ```bash
   git clone [https://github.com/alfifaza/Kelompok-5_Teknologi-Blockchain_C](https://github.com/alfifaza/Kelompok-5_Teknologi-Blockchain_C)
   cd MediChain_RME_WEB

2. **Install Dependencies**
   ```bash
   npm install
   
4. **Jalankan Aplikasi**
   ```bash
   npm start
  Akses aplikasi di browser: http://localhost:3000.
   
***Catatan Penting***
Setiap interaksi yang mengubah status pada ledger (seperti registrasi, penambahan rekam medis, dan pengaturan akses) memerlukan gas fee. Pastikan wallet Anda memiliki saldo testnet (Sepolia) yang cukup.

## PENJELASAN
- DIAGRAM RME (kumpulan diagram flowchart, class diagram, dst.)
- MEDICHAIN RME WEB (kumpulan codingan web MEDICHAIN)
- SMART CONTRACT (file dari Remix IDE ada RME.sol dan contractABI.js)
- UAS (file laporan UAS, project charter, ppt)
- UTS (file laporan UTS, project charter, ppt)
