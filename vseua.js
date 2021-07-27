const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const stringify = require('csv-stringify/lib/sync')
const path = require('./shared/path')

const input_file_name = path.vseua.input.file //'tilda-feed'
const output_file_name = path.vseua.output.file //'vseua-feed'
const output_folder = path.output.folder //'output'

const csv_file_data = fs.readFileSync(`./${path.input.folder}/${input_file_name}`)

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
fs.writeFileSync(`./${output_folder}/${output_file_name}`, products_list_stringified)

console.log('vseua feed done')