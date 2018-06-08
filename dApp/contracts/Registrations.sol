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

    mapping(uint => address) public registrationToOwner;
    mapping(address => uint) ownerRegistrationCount;

    function createRegistration(string title, string author, uint fingerprint) internal {
        // first item in array is what we added, so -1 to select it.
        uint id = registrations.push(Registration(title, author, uint32(now), fingerprint)) - 1;
        registrationToOwner[id] = msg.sender;
        ownerRegistrationCount[msg.sender]++;
        NewRegistration(id, title, author, now);
    }
}