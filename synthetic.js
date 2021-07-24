const fs = require('fs')
const util = require('util')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({cdata: true})
const path = require('./path')
const beer = require('./feed_data/beer')

const input_file_name = path.synthetic.input.file //'tilda-feed'
const output_file_name = path.synthetic.output.file //'synthetic-feed-edited'
const output_folder = path.output.folder //'output'
const vendor_name = 'Smart Food Shop'
const producing_country = 'Польша'

// Read feed file
const feed_content = fs.readFileSync(`./${path.input.folder}/${input_file_name}`)

parser.parseString(feed_content, function (err, result) {
    //console.log(util.inspect(result, false, null))
    let offers = result.yml_catalog.shop[0].offers[0].offer

    // Remove beer
    // synth doesn't support 18+ products
    const offers_without_beer = offers.filter(offer => !beer.includes(offer['$'].id))
    result.yml_catalog.shop[0].offers[0].offer = offers_without_beer

    // Update <offer> tag
    offers.forEach(offer => {
        
        // Add available attr
        offer['$'].available = 'true';

        // Add <quantity>
        offer.quantity = 100

        // Enforce adding <cdata> in description
        offer.description = offer.description + '<!--Enforce cdata-->'

        // Check <vendor> tag
        if (!offer.vendor) offer.vendor = [vendor_name]
        else if (!offer.vendor[0]) offer.vendor[0] = vendor_name

        // Check <param> existance
        // If no params add producing country param
        if (!offer.param) offer.param = [{ _: producing_country, '$': { name: 'Производитель' }}]
    })

    // Make output dir
    if (!fs.existsSync(`./${output_folder}`)) fs.mkdirSync(`./${output_folder}`)

    // Build xml
    const xml = builder.buildObject(result)
    fs.writeFileSync(`./${output_folder}/${output_file_name}`, xml)

    console.log('synthetic feed done')
})