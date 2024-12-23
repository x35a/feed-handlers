const fs = require('fs')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({ cdata: true })
const fetchFeed = require('../../common/fetch-feed')

const outputFilePath = './handlers/ekoplast/output/santehservisFeedUa.xml'
const santehservissFeedUaUrl =
    'https://www.santehservis.dp.ua/export/klient/zm_uk.xml'
//ru lang feed link 'https://www.santehservis.dp.ua/export/klient/zm_ru.xml'
// https://www.santehservis.dp.ua/uk/smesiteli/smesytely/

const markup = 300
const priceRange = { min: 1, max: 1200 }
const mixerExcludeList = [
    'V47183', // wrong category
    'V47310', // wrong category
    'V47335', // wrong category
    'V47286', // wrong category
    'V47209', // wrong category
    'V38123', // wrong category
    'V38324', // no tubes
    'V38255', // no tubes
    'V38194', // no tubes
    'V38121', // no tubes
    'V38058', // no tubes
    'V38053', // no tubes
    'V38061', // no tubes
    'V38330', // no tubes
    'V38251', // no tubes
    'V05387', // watermarks
    'V05400', // watermarks
    'V05386' // watermarks
]

const validatePrice = (price, priceRange) =>
    price >= priceRange.min && price <= priceRange.max

const updatePrice = (price, markup) => Math.ceil(parseFloat(price) + markup)

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

            // Remove products out of price range
            const validPrice = validatePrice(offer.price, priceRange)

            // Exclude products
            const isNotInExcludeList = !mixerExcludeList.includes(...offer.kod)

            // Remove products with 0 components
            // param:
            // [
            //     { _: 'Для умивальника', '$': { name: 'Призначення виробу' } },
            //     { _: 'Джойстик', '$': { name: 'Управління змішувачем' } },
            // ]

            // console.log(isAvailable, validPrice, isNotWrongCategory)
            return isAvailable && validPrice && isNotInExcludeList
        })

        newOffers.forEach((offer) => {
            offer.price = updatePrice(offer.price, markup)
        })

        result.yml_catalog.shop[0].offers[0].offer = newOffers

        // Build xml
        const xml = builder.buildObject(result)
        fs.writeFileSync(outputFilePath, xml)

        console.log('santehservis feed done'.toUpperCase())
        ////console.log('offers', offers.length)
    })
})()
