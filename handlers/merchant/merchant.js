const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const stringify = require('csv-stringify/lib/sync')
const {
    adAllowedList,
    excludeIDList,
    stopWords,
    stopCategories,
    priceLowerBoundry,
    violationOfGooglePoliciesIDList,
    tooLongDescription,
    excessiveCapitalizationIDList
} = require('./ad-filter')
const { merchant } = require('../../common/feeds-path')
const { tldCSVLink } = require('../../common/const')
const fetchFeed = require('../../common/fetch-feed')

// In Google Merchant Setting
// Set Delimiter: Tab
// Uncheck 'Use quoted fields' checkbox

;(async () => {
    // Get csv
    const text = await fetchFeed(tldCSVLink)

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

        // Skip Violation IDs
        if (violationOfGooglePoliciesIDList.includes(product.id)) return

        // Truncate too long Description
        if (tooLongDescription.IDList.includes(product.id))
            product.description = tooLongDescription.truncate(
                product.description
            )

        // Fix Title Excessive Capitalization
        if (excessiveCapitalizationIDList.includes(product.id))
            product.title = product.title.toLowerCase()

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
})()
