const axios = require("axios");

module.exports = offers = async (payoutOnlyCompleted) => {
  let offers = {
    ethereum: { chainId: 1, offers: [] },
    gnosis: { chainId: 100, offers: [] },
    polygon: { chainId: 137, offers: [] },
  };

  const offersInfo = (
    await axios.get(
      `https://v5api.othub.info/api/nodes/DataHolder/${process.env.NODE_ID}/jobs`
    )
  ).data;

  for (const offer of offersInfo) {
    if (
      !offer.CanPayout ||
      (payoutOnlyCompleted && offer.Status.toLowerCase() !== "completed")
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
