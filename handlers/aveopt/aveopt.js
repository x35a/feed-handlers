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
const saveNewFeedData = require('./save-new-feed-data')
const replaceVendorCode = require('./replace-vendor-code')
const findFeedsDiff = require('./find-feeds-diff')
const updateLastFeed = require('./update-last-feed')

const feedYMLlink =
    'https://aveon.net.ua/products_feed.xml?hash_tag=7b71fadcc4a12f03cf26a304da032fba&sales_notes=&product_ids=&label_ids=&exclude_fields=&html_description=0&yandex_cpa=&process_presence_sure=&languages=ru&group_ids='

const previousFeedDataFilePath = './handlers/aveopt/previousFeedData.json'
const lastFeedPath = './handlers/aveopt/products_feed.xml'

;(async () => {
    const newFeedText = await fetchFeed(feedYMLlink)
    const newFeedObject = await parser.parseStringPromise(newFeedText)

    console.log(`Reading ${lastFeedPath}`)
    const lastFeedText = fs.readFileSync('./handlers/aveopt/products_feed.xml')
    const lastFeedObject = await parser.parseStringPromise(lastFeedText)

    const previousFeedData = JSON.parse(
        fs.readFileSync(previousFeedDataFilePath)
    )

    let newFeedOffersObject = newFeedObject.yml_catalog.shop[0].offers[0].offer
    newFeedOffersObject = removeOutOfStockProducts(newFeedOffersObject)
    newFeedOffersObject = removeProductsByCategories(newFeedOffersObject)

    let lastFeedOffersObject =
        lastFeedObject.yml_catalog.shop[0].offers[0].offer
    lastFeedOffersObject = removeOutOfStockProducts(lastFeedOffersObject)
    lastFeedOffersObject = removeProductsByCategories(lastFeedOffersObject)

    const [
        newOffersIDList,
        missedOffersIDList,
        priceDiffOffersList,
        priceDiffDetails
    ] = findFeedsDiff(
        newFeedObject,
        lastFeedObject,
        newFeedOffersObject,
        lastFeedOffersObject
    )

    // TODO SAVE DIFF RESULTS

    if (
        updateLastFeedFlag &&
        (newOffersIDList.length || missedOffersIDList.length)
    ) {
        const lastFeedObjectUpdated = updateLastFeed(
            lastFeedPath,
            lastFeedObject,
            lastFeedOffersObject
        )
        return
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

    newFeedOffersObject = changePrices(newFeedOffersObject)

    newFeedOffersObject = replaceVendorCode(newFeedOffersObject) // tld considers vendorCode as product SKU, replace vendorCode to original offer id

    if (saveNewFeedDataFlag)
        return saveNewFeedData(
            newFeedOffersObject,
            newFeedObject,
            previousFeedDataFilePath
        )

    const [newProductsIdList, missedProductsIdList] = findNewOrMissedProducts(
        newFeedOffersObject,
        newFeedObject,
        previousFeedData,
        previousFeedDataFilePath
    )

    saveNewOrMissedProducts(
        newFeedObject,
        newProductsIdList,
        missedProductsIdList
    )

    const feeds = splitFeed(newFeedOffersObject, newFeedObject)

    // Build xml
    console.log(`Building xml files`)
    feeds.forEach((feed, index) => {
        const xml = builder.buildObject(feed)
        fs.writeFileSync(`./output/aveopt-feed-chunk-${index}.xml`, xml)
    })

    console.log(`Median price ${findMedianPrice(newFeedOffersObject)}`)
})()
