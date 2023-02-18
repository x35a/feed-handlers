const fs = require('fs')
const cloneDeep = require('lodash/cloneDeep')
const xml2js = require('xml2js')
const builder = new xml2js.Builder({ cdata: true })

module.exports = (lastFeedPath, lastFeedObject, lastFeedOffers) => {
    const feedObject = cloneDeep(lastFeedObject)
    feedObject.yml_catalog.shop[0].offers[0].offer = lastFeedOffers
    const xml = builder.buildObject(feedObject)
    fs.writeFileSync(lastFeedPath, xml)
    console.log(`UPDATED ${lastFeedPath}`)
    return feedObject
}
