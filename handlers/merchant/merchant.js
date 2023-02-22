const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const stringify = require('csv-stringify/lib/sync')
const {
    adAllowedList,
    excludeIDList,
    stopWords,
    stopCategories,
    priceLowerBoundry
} = require('./ad-filter')
const { merchant } = require('../../common/feeds-path')
const feedFb = 'https://smartfood.org.ua/feed-fb.csv'

// In Google Merchant Setting
// Set Delimiter: Tab
// Uncheck 'Use quoted fields' checkbox

;(async () => {
    let response = await fetch(feedFb)

    // if HTTP status in range 200-299
    if (response.ok) {
        // Get .csv
        let text = await response.text()
        //console.log(text)

        // Parse .csv data
        const productsList = parse(text, {
            columns: true,
            skip_empty_lines: true
        })

        let adProducts = []
        let freeProducts = []

        // Filters
        productsList.forEach((product) => {
            // Force Ad
            if (adAllowedList.includes(product.id)) {
                adProducts.push(product)
                return
            }

            // Exclude from Ad by ID
            if (excludeIDList.includes(product.id)) {
                freeProducts.push(product)
                return
            }

            // Exclude from Ad by Category
            if (stopCategories.includes(product.product_type)) {
                freeProducts.push(product)
                return
            }

            // Exclude from Ad by Title
            const stopWordsRegex = new RegExp(stopWords.join('|'), 'i')
            if (stopWordsRegex.test(product.title)) {
                freeProducts.push(product)
                return
            }

            // Exclude from Ad by Price
            if (parseInt(product.price) >= priceLowerBoundry) {
                adProducts.push(product)
            } else {
                freeProducts.push(product)
            }
        })

        // Build tsv
        const adProductsStringified = stringify(adProducts, {
            header: true,
            delimiter: '\t'
        })
        fs.writeFileSync(merchant.outputAd, adProductsStringified)
        console.log(`${merchant.outputAd} done`)

        const freeProductsStringified = stringify(freeProducts, {
            header: true,
            delimiter: '\t'
        })
        fs.writeFileSync(merchant.outputFree, freeProductsStringified)
        console.log(`${merchant.outputFree} done`)
    } else {
        console.log('HTTP Error: ' + response.status)
    }
})()
