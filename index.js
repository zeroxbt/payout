require("dotenv").config();
const fs = require("fs");
const getOffers = require("./src/offers");
const Blockchain = require("./src/blockchain");
const config = JSON.parse(fs.readFileSync("./config.json"));

(async () => {
  const offers = await getOffers(config.payoutOnlyCompleted);

  for (const blockchainName of Object.keys(offers)) {
    const totalOffers = offers[blockchainName].offers.length;
    if (totalOffers <= 0) continue;
    console.log(`${totalOffers} offers found on ${blockchainName} blockchain`)
    const blockchain = new Blockchain({
      chainId: offers[blockchainName].chainId,
      blockchainName,
      rpc: config.blockchain[blockchainName].rpc,
      publicKey: process.env.PUBLIC_KEY,
      privateKey: Buffer.from(process.env.PRIVATE_KEY, "hex"),
      hubContractAddress: config.blockchain[blockchainName].hubContractAddress,
      gasStation: config.blockchain[blockchainName].gasStation,
    });

    console.log("--------------------------------------------------------------------")
    for (const offerIndex in offers[blockchainName].offers) {
      const offer = offers[blockchainName].offers[offerIndex];
      console.log(`${blockchainName} offer ${offerIndex + 1} / ${totalOffers}`)
      console.log("--------------------------------------------------------------------")
      const serializedTx = await blockchain.prepareTransaction(offer);
      const receipt = await blockchain.sendSignedTransaction(serializedTx);

      console.log(`payout transaction successfull : ${receipt.status}`);
      console.log(`payout transaction hash : ${receipt.transactionHash}`);

      console.log("--------------------------------------------------------------------")
    }
  }
  process.exit()
})();
