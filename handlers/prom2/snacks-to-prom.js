const fs = require('fs')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({ cdata: true })

// snacks woo feed
const snacksFeedUrl =
    'https://snacks.in.ua/wp-content/uploads/uamrktpls/mrkvuamppromua.xml'

const outputFeedPath = './handlers/prom2/output/snacks-to-prom.xml'
const fetchFeed = require('../../common/fetch-feed')
const { markup } = require('../snacks/settings')
const snacksWooMarkup = markup
const promMarkup = 1.5

// snacks to prom
// xml to xml

;(async () => {
    // Get snacks xml file
    const snacksXmlText = await fetchFeed(snacksFeedUrl)
    if (!snacksXmlText) return `Fetching Error ${snacksFeedUrl}`
    // const wooXmlFile = fs.readFileSync(
    //     './handlers/snacks-to-prom/mrkvuamppromua.xml'
    // )

    // Parse snacks xml
    const snacksXmlFeed = await parser.parseStringPromise(snacksXmlText)
    const snacksProducts = snacksXmlFeed.yml_catalog.shop[0].offers[0].offer
    const snacksCategories =
        snacksXmlFeed.yml_catalog.shop[0].categories[0].category

    // Copy snacks products to prom feed
    snacksProducts.forEach((product, index) => {
        const updPrice = (price, wooMarkup, promMarkup) => {
            return Math.ceil((parseFloat(price) / wooMarkup) * promMarkup)
        }

        // upd price
        product.price = updPrice(product.price, snacksWooMarkup, promMarkup)

        // delete quantity_in_stock because <quantity_in_stock>1</quantity_in_stock> in snacks feed
        delete product.quantity_in_stock

        // delete redundand tag
        delete product.available
    })

    // добавить vendorCode это артикул
    // --убрать тег available
    // --убрать тег quantity_in_stock
    // добавить тег name_ua
    // добавить тег description_ua
    // --изменить цены
    // как проставить внутр категории прома снекам?

    // Build xml
    const xml = builder.buildObject(snacksXmlFeed)
    fs.writeFileSync(outputFeedPath, xml)

    console.log('snacks-to-prom feed done')
})()
