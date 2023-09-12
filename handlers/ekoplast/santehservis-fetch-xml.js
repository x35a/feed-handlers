const fs = require('fs')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({ cdata: true })
const fetchFeed = require('../../common/fetch-feed')

const outputFilePath = 'output/santehservisFeedUa.xml'
const santehservissFeedUaUrl =
    'https://www.santehservis.dp.ua/export/klient/zm_uk.xml'
//ru lang feed link 'https://www.santehservis.dp.ua/export/klient/zm_ru.xml'

const validatePrice = (price) => price <= 1000
const updatePrice = (price) => {
    const markup = 1.5
    return Math.ceil(parseFloat(price) * markup)
}

;(async () => {
    // Get yml
    const text = await fetchFeed(santehservissFeedUaUrl)
    if (!text) return `Fetching Error ${santehservissFeedUaUrl}`
    // const text = fs.readFileSync(
    //     './handlers/ekoplast/santehservis.dp.ua_export_klient_zm_uk.xml'
    // )

    // Parse yml
    parser.parseString(text, function (err, result) {
        const offers = result.yml_catalog.shop[0].offers[0].offer

        const newOffers = offers.filter((offer) => {
            // Remove out of stock products
            const isAvailable = offer['$'].available === 'true'
            // Remove products with price above 1k
            const validPrice = validatePrice(offer.price)

            // console.log(isAvailable, validPrice)
            return isAvailable && validPrice
        })

        newOffers.forEach((offer) => {
            offer.price = updatePrice(offer.price)
        })

        result.yml_catalog.shop[0].offers[0].offer = newOffers

        // Build xml
        const xml = builder.buildObject(result)
        fs.writeFileSync(outputFilePath, xml)

        console.log('santehservis feed done')
        ////console.log('offers', offers.length)
    })
})()
