export const CONTRACT_ADDRESS = "0xed711Ff4173f105Fb31c0f58172e8D363f70d302";

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "string","name": "_idNumber","type": "string"},{"internalType": "uint8","name": "_role","type": "uint8"}],
    "name": "registerUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "_user","type": "address"}],
    "name": "getUser",
    "outputs": [{"internalType": "string","name": "idNumber","type": "string"},{"internalType": "uint8","name": "role","type": "uint8"},{"internalType": "bool","name": "isRegistered","type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllUsers",
    "outputs": [{"internalType": "address[]","name": "","type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "_patient","type": "address"}],
    "name": "getRecordsAdmin",
    "outputs": [
      {"internalType": "string[]","name": "complaints","type": "string[]"},
      {"internalType": "string[]","name": "diagnoses","type": "string[]"},
      {"internalType": "string[]","name": "therapies","type": "string[]"},
      {"internalType": "string[]","name": "cids","type": "string[]"},
      {"internalType": "bytes32[]","name": "hashes","type": "bytes32[]"},
      {"internalType": "address[]","name": "doctors","type": "address[]"},
      {"internalType": "uint256[]","name": "timestamps","type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "_user","type": "address"}],
    "name": "deactivateUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "_user","type": "address"}],
    "name": "reactivateUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "_doctor","type": "address"}],
    "name": "grantAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "_doctor","type": "address"}],
    "name": "revokeAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "_patient","type": "address"},{"internalType": "address","name": "_doctor","type": "address"}],
    "name": "checkAccess",
    "outputs": [{"internalType": "bool","name": "","type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "_patient","type": "address"}],
    "name": "getAuthorizedDoctors",
    "outputs": [{"internalType": "address[]","name": "","type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "_patient","type": "address"}],
    "name": "getAuthorizedDoctorsAdmin",
    "outputs": [{"internalType": "address[]","name": "","type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address","name": "_patient","type": "address"},
      {"internalType": "string","name": "_complaint","type": "string"},
      {"internalType": "string","name": "_diagnosis","type": "string"},
      {"internalType": "string","name": "_therapy","type": "string"},
      {"internalType": "string","name": "_ipfsCID","type": "string"},
      {"internalType": "bytes32","name": "_sha256Hash","type": "bytes32"}
    ],
    "name": "addMedicalRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "_patient","type": "address"}],
    "name": "getRecords",
    "outputs": [
      {"internalType": "string[]","name": "complaints","type": "string[]"},
      {"internalType": "string[]","name": "diagnoses","type": "string[]"},
      {"internalType": "string[]","name": "therapies","type": "string[]"},
      {"internalType": "string[]","name": "cids","type": "string[]"},
      {"internalType": "bytes32[]","name": "hashes","type": "bytes32[]"},
      {"internalType": "address[]","name": "doctors","type": "address[]"},
      {"internalType": "uint256[]","name": "timestamps","type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "_patient","type": "address"}],
    "name": "getRecordCount",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "","type": "address"}],
    "name": "users",
    "outputs": [{"internalType": "string","name": "idNumber","type": "string"},{"internalType": "enum RMETerdesentralisasi.Role","name": "role","type": "uint8"},{"internalType": "bool","name": "isRegistered","type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address","name": "","type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true,"internalType": "address","name": "user","type": "address"},{"indexed": false,"internalType": "enum RMETerdesentralisasi.Role","name": "role","type": "uint8"},{"indexed": false,"internalType": "uint256","name": "timestamp","type": "uint256"}],
    "name": "UserRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true,"internalType": "address","name": "patient","type": "address"},{"indexed": true,"internalType": "address","name": "doctor","type": "address"},{"indexed": false,"internalType": "uint256","name": "timestamp","type": "uint256"}],
    "name": "AccessGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true,"internalType": "address","name": "patient","type": "address"},{"indexed": true,"internalType": "address","name": "doctor","type": "address"},{"indexed": false,"internalType": "uint256","name": "timestamp","type": "uint256"}],
    "name": "AccessRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true,"internalType": "address","name": "patient","type": "address"},{"indexed": true,"internalType": "address","name": "doctor","type": "address"},{"indexed": false,"internalType": "uint256","name": "timestamp","type": "uint256"}],
    "name": "RecordAdded",
    "type": "event"
  }
];
