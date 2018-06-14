var Registrations = artifacts.require("./Registrations.sol");

module.exports = function(deployer) {
  deployer.deploy(Registrations);
};
