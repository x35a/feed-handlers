const fs = require('fs')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({ cdata: true })
const fetchFeed = require('./fetch-feed')
const removeOutOfStockProducts = require('./remove-out-of-stock-products')
const removeProductsByCategories = require('./remove-products-by-categories')
const changePrices = require('./change-prices')
const findMedianPrice = require('./find-median-price')
const findNewOrMissedProducts = require('./find-new-or-missed-products')
const saveNewOrMissedProducts = require('./save-new-or-missed-products')
const splitFeed = require('./split-feed')
const saveNewFeedDataFlag = process.argv.find(
    (argv) => argv === '--saveNewFeedData'
)
const updateLastFeedFlag = process.argv.find(
    (argv) => argv === '--updateLastFeed'
)
const diffFeedFlag = process.argv.find((argv) => argv === '--diffFeed')
const splitFeedFlag = process.argv.find((argv) => argv === '--splitFeed')
const saveNewFeedData = require('./save-new-feed-data')
const replaceVendorCode = require('./replace-vendor-code')
const findFeedsDiff = require('./find-feeds-diff')
const updateLastFeed = require('./update-last-feed')
const saveDiffHistory = require('./save-diff-history')
const cloneDeep = require('lodash/cloneDeep')

const feedYMLlink =
    'https://aveon.net.ua/products_feed.xml?hash_tag=7b71fadcc4a12f03cf26a304da032fba&sales_notes=&product_ids=&label_ids=&exclude_fields=&html_description=0&yandex_cpa=&process_presence_sure=&languages=ru&group_ids='

const previousFeedDataFilePath = './handlers/aveopt/previousFeedData.json'
const lastFeedPath = './handlers/aveopt/products_feed.xml'

;(async () => {
    const newFeedText = await fetchFeed(feedYMLlink)
    const newFeedObject = await parser.parseStringPromise(newFeedText)

    console.log(`Reading ${lastFeedPath}\n`)
    const lastFeedText = fs.readFileSync('./handlers/aveopt/products_feed.xml')
    const lastFeedObject = await parser.parseStringPromise(lastFeedText)

    // const previousFeedData = JSON.parse(
    //     fs.readFileSync(previousFeedDataFilePath)
    // )

    let newFeedOffers = newFeedObject.yml_catalog.shop[0].offers[0].offer
    newFeedOffers = removeOutOfStockProducts(newFeedOffers)
    newFeedOffers = removeProductsByCategories(newFeedOffers)

    let lastFeedOffers = lastFeedObject.yml_catalog.shop[0].offers[0].offer
    lastFeedOffers = removeOutOfStockProducts(lastFeedOffers)
    lastFeedOffers = removeProductsByCategories(lastFeedOffers)

    let [newOffersIDList, missedOffersIDList, priceDiffDetails, diffOffers] =
        findFeedsDiff(
            newFeedObject.yml_catalog.$.date,
            lastFeedObject.yml_catalog.$.date,
            newFeedOffers,
            lastFeedOffers
        )

    if (
        updateLastFeedFlag &&
        (newOffersIDList.length || missedOffersIDList.length)
    ) {
        saveDiffHistory(
            newFeedObject.yml_catalog.$.date,
            lastFeedObject.yml_catalog.$.date,
            newOffersIDList,
            missedOffersIDList,
            priceDiffDetails
        )
        updateLastFeed(lastFeedPath, lastFeedObject, lastFeedOffers)
        return
    } else if (
        updateLastFeedFlag &&
        !newOffersIDList.length &&
        !missedOffersIDList.length
    ) {
        console.log(`NO DIFF FOUND between New and Last feed`)
        return
    }

    // if (saveNewFeedDataFlag)
    //     return saveNewFeedData(
    //         newFeedOffers,
    //         newFeedObject,
    //         previousFeedDataFilePath
    //     )

    // const [newProductsIdList, missedProductsIdList] = findNewOrMissedProducts(
    //     newFeedOffers,
    //     newFeedObject,
    //     previousFeedData,
    //     previousFeedDataFilePath
    // )

    // saveNewOrMissedProducts(
    //     newFeedObject,
    //     newProductsIdList,
    //     missedProductsIdList
    // )

    if (diffFeedFlag) {
        diffOffers = changePrices(diffOffers)
        diffOffers = replaceVendorCode(diffOffers)
        const diffFeed = cloneDeep(newFeedObject)
        diffFeed.yml_catalog.shop[0].offers[0].offer = diffOffers
        // Build xml
        console.log(`Building xml file`)
        const xml = builder.buildObject(diffFeed)
        fs.writeFileSync(`./output/aveopt-feed-diff.xml`, xml)
    }

    if (splitFeedFlag) {
        newFeedOffers = changePrices(newFeedOffers)
        newFeedOffers = replaceVendorCode(newFeedOffers) // tld considers vendorCode as product SKU, replace vendorCode to original offer id
        const feeds = splitFeed(newFeedOffers, newFeedObject)
        // Build xml
        console.log(`Building xml files`)
        feeds.forEach((feed, index) => {
            const xml = builder.buildObject(feed)
            fs.writeFileSync(`./output/aveopt-feed-chunk-${index}.xml`, xml)
        })
    }

    console.log(`Median price ${findMedianPrice(newFeedOffers)}`)
})()
