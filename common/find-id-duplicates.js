const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const { tldYMLLink } = require('./const')

;(async () => {
    console.log('FIND ID DUPLICATES')

    let response = await fetch(tldYMLLink)

    if (response.ok) {
        // Get .yml
        let text = await response.text()

        // Parse yml
        parser.parseString(text, function (err, result) {
            const offers = result.yml_catalog.shop[0].offers[0].offer

            let set = new Set()
            let idDuplicates = []

            offers.forEach((offer) => {
                set.has(offer.$.id)
                    ? idDuplicates.push(offer.$.id)
                    : set.add(offer.$.id)
            })

            console.log('duplicates', idDuplicates)
        })
    } else {
        console.log('HTTP Error: ' + response.status)
    }
})()
