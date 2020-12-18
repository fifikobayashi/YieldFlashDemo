require('dotenv').config();
var HDWalletProvider = require("truffle-hdwallet-provider");
module.exports = {
     networks: {
       development: {
         host: "127.0.0.1",
         port: 7545,
         network_id: "7775"
       },
       kovan: {
         provider: function() {
           return new HDWalletProvider(process.env.KOVAN_PRTK, process.env.KOVAN_PROVIDER)
         },
         network_id: "42",
         gas: 4000000      //make sure this gas allocation isn't over 4M, which is the max
      }
    },
    compilers: {
      solc: {
        version: "0.6.10" // ex:  "0.4.20". (Default: Truffle's installed solc)
      }
    }
};
