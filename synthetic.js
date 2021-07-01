const fs = require('fs')
const util = require('util')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({cdata: true})

const input_file_name = 'tilda-feed'
const output_file_name = 'synthetic-feed-edited'
const output_folder = 'output'
const vendor_name = 'Smart Food Shop'
const producing_country = 'Польша'

// Read feed file
fs.readFile(`./${input_file_name}.yml`, function(err, data) {
    parser.parseString(data, function (err, result) {
        //console.log(util.inspect(result, false, null))

        // Update <offer> tag
        const offers = result.yml_catalog.shop[0].offers[0].offer
        offers.forEach(offer => {
            
            // Add available attr
            offer['$'].available = 'true';

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
        const xml = builder.buildObject(result);
        fs.writeFileSync(`./${output_folder}/${output_file_name}.yml`, xml)

        console.log('Synthetic feed done');
    });
});