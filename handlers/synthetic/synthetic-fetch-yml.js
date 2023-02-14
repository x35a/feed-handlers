const fs = require('fs')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({ cdata: true })

const path = require('../../common/feeds-path')
const outputFilePath = path.synthetic.output

const excludeList = require('./exclude')
const vendor_name = 'Smart Food Shop'
const feedDone = 'synthetic-feed.yml done'
const feedYMLlink =
    'https://smartfood.org.ua/tstore/yml/96283d7854beada45245c1187fac3dd2.yml'

;(async () => {
    let response = await fetch(feedYMLlink)

    if (response.ok) {
        // Get .yml
        let text = await response.text()

        parser.parseString(text, function (err, result) {
            const offers = result.yml_catalog.shop[0].offers[0].offer

            // Remove products
            const filtered_offers = offers.filter(
                (offer) => !excludeList.includes(offer['$'].id)
            )
            result.yml_catalog.shop[0].offers[0].offer = filtered_offers

            // Update <offer> tag
            offers.forEach((offer, index) => {
                // Add available attr
                //offer['$'].available = 'true'

                // Add <quantity>
                offer.quantity = 100

                // Enforce adding <cdata> in description
                offer.description = offer.description + '<!--Enforce cdata-->'

                // Add <vendor>
                if (!offer.vendor) offer.vendor = [vendor_name]

                // Add <param>
                if (!offer.param)
                    offer.param = [
                        { _: vendor_name, $: { name: "Дистриб'ютор" } }
                    ]

                // Remove disallowed symbols in <name>, <vendor>, <param>
                // synth docs, item 1.2 https://spv-doc.atlassian.net/wiki/spaces/SYN/pages/621641729/XML+YML+Synthetic.ua
                offer.name[0] = offer.name[0].replace(/"|'|&|<|>/g, '')
                offer.vendor[0] = offer.vendor[0].replace(/"|'|&|<|>/g, '')
                offer.param.forEach(
                    (param, index) =>
                        (offer.param[index]['_'] = param['_'].replace(
                            /"|'|&|<|>/g,
                            ''
                        ))
                )
                // test
                //if (/"|'|&|<|>/g.test(offer.name)) console.log(offer.name)
                //if (/"|'|&|<|>/g.test(offer.vendor)) console.log(offer.vendor)
            })

            // Build xml
            const xml = builder.buildObject(result)
            fs.writeFileSync(outputFilePath, xml)

            console.log(feedDone)
        })
    } else {
        console.log('HTTP Error: ' + response.status)
    }
})()