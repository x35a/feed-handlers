const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const { tldYMLLink } = require('./const')

;(async () => {
    console.log('FIND MISSED IMAGES')

    let response = await fetch(tldYMLLink)

    if (response.ok) {
        // Get .yml
        let text = await response.text()

        // Parse yml
        parser.parseString(text, function (err, result) {
            const offers = result.yml_catalog.shop[0].offers[0].offer

            offers.forEach((offer) => {
                if (!offer.picture) console.log(offer.$.id)
            })
        })
    } else {
        console.log('HTTP Error: ' + response.status)
    }
})()
