// CSV export file failed.
// No category ID in csv file - filter by category is not possible.

const fs = require('fs')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({ cdata: true })
const path = require('./shared/path')
const cloneDeep = require('lodash/cloneDeep')

const input_file_name = path.input.yml //'tilda-feed'
const output_folder = path.output.folder //'output'

const input_file_data = fs.readFileSync(
    `./${path.input.folder}/${input_file_name}`
)

const rulesSettings = {
    includeCategories: [
        '907149595291',
        '742941910481',
        '444943533321',
        '903569256651',
        '866426313361',
        '287161144321',
        '456028571861',
        '910272790511',
        '443169019671',
        '715825165071',
        '516822319031',
        '300028999651',
        '426550774261',
        '635698216721',
        '847107982971',
        '320586217181'
    ], // get all categories if empty
    excludeCategories: [],
    percentToAddToThePrice: 0.05, // 5%
    specificRules: [
        {
            categoryID: '907149595291',
            percentToAddToThePrice: 0.05
        },
        {
            categoryID: '742941910481',
            percentToAddToThePrice: 0.1
        },
        {
            categoryID: '444943533321',
            percentToAddToThePrice: 0.05
        },
        {
            categoryID: '903569256651',
            percentToAddToThePrice: 0.05
        },
        {
            categoryID: '866426313361',
            percentToAddToThePrice: 0.1
        },
        {
            categoryID: '287161144321',
            percentToAddToThePrice: 0.1
        },
        {
            categoryID: '456028571861',
            percentToAddToThePrice: 0.05
        },
        {
            categoryID: '910272790511',
            percentToAddToThePrice: 0.1
        },
        {
            categoryID: '443169019671',
            percentToAddToThePrice: 0.05
        },
        {
            categoryID: '715825165071',
            percentToAddToThePrice: 0.05
        },
        {
            categoryID: '516822319031',
            percentToAddToThePrice: 0.1
        },
        {
            categoryID: '300028999651',
            percentToAddToThePrice: 0.05
        },
        {
            categoryID: '426550774261',
            percentToAddToThePrice: 0.05
        },
        {
            categoryID: '635698216721',
            percentToAddToThePrice: 0.1
        },
        {
            categoryID: '847107982971',
            percentToAddToThePrice: 0.05
        },
        {
            categoryID: '320586217181',
            percentToAddToThePrice: 0.05
        }
    ]
}

const updatePrice = (price, percent) => Math.ceil(+price + price * percent)

const createCategoryChangeList = (
    feedCategories,
    feedOffers,
    rulesSettings
) => {
    // feedCategories // [{ _: 'Снеки', '$': { id: '907149595291' } }]
    let categoryChangeList = []

    feedCategories.forEach((feedCategory) => {
        const categoryID = feedCategory.$.id
        const categoryName = feedCategory._

        // Skip category if there are no referenced products
        const productsInCategory = feedOffers.find(
            (offer) => offer.categoryId[0] === categoryID
        )
        if (!productsInCategory) return

        // Find specific rule
        const specificRule = rulesSettings.specificRules.find(
            (rule) => rule.categoryID === categoryID
        )

        // Find percent to add
        const percentToAddToThePrice = specificRule
            ? specificRule.percentToAddToThePrice
            : rulesSettings.percentToAddToThePrice

        // Create a rule object
        const aChangeRule = {
            categoryID: categoryID,
            categoryName: categoryName,
            percentToAddToThePrice: percentToAddToThePrice
        }

        // Filter by include
        if (
            rulesSettings.includeCategories.length &&
            rulesSettings.includeCategories.includes(categoryID)
        ) {
            categoryChangeList.push(aChangeRule)
            return
        }

        // Filter by exclude
        if (
            !rulesSettings.includeCategories.length &&
            !rulesSettings.excludeCategories.includes(categoryID)
        ) {
            categoryChangeList.push(aChangeRule)
            return
        }
    })

    return categoryChangeList
}

parser.parseString(input_file_data, function (err, result) {
    const offers = result.yml_catalog.shop[0].offers[0].offer
    const categories = result.yml_catalog.shop[0].categories[0].category
    const categoryChangeList = createCategoryChangeList(
        categories,
        offers,
        rulesSettings
    )

    categoryChangeList.forEach((category) => {
        const feed = cloneDeep(result)
        const categoryID = category.categoryID
        const categoryName = category.categoryName
        const percentToAddToThePrice = category.percentToAddToThePrice

        // Find target category in feed
        const categoryObject =
            feed.yml_catalog.shop[0].categories[0].category.find(
                (cat) => cat.$.id === categoryID
            )

        // Replace categories in feed
        feed.yml_catalog.shop[0].categories[0].category = [categoryObject]

        // Filter target offers
        const categoryOffers = feed.yml_catalog.shop[0].offers[0].offer.filter(
            (offer) => offer.categoryId[0] === categoryID
        )

        // Update offer price
        categoryOffers.forEach((offer) => {
            offer.price = updatePrice(offer.price[0], percentToAddToThePrice)
        })

        // Replace offers in feed
        feed.yml_catalog.shop[0].offers[0].offer = categoryOffers

        // Build xml
        const xml = builder.buildObject(feed)
        fs.writeFileSync(
            `./${output_folder}/${categoryID} ${categoryName}.yml`,
            xml
        )
    })

    console.log('prices updated')
})
