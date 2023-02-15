const fs = require('fs')
const feedsDataHistoryPath = './handlers/aveopt/feedsDataHistory.json'

module.exports = (feedObject, newProductsIdList, missedProductsIdList) => {
    console.log('Saving New or Missed Products..')

    const feedsDataHistoryList = JSON.parse(
        fs.readFileSync(feedsDataHistoryPath)
    )

    const newFeedFingerprint = newProductsIdList
        .concat(missedProductsIdList)
        .join('')
    console.log(newFeedFingerprint)

    const lastFeed = feedsDataHistoryList[feedsDataHistoryList.length - 1]
    const lastFeedFingerprint = lastFeed.newProductsID
        .concat(lastFeed.missedProductsID)
        .join('')
    console.log(lastFeedFingerprint)

    if (newFeedFingerprint === lastFeedFingerprint)
        return console.log('Saving skipped')

    feedsDataHistoryList.push({
        date: feedObject.yml_catalog.$.date,
        newProductsID: newProductsIdList,
        missedProductsID: missedProductsIdList
    })

    fs.writeFileSync(feedsDataHistoryPath, JSON.stringify(feedsDataHistoryList))

    console.log(`SAVED in ${feedsDataHistoryPath}`)
}
