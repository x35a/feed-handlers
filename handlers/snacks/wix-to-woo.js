const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const stringify = require('csv-stringify/lib/sync')
const fetchFeed = require('../../common/fetch-feed')
const feedOutputPath = './handlers/snacks/output/wix-to-woo.csv'

// settings
const markup = 1.35
exports.snacksWooMarkup = markup
const wixTSVUrl =
    'https://manage.wix.com/catalog-feed/v1/feed.tsv?marketplace=google&version=1&token=at7rMOXsoIy9Sxvf9FdA2BbAq12yaa%2BqMr8FW6N01ZFoYommMHbQCGS4DpHFpi4s&productsOnly=false' // feed url
const excludeById = [
    'e40487a9-1425-d3cc-bef5-bd167a6f39dc', // Креветка варено-морожена 90-120 ( лише по місту Дніпро)
    'b84e38a8-4df3-efff-ddda-9d2fecff28a7',
    'd103611d-cdab-b49b-19f2-acb715fed442',
    'f4bd30e3-aac1-3a37-df19-bcc5afb68e50'
]

// tsv to csv
;(async () => {
    // Get tsv
    const text = await fetchFeed(wixTSVUrl)
    if (!text) return `Fetching Error ${wixTSVUrl}`
    // const text = fs.readFileSync('./handlers/snacks/wix-feed.tsv') // get feed from static file

    // Parse .tsv data
    let productsList = parse(text, {
        delimiter: '\t',
        columns: true,
        quote: false, // fix error CsvError: Invalid Opening Quote: a quote is found inside a field at line .. // its better to use relax_quotes option but it didn't work mb because csv lib version is outdated https://csv.js.org/parse/options/relax_quotes/
        skip_empty_lines: true
    })

    // Filter products
    productsList = productsList.filter((product) => {
        // Exclude by ID
        const allowedId = !excludeById.includes(product.id)

        // Exclude out of stock
        const inStock = product.availability !== 'out of stock'

        return allowedId && inStock
    })

    productsList.forEach((product, index) => {
        // upd price
        product.price = Math.ceil(parseFloat(product.price) * markup)

        // upd sale price
        product['sale price'] = Math.ceil(
            parseFloat(product['sale price']) * markup
        )

        // availability, remove whitespaces its required by wp all import plugin
        product.availability = product.availability.replace(/\s+/g, '')
    })

    // Build csv
    const productsListStringified = stringify(productsList, {
        header: true
    })
    fs.writeFileSync(feedOutputPath, productsListStringified)
    console.log(`${feedOutputPath} done`)
})()
