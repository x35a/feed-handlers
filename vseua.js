const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const stringify = require('csv-stringify/lib/sync')

const input_file_name = 'tilda-feed'
const output_file_name = 'vseua-feed'
const output_folder = 'output'

const csv_file_data = fs.readFileSync(`./${input_file_name}.csv`)

const products_list = parse(csv_file_data, {
  columns: true,
  skip_empty_lines: true
})

// Add Quantity: stock
products_list.forEach(product => !product.Quantity ? product.Quantity = 'stock' : '')

// Make output dir
if (!fs.existsSync(`./${output_folder}`)) fs.mkdirSync(`./${output_folder}`)

// Build csv
const products_list_stringified = stringify(products_list, { header: true })
fs.writeFileSync(`./${output_folder}/${output_file_name}.csv`, products_list_stringified)

console.log('vseua feed done')