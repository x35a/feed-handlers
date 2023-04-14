const fs = require('fs')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()

const excludeList = [
    // dobroflot
    [
        '647977965791',
        '585033696611',
        '204949597221',
        '193868340851',
        '554583485411',
        '111735614071',
        '432736792841',
        '822403725721',
        '974512923591'
    ],
    // caviar
    [
        '449478458271',
        '732519722811',
        '521676464691',
        '612843888421',
        '472843531421',
        '274404744471',
        '639176784161',
        '515567209421',
        '833511309741',
        '834978246171',
        '160445044221'
    ],
    // beer
    [
        '548805709201',
        '185027128611',
        '707371010191',
        '344282592881',
        '327085478361',
        '313013215591',
        '211928481371',
        '753682278131',
        '660141589511',
        '350100578251'
    ]
]

// Exclude aveopt products
// const aveoptXMLFeed = fs.readFileSync('./handlers/aveopt/products_feed.xml')
// const aveoptIDList = []
// parser.parseString(aveoptXMLFeed, function (err, result) {
//     result.yml_catalog.shop[0].offers[0].offer.forEach((product) => {
//         aveoptIDList.push(product.$.id)
//     })
// })
// excludeList.push(aveoptIDList)

exports.excludeList = excludeList.flat()
exports.priceLowerBoundry = 299
