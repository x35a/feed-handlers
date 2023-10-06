const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const stringify = require('csv-stringify/lib/sync')
const fetchFeed = require('../../common/fetch-feed')
const feedOutputPath = 'output/wix-feed.csv'
const { wixTSVUrl, markup } = require('./settings')
const { excludeById } = require('./exclude-products')

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
