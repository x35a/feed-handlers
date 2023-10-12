const fs = require('fs')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({ cdata: true })

// Prom feed with caviar and basins on board
const promFeedUrl =
    'https://homemarket.org.ua/products_feed.xml?hash_tag=a933b2ba023b069cfa20c3314506ac8e&sales_notes=&product_ids=&label_ids=&exclude_fields=&html_description=1&yandex_cpa=&process_presence_sure=&languages=uk%2Cru&group_ids=122432471%2C122432472&nested_group_ids=122432471%2C122432472&extra_fields=quantityInStock%2Ckeywords'

// snacks woo feed
const snacksFeedUrl =
    'https://snacks.in.ua/wp-content/uploads/uamrktpls/mrkvuamppromua.xml'

const newFeedOutputPath = './handlers/snacks-to-prom/output/sancks-to-prom.xml'
const fetchFeed = require('../../common/fetch-feed')
const { markup } = require('../snacks/settings')
const wooMarkup = markup
const promMarkup = 1.5

;(async () => {
    // Get prom xml file
    // const promFeedText = await fetchFeed(promFeedUrl)
    // if (!promFeedText) return `Fetching Error ${promFeedUrl}`
    const promFeedText = fs.readFileSync(
        './handlers/snacks-to-prom/prom-feed.xml'
    )

    // Get snacks xml file
    const snacksXmlText = await fetchFeed(snacksFeedUrl)
    if (!snacksXmlText) return `Fetching Error ${snacksFeedUrl}`
    // const wooXmlFile = fs.readFileSync(
    //     './handlers/snacks-to-prom/mrkvuamppromua.xml'
    // )

    // Parse prom xml
    const promXmlFeed = await parser.parseStringPromise(promFeedText)
    const promProducts = promXmlFeed.yml_catalog.shop[0].offers[0].offer
    let promCategories = promXmlFeed.yml_catalog.shop[0].categories[0].category // [{ _: 'Сантехника', '$': { id: '122371382' } }, { _: 'Икра', '$': { id: '122371381' } }]

    // Parse snacks xml
    const snacksXmlFeed = await parser.parseStringPromise(snacksXmlText)
    const snacksProducts = snacksXmlFeed.yml_catalog.shop[0].offers[0].offer
    const snacksCategories =
        snacksXmlFeed.yml_catalog.shop[0].categories[0].category

    // Copy snacks categories to prom feed
    promXmlFeed.yml_catalog.shop[0].categories[0].category = [
        ...promCategories,
        ...snacksCategories
    ]

    // Copy snacks products to prom feed
    snacksProducts.forEach((product, index) => {
        const updPrice = (price, wooMarkup, promMarkup) => {
            return Math.ceil((parseFloat(price) / wooMarkup) * promMarkup)
        }

        //if (index > 0) return

        // upd price
        product.price = updPrice(product.price, wooMarkup, promMarkup)

        // delete quantity_in_stock because <quantity_in_stock>1</quantity_in_stock> in snacks feed
        delete product.quantity_in_stock

        // delete redundand tag
        delete product.available

        promProducts.push(product)
    })

    // --добавить vendorCode это артикул
    // --убрать тег available
    // --убрать тег quantity_in_stock
    // --добавить тег name_ua
    // --добавить тег description_ua
    // убрать товары в excludeById
    // --изменить цены
    // как проставить внутр категории прома снекам?

    // Build xml
    const xml = builder.buildObject(promXmlFeed)
    fs.writeFileSync(newFeedOutputPath, xml)

    console.log('snacks-to-prom feed done')
})()
