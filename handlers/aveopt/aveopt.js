const fs = require('fs')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({ cdata: true })
const fetchFeed = require('./fetch-feed')
const removeOutOfStockProducts = require('./remove-out-of-stock-products')
const removeProductsByCategories = require('./remove-products-by-categories')
const changePrices = require('./change-prices')
const findMedianPrice = require('./find-median-price')
const printNewOrMissedProductsId = require('./find-new-or-missed-products')
const splitFeed = require('./split-feed')

const feedYMLlink =
    'https://aveon.net.ua/products_feed.xml?hash_tag=7b71fadcc4a12f03cf26a304da032fba&sales_notes=&product_ids=&label_ids=&exclude_fields=&html_description=0&yandex_cpa=&process_presence_sure=&languages=ru&group_ids='

const previousFeedDataFilePath = './handlers/aveopt/previousFeedData.json'

;(async () => {
    //console.log('Fetching feed file...')
    //const feedText = await fetchFeed(feedYMLlink)
    //console.log('Fetching done')

    console.log(`Reading ${previousFeedDataFilePath}`)
    const feedText = fs.readFileSync('./handlers/aveopt/products_feed.xml')
    console.log('Reading done')

    const feedObject = await parser.parseStringPromise(feedText)
    const previousFeedData = JSON.parse(
        fs.readFileSync(previousFeedDataFilePath)
    )

    // If feeds dates are equal assume no changes in the feed.
    // if (feedObject.yml_catalog.$.date === previousFeedData.date)
    //     return console.log('No changes. Feed dates are equal.')

    let offers = feedObject.yml_catalog.shop[0].offers[0].offer
    //console.log(offers.length)

    // Remove out of stock products
    offers = removeOutOfStockProducts(offers)
    //console.log(offers.length)

    // Remove categories
    offers = removeProductsByCategories(offers)
    //console.log(offers.length)

    // Change prices
    offers = changePrices(offers)
    //console.log(offers.length)

    printNewOrMissedProductsId(
        offers,
        feedObject,
        previousFeedData,
        previousFeedDataFilePath
    )

    const feeds = splitFeed(offers, feedObject)

    // Save new offers
    //feedObject.yml_catalog.shop[0].offers[0].offer = offers

    // Build xml
    //const xml = builder.buildObject(feedObject)
    //fs.writeFileSync('./output/aveopt-feed.xml', xml)
    console.log(`Building xml feeds`)
    feeds.forEach((feed, index) => {
        const xml = builder.buildObject(feed)
        fs.writeFileSync(`./output/aveopt-feed-chunk-${index}.xml`, xml)
    })

    console.log(`Median price ${findMedianPrice(offers)}`)
})()
