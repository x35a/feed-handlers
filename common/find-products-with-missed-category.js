// Find
// products with "all" category (means that product has no category)
// products with shared category (top products, holydays, summer, etc)

const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const fetchFeed = require('./fetch-feed')
const { tldYMLLink } = require('./const')

;(async () => {
    const feedText = await fetchFeed(tldYMLLink)
    const feedObject = await parser.parseStringPromise(feedText)
    const offers = feedObject.yml_catalog.shop[0].offers[0].offer
    offers.forEach((offer) => {
        const [categoryID] = offer.categoryId
        if (categoryID === '865603265821')
            console.log(
                `OFFER ID: ${offer.$.id} vendorCode: ${offer.vendorCode}`
            ) // 865603265821 is All category in tld
    })
    console.log('Search done')
})()
