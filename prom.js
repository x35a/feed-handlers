const fs = require('fs')
const util = require('util')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({cdata: true})
const path = require('./path')

const input_file_name = path.prom.input.file //'tilda-feed'
const output_file_name = path.prom.output.file //'prom-feed'
const output_folder = path.output.folder //'output'

const input_file_data = fs.readFileSync(`./${path.input.folder}/${input_file_name}`)

parser.parseString(input_file_data, function (err, result) {
    // Update <offer> tag
    const offers = result.yml_catalog.shop[0].offers[0].offer
    offers.forEach(offer => {
        
        // Add available attr
        offer['$'].available = 'true'
    })

    // Make output dir
    if (!fs.existsSync(`./${output_folder}`)) fs.mkdirSync(`./${output_folder}`)

    // Build xml
    const xml = builder.buildObject(result);
    fs.writeFileSync(`./${output_folder}/${output_file_name}`, xml)

    console.log('prom feed done')
    //console.log('offers', offers.length)
})