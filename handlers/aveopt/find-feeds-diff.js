const cloneDeep = require('lodash/cloneDeep')

module.exports = (newFeedDate, lastFeedDate, newOffers, lastOffers) => {
    // Print feed dates
    console.log(
        `New Feed Date: ${newFeedDate}\nPrevious Feed Date: ${lastFeedDate}\n`
    )

    const newFeedOffers = cloneDeep(newOffers)
    const lastFeedOffers = cloneDeep(lastOffers)
    const newFeedOffersIDList = newFeedOffers.map((offer) => offer.$.id)
    const lastFeedOffersIDList = lastFeedOffers.map((offer) => offer.$.id)

    // Find brand new products
    const newOffersIDList = newFeedOffersIDList.filter(
        (newOfferID) =>
            !lastFeedOffersIDList.find(
                (prevOfferID) => newOfferID === prevOfferID
            )
    )
    console.log(`NEW PRODUCTS ID\n${newOffersIDList.join('\n')}\n`)

    // Copy brand new products
    const brandNewOffers = newFeedOffers.filter((offer) =>
        newOffersIDList.find((id) => offer.$.id === id)
    )

    // Find missed products
    const missedOffersIDList = lastFeedOffersIDList.filter(
        (prevOfferID) =>
            !newFeedOffersIDList.find(
                (newOfferID) => newOfferID === prevOfferID
            )
    )
    console.log(`MISSED PRODUCTS ID\n${missedOffersIDList.join('\n')}\n`)

    // Find price changes
    const priceDiffDetails = []
    const priceDiffOffers = newFeedOffers.filter((newFeedOffer) => {
        return lastFeedOffers.find((lastFeedOffer) => {
            const isDiff =
                newFeedOffer.$.id === lastFeedOffer.$.id &&
                newFeedOffer.price[0] !== lastFeedOffer.price[0]
            if (isDiff)
                priceDiffDetails.push(
                    `ID: ${newFeedOffer.$.id} NEW PRICE: ${newFeedOffer.price[0]} OLD PRICE: ${lastFeedOffer.price[0]}`
                )
            return isDiff
        })
    })
    console.log(`PRICE DIFF DETAILS\n${priceDiffDetails.join('\n')}\n`)

    // Diff offers
    const diffOffers = [...brandNewOffers, ...priceDiffOffers]

    return [newOffersIDList, missedOffersIDList, priceDiffDetails, diffOffers]
}
