// Find 
// products with "all" category (means that product has no category)
// products with shared category (top products, holydays, summer, etc)

const fs = require('fs')
const util = require('util')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const path = require('./shared/path')
const allowed_categories = require('./feed_data/categories')

const input_file_path = `./${path.input.folder}/${path.input.yml}`

// Read feed file
const feed_content = fs.readFileSync(input_file_path)

parser.parseString(feed_content, function (err, result) {
    const offers = result.yml_catalog.shop[0].offers[0].offer
    let products_with_missed_category = []
    
    offers.forEach(offer => {
      const offer_category_id = offer.categoryId[0]
      const allowed_category = allowed_categories.find(category => category.id === offer_category_id)
      if (!allowed_category) products_with_missed_category.push({id: offer["$"].id, name: offer.name[0]}) // console.log(offer)
    })

    if (products_with_missed_category.length) {
      console.warn('FOUND PRODUCTS WITH MISSED CATEGORY')
      console.table(products_with_missed_category)
    }
    else console.log('Category test done')
})