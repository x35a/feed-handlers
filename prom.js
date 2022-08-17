const fs = require('fs')
const util = require('util')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({cdata: true})
const path = require('./shared/path')

const beer = require('./feed_data/beer')
const ru_cans = ['647977965791', '585033696611', '204949597221', '193868340851', '554583485411', '111735614071', '432736792841', '822403725721', '974512923591'] // dobroflot
const caviar = ['449478458271', '732519722811', '521676464691', '612843888421', '472843531421', '274404744471', '639176784161', '515567209421', '833511309741', '834978246171', '160445044221']
const products_tobe_removed = [].concat(beer, ru_cans, caviar)

const input_file_name = path.prom.input.file //'tilda-feed'
const output_file_name = path.prom.output.file //'prom-feed'
const output_folder = path.output.folder //'output'

const input_file_data = fs.readFileSync(`./${path.input.folder}/${input_file_name}`)

parser.parseString(input_file_data, function (err, result) {
    // Update <offer> tag
    const offers = result.yml_catalog.shop[0].offers[0].offer

    // Remove products
    const filtered_offers = offers.filter(offer => !products_tobe_removed.includes(offer['$'].id))
    result.yml_catalog.shop[0].offers[0].offer = filtered_offers

    offers.forEach(offer => {
        
        // Add available attr
        offer['$'].available = 'true'

        // Trim group_id length. Prom supports only 9 numbers.
        let group_id = offer['$'].group_id
        if (group_id) offer['$'].group_id = group_id.substr(0, 9)

        // Enforce adding <cdata> in description
        offer.description = offer.description + '<!--Enforce cdata-->'

        // Delete <vendor> cause it makes import errors. 
        // Reason - prom has own vendors white list, if the vendor (in feed) is out of the list then import error happens.
        // It was easier to delete vendor fields than trying to push new vendors into prom's list.
        delete offer.vendor
    })

    // Make output dir
    if (!fs.existsSync(`./${output_folder}`)) fs.mkdirSync(`./${output_folder}`)

    // Build xml
    const xml = builder.buildObject(result);
    fs.writeFileSync(`./${output_folder}/${output_file_name}`, xml)

    console.log('prom feed done')
    //console.log('offers', offers.length)
})