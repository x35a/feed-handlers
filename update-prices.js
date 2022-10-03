const fs = require('fs')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({ cdata: true })
const path = require('./shared/path')

const updatePrice = (price, percent) => Math.ceil(+price + price * percent)

const changesList = [
    {
        categoryID: '907149595291',
        percentToAddToThePrice: 0.05, // 5%
        active: true
    },
    {
        categoryID: '903569256651',
        percentToAddToThePrice: 0.05,
        active: false
    }
]
const categories = changesList.map((category) => category.categoryID)
console.log(categories)

const beer = require('./feed_data/beer')
const ru_cans = [
    '647977965791',
    '585033696611',
    '204949597221',
    '193868340851',
    '554583485411',
    '111735614071',
    '432736792841',
    '822403725721',
    '974512923591'
] // dobroflot
const caviar = [
    '449478458271',
    '732519722811',
    '521676464691',
    '612843888421',
    '472843531421',
    '274404744471',
    '639176784161',
    '515567209421',
    '833511309741',
    '834978246171',
    '160445044221'
]
const products_tobe_removed = [].concat(beer, ru_cans, caviar)

const input_file_name = path.input.yml //'tilda-feed'
const output_file_name = path.input.yml //'tilda-feed'
const output_folder = path.output.folder //'output'

const input_file_data = fs.readFileSync(
    `./${path.input.folder}/${input_file_name}`
)

parser.parseString(input_file_data, function (err, result) {
    const offers = result.yml_catalog.shop[0].offers[0].offer

    offers.forEach((offer) => {
        const categoryIndex = categories.findIndex(
            (cat) => cat == offer.categoryId
        )
        const priceToBeUpdated =
            categoryIndex >= 0 && changesList[categoryIndex].active

        if (!priceToBeUpdated) return

        // Update price
        offer.price = updatePrice(
            offer.price,
            changesList[categoryIndex].percentToAddToThePrice
        )
    })

    // Make output dir
    if (!fs.existsSync(`./${output_folder}`)) fs.mkdirSync(`./${output_folder}`)

    // Build xml
    const xml = builder.buildObject(result)
    fs.writeFileSync(`./${output_folder}/${output_file_name}`, xml)

    console.log('prices updated')
    //console.log('offers', offers.length)
})
