module.exports = (offers) =>
    offers.map((offer) => {
        offer.vendorCode = offer.$.id
        return offer
    })
