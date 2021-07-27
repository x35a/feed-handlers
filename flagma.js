const fs = require('fs')
const util = require('util')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({cdata: true})
const path = require('./shared/path')
const make_output_dir = require('./shared/make_output_dir')
const beer = require('./feed_data/beer')

const input_file_path = `./${path.input.folder}/${path.flagma.input.file}` 
const output_file_path = `./${path.output.folder}/${path.flagma.output.file}`

// Make output dir
make_output_dir(path.output.folder)

// Read feed file
const feed_content = fs.readFileSync(input_file_path)

// Read feed file
parser.parseString(feed_content, function (err, result) {
    //console.log(util.inspect(result, false, null))
    const offers = result.yml_catalog.shop[0].offers[0].offer

    // Remove beer
    const offers_without_beer = offers.filter(offer => !beer.includes(offer['$'].id))
    result.yml_catalog.shop[0].offers[0].offer = offers_without_beer

    // Update <offer> tag    
    offers.forEach((offer, index) => {
        
        // Add available attr
        offer['$'].available = 'true';

        // Replace <picture> to <photo> tag
        offer.photo = offer.picture
        delete offer.picture
    })

    // Make output dir
    //if (!fs.existsSync(`./${output_folder}`)) fs.mkdirSync(`./${output_folder}`)

    // Build xml
    const xml = builder.buildObject(result)
    fs.writeFileSync(output_file_path, xml)

    console.log('Flagma feed done')
})