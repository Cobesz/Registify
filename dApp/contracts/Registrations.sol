pragma solidity ^0.4.19;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract Registrations is Ownable {

    using SafeMath for uint256;

    event NewRegistration(uint registrationId, string title, string author, uint creationTime);

    struct Registration {
        string title;
        string author;
        uint creationTime;
        uint fingerprint;
    }

    Registration[] public registrations;

    // for file hashing
    uint fingerprint = uint(keccak256("Genesis"));

    mapping(uint => address) public registrationToOwner;
    mapping(address => uint) ownerRegistrationCount;

    constructor() {
        ownerRegistrationCount[address(0xA7b2ACE1f4cd34AF34A29151Ff1a7e74e5D39Eb5)] = 0;
        createRegistration(address(0xA7b2ACE1f4cd34AF34A29151Ff1a7e74e5D39Eb5), "Genesis", "Cas", fingerprint);

    }

    function getRegistrations(address addr) public view returns (uint) {
        return ownerRegistrationCount[addr];
    }


    function createRegistration(address account, string title, string author, uint fingerprint) internal returns (uint){

        Registration memory registration = Registration({
            title : title,
            author : author,
            creationTime : uint32(now),
            fingerprint : fingerprint
            });
        // first item in array is what we added, so -1 to select it.
        uint id = registrations.push(registration) - 1;
        //        uint id = registrations.push(Registration({title : title, author : author, creationTime : uint32(now), fingerprint : fingerprint})) - 1;
        registrationToOwner[id] = account;
        ownerRegistrationCount[account]++;
        NewRegistration(id, title, author, now);

        return id;
    }

    function register(address account, string title, string author, uint fingerprint) external returns (uint){
        uint id = createRegistration(msg.sender, title, author, uint(fingerprint));
        return id;
    }


    function viewRegistration(uint index, address addr) external view returns (uint id, string title, string author, uint creationTime, uint fingerprint) {

        id = 0;
        uint count = 0;
        bool found = false;

        for (id; id <= registrations.length; id++) {
            if (registrationToOwner[id] == addr) {
                if (count == index) {
                    Registration memory registration = registrations[id];
                    title = registration.title;
                    author = registration.author;
                    creationTime = registration.creationTime;
                    fingerprint = registration.fingerprint;
                    found = true;
                    break;
                }
                count++;
            }
        }
        if (!found) {
            id = 0;
            return;
        }
    }

    function getRegistrationCount(address addr) external view returns (uint){
        return ownerRegistrationCount[addr];
    }
}
