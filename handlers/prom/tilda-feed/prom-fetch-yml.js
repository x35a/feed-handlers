const fs = require('fs')
const util = require('util')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({ cdata: true })
const excludeList = require('./exclude')
const fetchFeed = require('../../../common/fetch-feed')

const path = require('../../../common/feeds-path')
const outputFilePath = path.prom.output
const { tldYMLLink } = require('../../../common/const')
const washbasin = require('./washbasin')

// tilda products to prom
// xml to xml

;(async () => {
    // Get yml
    const text = await fetchFeed(tldYMLLink)
    if (!text) return `Fetching Error ${tldYMLLink}`

    // Parse yml
    parser.parseString(text, function (err, result) {
        // Update <offer> tag
        const offers = result.yml_catalog.shop[0].offers[0].offer

        // Remove products
        const filtered_offers = offers.filter(
            (offer) => !excludeList.includes(offer['$'].id)
        )
        result.yml_catalog.shop[0].offers[0].offer = filtered_offers

        offers.forEach((offer) => {
            // Add available attr
            //offer['$'].available = 'true'

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

        // Add washbasins
        result.yml_catalog.shop[0].offers[0].offer.push(washbasin.ek01)
        result.yml_catalog.shop[0].offers[0].offer.push(washbasin.ek02)
        result.yml_catalog.shop[0].offers[0].offer.push(washbasin.ek03)

        // Build xml
        const xml = builder.buildObject(result)
        fs.writeFileSync(outputFilePath, xml)

        console.log('prom-feed.yml done')
        //console.log('offers', offers.length)
    })
})()
