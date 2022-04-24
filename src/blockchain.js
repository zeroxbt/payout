const axios = require("axios");
const fs = require("fs");
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const BN = require("bn.js");
const Common = require("ethereumjs-common");
const { txutils } = require("eth-lightwallet");
const { normalizeHex, denormalizeHex } = require("../utils");

class Blockchain {
  constructor(config) {
    this.chainId = config.chainId;
    this.blockchainName = config.blockchainName;
    this.rpc = config.rpc;
    this.publicKey = config.publicKey;
    this.privateKey = config.privateKey;
    this.web3 = new Web3(
      this.rpc.startsWith("wss")
        ? new Web3.providers.WebsocketProvider(this.rpc)
        : new Web3.providers.HttpProvider(this.rpc)
    );
    this.hubContractAddress = config.hubContractAddress;
    this.gasStation = config.gasStation;
  }

  async gasLimit(contract, identity, offerId) {
    const gasLimit = await contract.methods
      .payOut(identity, offerId)
      .estimateGas({ from: this.publicKey });
    console.log(`gas Limit : ${gasLimit}`);
    return gasLimit;
  }

  async gasPrice() {
    const response = (await axios.get(this.gasStation)).data;
    let gasPrice;
    switch (this.chainId) {
      case 1:
        gasPrice = response.safeLow;
        break;
      case 100:
        gasPrice = response.slow;
        break;
      case 137:
        gasPrice = response.safeLow.maxFee;
        break;
      default:
        throw Error(`Unknown blockchain id ${this.chainId}`);
    }
    console.log(`gas price : ${Math.floor(gasPrice * 1e9)}`);
    return gasPrice;
  }

  async prepareTransaction(offer) {
    const { holdingContract, holdingContractAbi, holdingContractAddress } =
      await this.HoldingContract();

    const identity = offer.identity;
    console.log(`identity : ${identity}`);

    const offerId = this.web3.utils.toBN(offer.offerId);
    console.log(`offerId : ${offer.offerId}`);

    const gasLimit = await this.gasLimit(holdingContract, identity, offerId);
    const gasPrice = await this.gasPrice();

    const newTransaction = {
      contractAbi: holdingContractAbi,
      method: "payOut",
      args: [identity, offerId],
      options: {
        nonce: await this.web3.eth.getTransactionCount(this.publicKey),
        to: holdingContractAddress,
        gasLimit: this.web3.utils.toHex(gasLimit),
        gasPrice: this.web3.utils.toHex(Math.floor(gasPrice * 1e9)),
      },
    };

    this.checkBalance(newTransaction);

    const rawTx = txutils.functionTx(
      newTransaction.contractAbi,
      newTransaction.method,
      newTransaction.args,
      newTransaction.options
    );
    const customCommon = Common.default.forCustomChain(
      "mainnet",
      {
        name: this.blockchainName,
        networkId: this.chainId,
        chainId: this.chainId,
      },
      "petersburg"
    );
    const transaction = new Tx(rawTx, { common: customCommon });
    transaction.sign(this.privateKey);
    const serializedTx = normalizeHex(transaction.serialize().toString("hex"));
    return serializedTx;
  }

  async sendSignedTransaction(serializedTx) {
    return await this.web3.eth.sendSignedTransaction(serializedTx);
  }

  async checkBalance(newTransaction) {
    const balance = await this.web3.eth.getBalance(this.publicKey);

    const currentBalance = new BN(balance, 10);
    const requiredAmount = new BN(300000).imul(
      new BN(denormalizeHex(newTransaction.options.gasPrice), 16)
    );
    const totalPriceBN = new BN(
      denormalizeHex(newTransaction.options.gasPrice),
      16
    ).imul(new BN(denormalizeHex(newTransaction.options.gasLimit), 16));

    if (currentBalance.lt(totalPriceBN)) {
      throw Error(
        `ETH balance lower (${currentBalance.toString()}) than transaction cost (${totalPriceBN.toString()}).`
      );
    }
    if (currentBalance.lt(requiredAmount)) {
      console.log(
        `ETH balance running low! Your balance: ${currentBalance.toString()}  wei, while minimum required is: ${requiredAmount.toString()} wei`
      );
    }
    console.log(
      `wallet balance : ${this.web3.utils.fromWei(currentBalance, "ether")}`
    );
    console.log(
      `total price for tx : ${this.web3.utils.fromWei(totalPriceBN, "ether")}`
    );
  }

  async HoldingContract() {
    const hubContractAddress = this.hubContractAddress;
    const hubContractAbi = JSON.parse(fs.readFileSync("abis/hub.json"));
    const hubContract = new this.web3.eth.Contract(
      hubContractAbi,
      hubContractAddress
    );

    const holdingContractAbi = JSON.parse(fs.readFileSync("abis/holding.json"));
    const holdingContractAddress = await hubContract.methods
      .getContractAddress("Holding")
      .call({
        from: this.publicKey,
      });

    const holdingContract = new this.web3.eth.Contract(
      holdingContractAbi,
      holdingContractAddress
    );

    return { holdingContract, holdingContractAbi, holdingContractAddress };
  }
}

module.exports = Blockchain;
