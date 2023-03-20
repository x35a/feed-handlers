const fs = require('fs')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({ cdata: true })
const fetchFeed = require('../../common/fetch-feed')
const removeOutOfStockProducts = require('./remove-out-of-stock-products')
const removeProductsByCategories = require('./remove-products-by-categories')
const changePrices = require('./change-prices')
const findMedianPrice = require('./find-median-price')
const splitFeed = require('./split-feed')
const replaceVendorCode = require('./replace-vendor-code')
const findFeedsDiff = require('./find-feeds-diff')
const updateLastFeed = require('./update-last-feed')
const saveDiffHistory = require('./save-diff-history')
const diffFeedFlag = process.argv.find((argv) => argv === '--diffFeed')
const splitFeedFlag = process.argv.find((argv) => argv === '--splitFeed')
const cloneDeep = require('lodash/cloneDeep')
const { aveoptYMLLink } = require('../../common/const')

const lastFeedPath = './handlers/aveopt/products_feed.xml'

;(async () => {
    // Get New Feed
    const newFeedText = await fetchFeed(aveoptYMLLink)
    if (!newFeedText) return `Fetching Error ${aveoptYMLLink}`
    const newFeedObject = await parser.parseStringPromise(newFeedText)
    let newFeedOffers = newFeedObject.yml_catalog.shop[0].offers[0].offer
    newFeedOffers = removeOutOfStockProducts(newFeedOffers)
    newFeedOffers = removeProductsByCategories(newFeedOffers)

    // Get Last Feed
    console.log(`Reading ${lastFeedPath}\n`)
    const lastFeedText = fs.readFileSync('./handlers/aveopt/products_feed.xml')
    const lastFeedObject = await parser.parseStringPromise(lastFeedText)
    let lastFeedOffers = lastFeedObject.yml_catalog.shop[0].offers[0].offer

    // Find Diff
    let [newOffersIDList, missedOffersIDList, priceDiffDetails, diffOffers] =
        findFeedsDiff(
            newFeedObject.yml_catalog.$.date,
            lastFeedObject.yml_catalog.$.date,
            newFeedOffers,
            lastFeedOffers
        )

    if (
        newOffersIDList.length ||
        missedOffersIDList.length ||
        priceDiffDetails.length
    ) {
        saveDiffHistory(
            newFeedObject.yml_catalog.$.date,
            lastFeedObject.yml_catalog.$.date,
            newOffersIDList,
            missedOffersIDList,
            priceDiffDetails
        )
        updateLastFeed(lastFeedPath, newFeedObject, newFeedOffers)
    } else if (
        !newOffersIDList.length &&
        !missedOffersIDList.length &&
        !priceDiffDetails.length
    ) {
        console.log(`NO DIFF FOUND`)
    }

    if (diffFeedFlag) {
        if (
            !newOffersIDList.length &&
            !missedOffersIDList.length &&
            !priceDiffDetails.length
        )
            return console.log(`NO DIFF FOUND`)

        diffOffers = changePrices(diffOffers)
        diffOffers = replaceVendorCode(diffOffers)
        const diffFeed = cloneDeep(newFeedObject)
        diffFeed.yml_catalog.shop[0].offers[0].offer = diffOffers
        // Build xml
        const feedDiffPath = './output/aveopt-feed-diff.xml'
        const xml = builder.buildObject(diffFeed)
        fs.writeFileSync(feedDiffPath, xml)
        console.log(`FEED SAVED in ${feedDiffPath}`)
    }

    if (splitFeedFlag) {
        newFeedOffers = changePrices(newFeedOffers)
        newFeedOffers = replaceVendorCode(newFeedOffers) // tld considers vendorCode as product SKU, replace vendorCode to original offer id
        const feeds = splitFeed(newFeedOffers, newFeedObject)
        // Build xml
        feeds.forEach((feed, index) => {
            const xml = builder.buildObject(feed)
            fs.writeFileSync(`./output/aveopt-feed-chunk-${index}.xml`, xml)
        })
        console.log(`FEED SAVED in ./output/aveopt-feed-chunk-.xml`)
    }

    console.log(`Median price ${findMedianPrice(newFeedOffers)}`)
})()
