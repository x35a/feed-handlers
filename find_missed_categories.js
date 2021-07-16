// Find 
// products with "all" category (means that product has no category)
// products with shared category (top products, holydays, summer, etc)

const fs = require('fs')
const util = require('util')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()

const input_file_name = 'tilda-feed'
const allowed_categories = [
    {id: '907149595291'}, // Снеки
    {id: '903569256651'}, // Консервация, консервы
    {id: '866426313361'}, // Орехи
    {id: '683060012691'}, // Микрогрины, микрозелень
    {id: '444943533321'}, // Шоколад и Сладости
    {id: '456028571861'}, // Сухофрукты и цукаты
    {id: '287161144321'}, // Восточные сладости
    {id: '658530553911'}, // Шоколадно-ореховые пасты
    {id: '910272790511'}, // Макаронные изделия
    {id: '441079117491'}, // Соусы
    {id: '443169019671'}, // Сыры и молочная продукция
    {id: '439103222771'}, // Грибы
    {id: '715825165071'}, // Колбасы, хамон, тушенка
    {id: '742941910481'}, // Кофе, Какао
    {id: '516822319031'}, // Чай
    {id: '320586217181'}, // Масло
    {id: '188559425471'}, // Мука, крупы, мюсли, кранчи
    {id: '466871267201'}, // Рыба, икра, морепродукты
    {id: '300028999651'}, // Кондитерские изделия
    {id: '635698216721'}, // Напитки, соки, сиропы
    {id: '426550774261'}, // Семена, семечки
    {id: '152485699881'}, // Соления
    //{id: '720640154791'}, // Джем, варенье
    {id: '847107982971'}, // Сахар, соль
    {id: '647536114381'}, // Пряности и специи
]

const input_file_data = fs.readFileSync(`./${input_file_name}.yml`)

parser.parseString(input_file_data, function (err, result) {
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
})