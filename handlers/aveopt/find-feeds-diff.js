module.exports = (
    newFeedObject,
    lastFeedObject,
    newFeedOffersObject,
    lastFeedOffersObject
) => {
    console.log('DIFF START')

    // Print feed dates
    console.log(
        `Previous Feed Date: ${lastFeedObject.yml_catalog.$.date}\nNew Feed Date: ${newFeedObject.yml_catalog.$.date}\n`
    )

    const newFeedOffersIDList = newFeedOffersObject.map((offer) => offer.$.id)
    const lastFeedOffersIDList = lastFeedOffersObject.map((offer) => offer.$.id)

    // Find new products
    const newOffersIDList = newFeedOffersIDList.filter(
        (newOfferID) =>
            !lastFeedOffersIDList.find(
                (prevOfferID) => newOfferID === prevOfferID
            )
    )
    console.log(`NEW PRODUCTS ID\n${newOffersIDList.join('\n')}\n`)

    // Find missed products
    const missedOffersIDList = lastFeedOffersIDList.filter(
        (prevOfferID) =>
            !newFeedOffersIDList.find(
                (newOfferID) => newOfferID === prevOfferID
            )
    )
    console.log(`MISSED PRODUCTS ID\n${missedOffersIDList.join('\n')}\n`)

    console.log('DIFF END')
    return [newOffersIDList, missedOffersIDList]
}
