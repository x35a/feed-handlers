const fs = require('fs')
const cloneDeep = require('lodash/cloneDeep')
const xml2js = require('xml2js')
const builder = new xml2js.Builder({ cdata: true })

module.exports = (lastFeedPath, newFeedObject, newFeedOffers) => {
    const feedObject = cloneDeep(newFeedObject)
    feedObject.yml_catalog.shop[0].offers[0].offer = newFeedOffers
    const xml = builder.buildObject(feedObject)
    fs.writeFileSync(lastFeedPath, xml)
    console.log(`UPDATED ${lastFeedPath}`)
    return feedObject
}
