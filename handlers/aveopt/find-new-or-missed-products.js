// Find new or missed products.
// Compare new and previous feed by products id.

module.exports = (
    offers,
    feedObject,
    previousFeedData,
    previousFeedDataFilePath
) => {
    const prevFeed = previousFeedData
    const newFeed = getNewFeedSimpleObject(offers, feedObject)

    // Print feed dates
    console.log(
        `Previous Feed Date: ${prevFeed.date}\nNew Feed Date: ${feedObject.yml_catalog.$.date}\n`
    )

    // Find new products
    const newProductsIdList = newFeed.offersIdList.filter(
        (newFeedId) =>
            !prevFeed.offersIdList.find(
                (prevFeedId) => newFeedId === prevFeedId
            )
    )
    console.log(`NEW PRODUCTS ID\n${newProductsIdList.join('\n')}\n`)

    // Find missed products
    const missedProductsIdList = prevFeed.offersIdList.filter(
        (prevFeedId) =>
            !newFeed.offersIdList.find((newFeedId) => newFeedId === prevFeedId)
    )
    console.log(`MISSED PRODUCTS ID\n${missedProductsIdList.join('\n')}\n`)

    if (newProductsIdList.length || missedProductsIdList.length)
        console.log(`UPDATE FILE ${previousFeedDataFilePath}`)
}

function getNewFeedSimpleObject(offers, feedObject) {
    let offersIdList = []
    offers.forEach((offer) => offersIdList.push(offer.$.id))
    return {
        date: feedObject.yml_catalog.$.date,
        offersIdList: offersIdList
    }
}
