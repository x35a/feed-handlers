const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const stringify = require('csv-stringify/lib/sync')

const path = require('./common/path')
const inputFilePath = path.vseua.input
const outputFilePath = path.vseua.output

const feedData = fs.readFileSync(inputFilePath)

const products_list = parse(feedData, {
    columns: true,
    skip_empty_lines: true
})

// Add Quantity: stock
products_list.forEach((product) =>
    !product.Quantity ? (product.Quantity = 'stock') : ''
)

// Build csv
const products_list_stringified = stringify(products_list, { header: true })
fs.writeFileSync(outputFilePath, products_list_stringified)

console.log('vseua feed done')
