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
            let vendorCodeDuplicates = []

            offers.forEach((offer) => {
                set.has(offer.$.id)
                    ? idDuplicates.push(offer.$.id)
                    : set.add(offer.$.id)

                if (!offer.vendorCode[0])
                    return console.log(
                        `<vendorCode> not found product id: ${offer.$.id}`
                    )

                set.has(offer.vendorCode[0])
                    ? vendorCodeDuplicates.push(offer.vendorCode[0])
                    : set.add(offer.vendorCode[0])
            })

            console.log('ID Duplicates', idDuplicates)
            console.log('<vendorCode> Duplicates', vendorCodeDuplicates)
        })
    } else {
        console.log('HTTP Error: ' + response.status)
    }
})()
