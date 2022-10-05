const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const stringify = require('csv-stringify/lib/sync')
const path = require('./shared/path')

const input_file_name = path.vseua.input.file //'tilda-feed'
const output_file_name = path.vseua.output.file //'vseua-feed'
const output_folder = path.output.folder //'output'

const csv_file = fs.readFileSync(`./${path.input.folder}/${input_file_name}`)

// todo:
// extract categories from feed insted of changesList
// make possible filters like: include/exclude cat; set price + % to each category individually
// make possible output one file or many files by category
const changesList = [
    {
        categoryID: '907149595291',
        percentToAddToThePrice: 0.05, // 5%
        active: true
    },
    {
        categoryID: '903569256651',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '866426313361',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '444943533321',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '456028571861',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '287161144321',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '658530553911',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '910272790511',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '441079117491',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '443169019671',
        percentToAddToThePrice: 0.05,
        active: false
    },
    {
        categoryID: '439103222771',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '715825165071',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '742941910481',
        percentToAddToThePrice: 0.05,
        active: false
    },
    {
        categoryID: '320586217181',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '516822319031',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '188559425471',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '466871267201',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '300028999651',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '635698216721',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '426550774261',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '152485699881',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '720640154791',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '847107982971',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '647536114381',
        percentToAddToThePrice: 0.05,
        active: true
    },
    {
        categoryID: '798974541701',
        percentToAddToThePrice: 0.05,
        active: true
    }
]

const updatePrice = (price, percent) => Math.ceil(+price + price * percent)

// https://csv.js.org/parse/api/sync/
const products_list = parse(csv_file, {
    columns: true,
    skip_empty_lines: true
})
console.log(products_list)

// Add Quantity: stock
products_list.forEach((product) =>
    !product.Quantity ? (product.Quantity = 'stock') : ''
)

// Make output dir
if (!fs.existsSync(`./${output_folder}`)) fs.mkdirSync(`./${output_folder}`)

// Build csv
const products_list_stringified = stringify(products_list, { header: true })
fs.writeFileSync(
    `./${output_folder}/${output_file_name}`,
    products_list_stringified
)

console.log('vseua feed done')