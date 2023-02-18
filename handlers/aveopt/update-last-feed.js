const fs = require('fs')
const cloneDeep = require('lodash/cloneDeep')
const xml2js = require('xml2js')
const builder = new xml2js.Builder({ cdata: true })

module.exports = (
    updateLastFeedFlag,
    lastFeedPath,
    newOffersIDList,
    missedOffersIDList,
    lastFeedObject,
    lastFeedOffersObject
) => {
    if (
        updateLastFeedFlag &&
        (newOffersIDList.length || missedOffersIDList.length)
    ) {
        const feedObject = cloneDeep(lastFeedObject)
        feedObject.yml_catalog.shop[0].offers[0].offer = lastFeedOffersObject
        const xml = builder.buildObject(feedObject)
        fs.writeFileSync(lastFeedPath, xml)
        console.log(`UPDATED ${lastFeedPath}`)
        return feedObject
    } else if (
        updateLastFeedFlag &&
        !newOffersIDList.length &&
        !missedOffersIDList.length
    ) {
        console.log(
            `UPDATE SKIPPED. There is no DIFF between New and Last feed.`
        )
        return
    }
}
