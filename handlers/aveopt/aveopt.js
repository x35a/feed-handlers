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
const saveNewFeedData = require('./save-new-feed-data')
const replaceVendorCode = require('./replace-vendor-code')

const feedYMLlink =
    'https://aveon.net.ua/products_feed.xml?hash_tag=7b71fadcc4a12f03cf26a304da032fba&sales_notes=&product_ids=&label_ids=&exclude_fields=&html_description=0&yandex_cpa=&process_presence_sure=&languages=ru&group_ids='

const previousFeedDataFilePath = './handlers/aveopt/previousFeedData.json'

;(async () => {
    const feedText = await fetchFeed(feedYMLlink)

    // console.log(`Reading ${previousFeedDataFilePath}`)
    // const feedText = fs.readFileSync('./handlers/aveopt/products_feed.xml')

    const feedObject = await parser.parseStringPromise(feedText)
    const previousFeedData = JSON.parse(
        fs.readFileSync(previousFeedDataFilePath)
    )

    // not working, consider removing
    // If feeds dates are equal assume no changes in the feed.
    if (feedObject.yml_catalog.$.date === previousFeedData.date)
        return console.log('No changes. Feed dates are equal.')

    let offers = feedObject.yml_catalog.shop[0].offers[0].offer

    // Remove out of stock products
    offers = removeOutOfStockProducts(offers)

    // Remove categories
    offers = removeProductsByCategories(offers)

    // Change prices
    offers = changePrices(offers)

    // Replace <vendorCode>
    // tilda considers vendorCode as product SKU for some reason then replace vendorCode to original offer id
    offers = replaceVendorCode(offers)

    // Save new feed data and exit
    if (saveNewFeedDataFlag)
        return saveNewFeedData(offers, feedObject, previousFeedDataFilePath)

    // Print new or missed products id
    const [newProductsIdList, missedProductsIdList] = findNewOrMissedProducts(
        offers,
        feedObject,
        previousFeedData,
        previousFeedDataFilePath
    )

    saveNewOrMissedProducts(feedObject, newProductsIdList, missedProductsIdList)

    // Split feed
    const feeds = splitFeed(offers, feedObject)

    // Build xml
    console.log(`Building xml files`)
    feeds.forEach((feed, index) => {
        const xml = builder.buildObject(feed)
        fs.writeFileSync(`./output/aveopt-feed-chunk-${index}.xml`, xml)
    })

    console.log(`Median price ${findMedianPrice(offers)}`)
})()
