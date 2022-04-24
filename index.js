require("dotenv").config();
const fs = require("fs");
const getOffers = require("./src/offers");
const Blockchain = require("./src/blockchain");
const config = JSON.parse(fs.readFileSync("./config.json"));
const wallets = JSON.parse(fs.readFileSync("./wallets.json"));

(async () => {
  for (const wallet of wallets) {
    console.log(`Starting payout process for node ${wallet.nodeId}`)
    const offers = await getOffers(config.payoutOnlyCompleted, wallet.nodeId);

    for (const blockchainName of Object.keys(offers)) {
      const totalOffers = offers[blockchainName].offers.length;
      console.log(
        `${totalOffers} offers found on ${blockchainName} blockchain`
      );
      if (totalOffers <= 0) continue;
      const blockchain = new Blockchain({
        chainId: offers[blockchainName].chainId,
        blockchainName,
        rpc: config.blockchain[blockchainName].rpc,
        publicKey: wallet.publicKey,
        privateKey: Buffer.from(wallet.privateKey, "hex"),
        hubContractAddress:
          config.blockchain[blockchainName].hubContractAddress,
        gasStation: config.blockchain[blockchainName].gasStation,
      });

      console.log(
        "--------------------------------------------------------------------"
      );
      for (const offerIndex in offers[blockchainName].offers) {
        const offer = offers[blockchainName].offers[offerIndex];
        console.log(
          `${blockchainName} offer ${Number(offerIndex) + 1} / ${totalOffers}`
        );
        console.log(
          "--------------------------------------------------------------------"
        );
        const serializedTx = await blockchain.prepareTransaction(offer);
        const receipt = await blockchain.sendSignedTransaction(serializedTx);

        console.log(`payout transaction successfull : ${receipt.status}`);
        console.log(`payout transaction hash : ${receipt.transactionHash}`);

        console.log(
          "--------------------------------------------------------------------"
        );
      }
    }
  }
  process.exit();
})();
