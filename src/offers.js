const axios = require("axios");
const config = require("../config.json")

module.exports = offers = async (nodeId) => {
  let offers = {};
  if(config.blockchain.ethereum.enabled) {
    offers.ethereum = { chainId: 1, offers: [] }
  }
  if(config.blockchain.gnosis.enabled) {
    offers.gnosis = { chainId: 100, offers: [] }
  }
  if(config.blockchain.polygon.enabled) {
    offers.polygon = { chainId: 137, offers: [] }
  }

  const offersInfo = (
    await axios.get(
      `https://v5api.othub.info/api/nodes/DataHolder/${nodeId}/jobs`
    )
  ).data;

  for (const offer of offersInfo) {
    if (
      !config.blockchain[offer.BlockchainName.toLowerCase()].enabled ||
      !offer.CanPayout ||
      (config.payoutOnlyCompleted && offer.Status.toLowerCase() !== "completed")
    )
      continue;
    let o = {
      identity: offer.Identity,
      offerId: offer.OfferId,
    };

    switch (offer.BlockchainID) {
      case 1:
        offers.ethereum.offers.push(o);
        break;
      case 2:
        offers.gnosis.offers.push(o);
        break;
      case 3:
        offers.polygon.offers.push(o);
        break;
      default:
        throw Error(`Unknown blockchain id ${offer.BlockchainID}`);
    }
  }

  return offers;
};
