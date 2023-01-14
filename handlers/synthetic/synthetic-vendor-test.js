const fs = require('fs')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const path = require('./shared/path')

const output_file_path = `./${path.output.folder}/${path.synthetic.output.file}`

// Test <vendor> existance
module.exports = () => {
    const feed_content_edited = fs.readFileSync(output_file_path)
    parser.parseString(feed_content_edited, function (err, result) {
        const offers = result.yml_catalog.shop[0].offers[0].offer
        offers.forEach(offer => {
            if (!offer.vendor) console.log(`WARN, no <vendor>, id: ${offer['$'].id}`)
        })
    })
}