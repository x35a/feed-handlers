const fs = require('fs')
const { off } = require('process')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({ cdata: true })
const fetchFeed = require('./fetch-feed')
const removeOutOfStockProducts = require('./remove-out-of-stock-products')
const removeProductsByCategories = require('./remove-products-by-categories')
const changePrices = require('./change-prices')
const findMedianPrice = require('./find-median-price')

const feedYMLlink =
    'https://aveon.net.ua/products_feed.xml?hash_tag=7b71fadcc4a12f03cf26a304da032fba&sales_notes=&product_ids=&label_ids=&exclude_fields=&html_description=0&yandex_cpa=&process_presence_sure=&languages=ru&group_ids='

;(async () => {
    //const feedText = await fetchFeed(feedYMLlink)
    const feedText = fs.readFileSync('./handlers/aveopt/products_feed.xml')
    const feedObject = await parser.parseStringPromise(feedText)

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

    // Save new offers
    feedObject.yml_catalog.shop[0].offers[0].offer = offers

    // Build xml
    const xml = builder.buildObject(feedObject)
    fs.writeFileSync('./output/aveopt-feed.xml', xml)

    console.log('Aveopt Feed Done')
    console.log(`Median price ${findMedianPrice(offers)}`)
})()
