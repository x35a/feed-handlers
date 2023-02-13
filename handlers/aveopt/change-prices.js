const markup = 1.5

module.exports = (offers) =>
    offers.map((offer) => {
        offer.price = Math.ceil(offer.price * markup)
        return offer
    })
