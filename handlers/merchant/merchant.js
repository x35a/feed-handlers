const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const stringify = require('csv-stringify/lib/sync')
const {
    adAllowed,
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
    const columns = []
    const feedCustomLabel0 = 'custom_label_0'
    const feedCustomLabel1 = 'custom_label_1'

    // Get csv
    const text = await fetchFeed(tldCSVLink)
    if (!text) return `Fetching Error ${tldCSVLink}`

    // Parse .csv data
    const productsList = parse(text, {
        columns: (header) =>
            header.map((column) => {
                columns.push(column) // collect column names
                return column
            }),
        skip_empty_lines: true
    })

    let adProducts = []
    let freeProducts = []

    // Filters
    productsList.forEach((product, index) => {
        // Assign custom labels
        // attribute: custom_label_0
        // attr definition:	Ad label
        // values: ad, free
        // attribute: custom_label_1
        // attr definition:	Product type
        // Example values: snacks, cheese, etc
        // https://support.google.com/merchants/answer/6324473#zippy=%2Cexample-values%2Ccustom-label-definitions
        // https://support.google.com/merchants/answer/7052112?sjid=14806723072595054663-EU

        adAllowed.categoryName.includes(product.product_type) ||
        adAllowed.productID.includes(product.id)
            ? (product[feedCustomLabel0] = 'ad')
            : (product[feedCustomLabel0] = 'free')

        if (product.product_type === 'Снеки') {
            product[feedCustomLabel1] = 'snacks'
        } else {
            product[feedCustomLabel1] = ''
        }

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
        if (parseInt(product.price.replace(/,/g, '')) >= priceLowerBoundry) {
            adProducts.push(product)
        } else {
            freeProducts.push(product)
        }
    })

    // Build tsv

    // Add custom_label_0 column
    columns.push(feedCustomLabel0, feedCustomLabel1)

    let i = 0
    while (i < 2) {
        console.log(adProducts[i])
        i++
    }

    const adProductsStringified = stringify(adProducts, {
        header: true,
        //columns: columns,
        //quoted_empty: true,
        delimiter: '\t'
    })
    fs.writeFileSync(merchant.outputAd, adProductsStringified)
    console.log(`${merchant.outputAd} done`)

    const freeProductsStringified = stringify(freeProducts, {
        header: true,
        //columns: columns,
        //quoted_empty: true,
        delimiter: '\t'
    })
    fs.writeFileSync(merchant.outputFree, freeProductsStringified)
    console.log(`${merchant.outputFree} done`)
})()
