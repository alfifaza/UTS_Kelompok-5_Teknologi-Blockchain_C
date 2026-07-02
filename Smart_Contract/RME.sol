// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RMETerdesentralisasi {

    enum Role { None, Patient, Doctor, Admin }

    struct User {
        string idNumber;
        Role role;
        bool isRegistered;
    }

    struct MedicalRecord {
        string complaint;
        string diagnosis;
        string therapy;
        string ipfsCID;
        bytes32 sha256Hash;
        address doctor;
        address patient;
        uint256 timestamp;
    }

    address public owner; // deployer = super admin pertama
    mapping(address => User) public users;
    mapping(address => MedicalRecord[]) private patientRecords;
    mapping(address => mapping(address => bool)) private accessPermissions;
    mapping(address => address[]) private authorizedDoctors;
    address[] private allUsers; // daftar semua user terdaftar

    event UserRegistered(address indexed user, Role role, uint256 timestamp);
    event AccessGranted(address indexed patient, address indexed doctor, uint256 timestamp);
    event AccessRevoked(address indexed patient, address indexed doctor, uint256 timestamp);
    event RecordAdded(address indexed patient, address indexed doctor, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "Anda belum terdaftar");
        _;
    }

    modifier onlyDoctor() {
        require(users[msg.sender].role == Role.Doctor, "Hanya dokter");
        _;
    }

    modifier onlyPatient() {
        require(users[msg.sender].role == Role.Patient, "Hanya pasien");
        _;
    }

    modifier onlyAdmin() {
        require(users[msg.sender].role == Role.Admin, "Hanya admin");
        _;
    }

    modifier hasAccess(address patient) {
        require(
            accessPermissions[patient][msg.sender] ||
            msg.sender == patient ||
            users[msg.sender].role == Role.Admin,
            "Tidak memiliki izin akses"
        );
        _;
    }

    // ===== REGISTRASI =====

    function registerUser(string memory _idNumber, uint8 _role) public {
        require(!users[msg.sender].isRegistered, "Sudah terdaftar");
        require(_role >= 1 && _role <= 3, "Role tidak valid");

        users[msg.sender] = User({
            idNumber: _idNumber,
            role: Role(_role),
            isRegistered: true
        });

        allUsers.push(msg.sender);
        emit UserRegistered(msg.sender, Role(_role), block.timestamp);
    }

    function getUser(address _user) public view returns (
        string memory idNumber,
        uint8 role,
        bool isRegistered
    ) {
        User memory u = users[_user];
        return (u.idNumber, uint8(u.role), u.isRegistered);
    }

    // ===== ADMIN FUNCTIONS =====

    // Admin: lihat semua user terdaftar
    function getAllUsers() public view onlyAdmin returns (address[] memory) {
        return allUsers;
    }

    // Admin: lihat rekam medis siapapun tanpa perlu izin
    function getRecordsAdmin(address _patient) public view onlyAdmin returns (
        string[] memory complaints,
        string[] memory diagnoses,
        string[] memory therapies,
        string[] memory cids,
        bytes32[] memory hashes,
        address[] memory doctors,
        uint256[] memory timestamps
    ) {
        return _getRecordsInternal(_patient);
    }

    // Admin: hapus/nonaktifkan user (set isRegistered = false)
    function deactivateUser(address _user) public onlyAdmin {
        require(users[_user].isRegistered, "User tidak terdaftar");
        require(_user != msg.sender, "Admin tidak bisa nonaktifkan diri sendiri");
        users[_user].isRegistered = false;
    }

    // Admin: aktifkan kembali user
    function reactivateUser(address _user) public onlyAdmin {
        require(!users[_user].isRegistered, "User sudah aktif");
        users[_user].isRegistered = true;
    }

    // Admin: lihat daftar dokter yang diotorisasi pasien tertentu
    function getAuthorizedDoctorsAdmin(address _patient) public view onlyAdmin returns (address[] memory) {
        return authorizedDoctors[_patient];
    }

    // ===== IZIN AKSES =====

    function grantAccess(address _doctor) public onlyRegistered onlyPatient {
        require(users[_doctor].role == Role.Doctor, "Bukan dokter terdaftar");
        require(!accessPermissions[msg.sender][_doctor], "Akses sudah diberikan");

        accessPermissions[msg.sender][_doctor] = true;
        authorizedDoctors[msg.sender].push(_doctor);

        emit AccessGranted(msg.sender, _doctor, block.timestamp);
    }

    function revokeAccess(address _doctor) public onlyRegistered onlyPatient {
        require(accessPermissions[msg.sender][_doctor], "Akses tidak ada");

        accessPermissions[msg.sender][_doctor] = false;

        address[] storage doctors = authorizedDoctors[msg.sender];
        for (uint i = 0; i < doctors.length; i++) {
            if (doctors[i] == _doctor) {
                doctors[i] = doctors[doctors.length - 1];
                doctors.pop();
                break;
            }
        }

        emit AccessRevoked(msg.sender, _doctor, block.timestamp);
    }

    function checkAccess(address _patient, address _doctor) public view returns (bool) {
        return accessPermissions[_patient][_doctor];
    }

    function getAuthorizedDoctors(address _patient) public view returns (address[] memory) {
        return authorizedDoctors[_patient];
    }

    // ===== REKAM MEDIS =====

    function addMedicalRecord(
        address _patient,
        string memory _complaint,
        string memory _diagnosis,
        string memory _therapy,
        string memory _ipfsCID,
        bytes32 _sha256Hash
    ) public onlyRegistered onlyDoctor hasAccess(_patient) {
        patientRecords[_patient].push(MedicalRecord({
            complaint: _complaint,
            diagnosis: _diagnosis,
            therapy: _therapy,
            ipfsCID: _ipfsCID,
            sha256Hash: _sha256Hash,
            doctor: msg.sender,
            patient: _patient,
            timestamp: block.timestamp
        }));

        emit RecordAdded(_patient, msg.sender, block.timestamp);
    }

    function _getRecordsInternal(address _patient) internal view returns (
        string[] memory complaints,
        string[] memory diagnoses,
        string[] memory therapies,
        string[] memory cids,
        bytes32[] memory hashes,
        address[] memory doctors,
        uint256[] memory timestamps
    ) {
        MedicalRecord[] memory records = patientRecords[_patient];
        uint len = records.length;

        complaints = new string[](len);
        diagnoses = new string[](len);
        therapies = new string[](len);
        cids = new string[](len);
        hashes = new bytes32[](len);
        doctors = new address[](len);
        timestamps = new uint256[](len);

        for (uint i = 0; i < len; i++) {
            complaints[i] = records[i].complaint;
            diagnoses[i] = records[i].diagnosis;
            therapies[i] = records[i].therapy;
            cids[i] = records[i].ipfsCID;
            hashes[i] = records[i].sha256Hash;
            doctors[i] = records[i].doctor;
            timestamps[i] = records[i].timestamp;
        }
    }

    function getRecords(address _patient) public view hasAccess(_patient) returns (
        string[] memory complaints,
        string[] memory diagnoses,
        string[] memory therapies,
        string[] memory cids,
        bytes32[] memory hashes,
        address[] memory doctors,
        uint256[] memory timestamps
    ) {
        return _getRecordsInternal(_patient);
    }

    function getRecordCount(address _patient) public view returns (uint256) {
        return patientRecords[_patient].length;
    }

    function verifyIntegrity(
        address _patient,
        uint256 _recordIndex,
        bytes32 _hashToVerify
    ) public view hasAccess(_patient) returns (bool) {
        require(_recordIndex < patientRecords[_patient].length, "Index tidak valid");
        return patientRecords[_patient][_recordIndex].sha256Hash == _hashToVerify;
    }
}
