// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";


// Import libraries we need.
import {default as Web3} from 'web3';
import {default as contract} from 'truffle-contract'
import {default as BigNumber} from 'bignumber.js'
import {default as CryptoJS} from 'crypto-js'

// Import our contract artifacts and turn them into usable abstractions.
import Registrations_artifacts from '../../build/contracts/Registrations.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var Registrations = contract(Registrations_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

var registrations = [];

window.App = {
    start: function () {
        var self = this;

        // Bootstrap the MetaCoin abstraction for Use.
        Registrations.setProvider(web3.currentProvider);

        // Get the initial account balance so it can be displayed.
        web3.eth.getAccounts(function (err, accs) {
            if (err != null) {
                alert("There was an error fetching your accounts.");
                return;
            }

            if (accs.length == 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }

            accounts = accs;
            account = accounts[0];

            setInterval(function () {
                self.refreshRegistrations();
            }, 5000);
        });
    },

    setStatus: function (message) {
        var status = document.getElementById("status");
        status.innerHTML = message;
    },

    refreshRegistrations: function () {
        var self = this;

        var regis;
        Registrations.deployed().then(function (instance) {
            regis = instance;
            return regis.getRegistrations.call(account, {from: account});
        }).then(function (value) {
            var registration_element = document.getElementById("registrations");

            registration_element.innerHTML = value;

            // registrations_element.innerHTML = "0";
        }).catch(function (e) {
            console.log(e);
            self.setStatus("Error getting balance; see log.");
        });

        Registrations.deployed().then(function (instance) {
            return instance.getRegistrationCount.call(account, {from: account});
        }).then(function (value) {
            //count is one, there is always a genesis block.
            let count = 1;
            for (let i = 0; i < value; i++) {

                Registrations.deployed().then(function (instance) {
                    return instance.viewRegistration.call(i, account, {from: account});
                }).then(function (value) {
                    let id = value[0].toString();
                    let title = value[1].toString();
                    let author = value[2].toString();
                    let creationTime = value[3].toString();
                    let fingerprint = value[4].toString(16);
                    count++;
                })
            }
        });
    },

    createRegistration: function () {

        let title = document.getElementById("title").value;
        let author = document.getElementById("author").value;
        let file = document.getElementById("file").files.item(0);

        let fileReader = new FileReader();
        let fingerprint;

        fileReader.onload = (e) => {
            fingerprint = new BigNumber(CryptoJS.SHA256(CryptoJS.lib.WordArray.create(fileReader.result)).toString(), 16);


            Registrations.deployed()
                .then(function (instance) {

                    return instance.register(account, title, author, fingerprint.toString(10), {from: account});
                })
                .then(function (value) {
                    //call getRegistrations to update the count in HTML.
                    Registrations.deployed().then(function (instance) {
                        return instance.getRegistrations.call(account, {from: account});
                    }).then(function (value) {
                        var registration_element = document.getElementById("registrations");

                    }).catch(function (e) {
                        console.log(e);
                        self.setStatus("Error getting balance; see log.");
                    });


                    //modal
                    // Get the modal
                    var modal = document.getElementById('createModal');

                    // Get the button that opens the modal
                    // var btn = document.getElementById("createRegistrationButton");

                    // Get the <span> element that closes the modal
                    var span = document.getElementById("createClose");

                    // When registration completes, open the modal
                    modal.style.display = "block";
                    $("#createTitle").html(title);
                    $("#createAuthor").html(author);
                    $("#createFilehash").html(fingerprint.toString(16));
                    $("#createTXHash").html(value.tx);

                    // When the user clicks on <span> (x), close the modal
                    span.onclick = function () {
                        modal.style.display = "none";
                    };

                    // When the user clicks anywhere outside of the modal, close it
                    window.onclick = function (event) {
                        if (event.target == modal) {
                            modal.style.display = "none";
                        }
                    };

                }).catch(function (e) {
                console.log(e);
                console.log('Uh Oh');
                self.setStatus("Uh oh");
            });

        };
        fileReader.readAsArrayBuffer(file);
    },

    viewRegistration: function () {

        let file = document.getElementById("viewFile").files.item(0);

        let fileReader = new FileReader();

        fileReader.onload = (e) => {
            let fingerprintCheck = new BigNumber(CryptoJS.SHA256(CryptoJS.lib.WordArray.create(fileReader.result)).toString(), 16).toString(16);
            // console.log(fingerprintCheck.toString(10));

            Registrations.deployed().then(function (instance) {
                return instance.getRegistrationCount.call(account, {from: account});
            }).then(function (value) {
                // console.log(value.toString(16));

                //count is one, there is always a genesis block.
                let count = 1;
                for (let i = 0; i < value; i++) {

                    Registrations.deployed().then(function (instance) {
                        return instance.viewRegistration.call(i, account, {from: account});
                    }).then(function (value) {
                        let id = value[0].toString();
                        let title = value[1].toString();
                        let author = value[2].toString();
                        let creationTime = value[3].toString();
                        let fingerprint = value[4].toString(16);

                        console.log(fingerprintCheck.toString(10));
                        if (fingerprintCheck.toString(10) === fingerprint) {
                            console.log('hoi');
                            console.log('de ID is: ' + id);
                            console.log('de titel is: ' + title);
                            console.log('de auteur is: ' + author);
                            console.log('de timestamp is: ' + creationTime);
                            console.log('de hash van het bestand is: ' + fingerprint);

                            let date = new Date(creationTime*1000)
                            //modal
                            // Get the modal
                            var modal = document.getElementById('checkModal');

                            // Get the button that opens the modal
                            // var btn = document.getElementById("createRegistrationButton");

                            // Get the <span> element that closes the modal
                            var span = document.getElementById("checkClose");

                            // When registration completes, open the modal
                            modal.style.display = "block";
                            $("#checkTitle").html(title);
                            $("#checkAuthor").html(author);
                            $("#checkFilehash").html(fingerprint.toString(16));
                            $("#checkTimeStamp").html(date);

                            // When the user clicks on <span> (x), close the modal
                            span.onclick = function () {
                                modal.style.display = "none";
                            };

                            // When the user clicks anywhere outside of the modal, close it
                            window.onclick = function (event) {
                                if (event.target == modal) {
                                    modal.style.display = "none";
                                }
                            };


                        }
                        count++;
                    })
                }
            });
        };
        fileReader.readAsArrayBuffer(file);
    }
};

window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
    }

    $("#file").change(function () {
        console.log(this);
        var filename = this.files[0].name;
        $("#file-upload-button").html(filename);
    });

    $("#viewFile").change(function () {
        console.log(this);
        var filename = this.files[0].name;
        $("#check-file-upload-button").html(filename);
    });

    App.start();
});
