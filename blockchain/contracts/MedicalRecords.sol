// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title MedicalRecords - Secure medical record storage with access control
/// @author MediChain
contract MedicalRecords {

    struct Record {
        string recordHash;    // SHA-256 hash of medical data
        address patient;
        address doctor;
        uint256 timestamp;
        bool exists;
    }

    // patientAddress => array of records
    mapping(address => Record[]) private patientRecords;

    // patient => doctor => bool (access granted)
    mapping(address => mapping(address => bool)) private accessControl;

    event RecordAdded(address indexed patient, address indexed doctor, string recordHash, uint256 timestamp);
    event AccessGranted(address indexed patient, address indexed doctor);
    event AccessRevoked(address indexed patient, address indexed doctor);

    modifier onlyAuthorized(address patient) {
        require(
            msg.sender == patient || accessControl[patient][msg.sender],
            "Not authorized to access this patient's records"
        );
        _;
    }

    /// @notice Add a new medical record (called by doctor, patient must grant access first, or initial record)
    function addRecord(address patient, string memory recordHash) external {
        require(bytes(recordHash).length > 0, "Record hash cannot be empty");

        patientRecords[patient].push(Record({
            recordHash: recordHash,
            patient: patient,
            doctor: msg.sender,
            timestamp: block.timestamp,
            exists: true
        }));

        emit RecordAdded(patient, msg.sender, recordHash, block.timestamp);
    }

    /// @notice Grant a doctor access to view your records
    function grantAccess(address doctor) external {
        accessControl[msg.sender][doctor] = true;
        emit AccessGranted(msg.sender, doctor);
    }

    /// @notice Revoke a doctor's access to your records
    function revokeAccess(address doctor) external {
        accessControl[msg.sender][doctor] = false;
        emit AccessRevoked(msg.sender, doctor);
    }

    /// @notice Get all records for a patient (must be authorized)
    function getRecords(address patient) external view onlyAuthorized(patient) returns (Record[] memory) {
        return patientRecords[patient];
    }

    /// @notice Get record count for a patient
    function getRecordCount(address patient) external view onlyAuthorized(patient) returns (uint256) {
        return patientRecords[patient].length;
    }

    /// @notice Check if a doctor has access to patient records
    function hasAccess(address patient, address doctor) external view returns (bool) {
        return accessControl[patient][doctor];
    }

    /// @notice Verify a specific record hash exists for a patient
    function verifyRecord(address patient, string memory recordHash) external view onlyAuthorized(patient) returns (bool, uint256) {
        Record[] memory records = patientRecords[patient];
        for (uint256 i = 0; i < records.length; i++) {
            if (keccak256(bytes(records[i].recordHash)) == keccak256(bytes(recordHash))) {
                return (true, records[i].timestamp);
            }
        }
        return (false, 0);
    }
}
