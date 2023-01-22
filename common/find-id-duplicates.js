const fs = require('fs')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({ cdata: true })

const feedYMLlink =
    'https://smartfood.org.ua/tstore/yml/96283d7854beada45245c1187fac3dd2.yml'

;(async () => {
    let response = await fetch(feedYMLlink)

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
