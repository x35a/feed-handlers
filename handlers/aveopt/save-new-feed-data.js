const fs = require('fs')

module.exports = (offers, feedObject, previousFeedDataFilePath) => {
    const feedSimpleObject = buildFeedSimpleObject(offers, feedObject)
    fs.writeFileSync(previousFeedDataFilePath, JSON.stringify(feedSimpleObject))
    console.log(`${previousFeedDataFilePath} UPDATED`)
}

function buildFeedSimpleObject(offers, feedObject) {
    let offersIdList = []
    offers.forEach((offer) => offersIdList.push(offer.$.id))
    return {
        date: feedObject.yml_catalog.$.date,
        offersIdList: offersIdList
    }
}
