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
const priceRange = { min: 500, max: 2000 }
const wrongCategoryProducts = [
    'V47183',
    'V47310',
    'V47335',
    'V47286',
    'V47209',
    'V38123'
]
// no tubes in complect
const notFullComplect = [
    'V38324',
    'V38255',
    'V38194',
    'V38121',
    'V38058',
    'V38053',
    'V38061',
    'V38330',
    'V38251',
    'V05387' // watermark on photo
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

            // Filter out products with wrong category
            const isNotWrongCategory = !wrongCategoryProducts.includes(
                ...offer.kod
            )

            // Filter out no complect products
            const isFullComplect = !notFullComplect.includes(...offer.kod)

            // Remove products with 0 components
            // param:
            // [
            //     { _: 'Для умивальника', '$': { name: 'Призначення виробу' } },
            //     { _: 'Джойстик', '$': { name: 'Управління змішувачем' } },
            // ]

            // console.log(isAvailable, validPrice, isNotWrongCategory)
            return (
                isAvailable &&
                validPrice &&
                isNotWrongCategory &&
                isFullComplect
            )
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
