const fs = require('fs')
const util = require('util')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({cdata: true})
const path = require('./path')

const input_file_name = path.flagma.input.file //'tilda-feed'
const output_file_name = path.flagma.output.file //'flagma-feed'
const output_folder = path.output.folder //'output'
const allowed_categories = [
    {id: '907149595291'}, // Снеки
    {id: '903569256651'}, // Консервация, консервы
    {id: '866426313361'}, // Орехи
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
    {id: '320586217181'}, // Масло
    {id: '516822319031'}, // Чай
    {id: '188559425471'}, // Мука, крупы, мюсли, кранчи
    {id: '466871267201'}, // Рыба, икра, морепродукты
    {id: '300028999651'}, // Кондитерские изделия
    {id: '635698216721'}, // Напитки, соки, сиропы
    {id: '426550774261'}, // Семена, семечки
    {id: '152485699881'}, // Соления
    {id: '720640154791'}, // Джем, варенье
    {id: '847107982971'}, // Сахар, соль
    {id: '647536114381'}, // Пряности и специи
    {id: '683060012691'} // Микрогрины, микрозелень
]
const disallowed_products = [
    '548805709201',
    '185027128611',
    '707371010191',
    '344282592881',
    '327085478361',
    '313013215591'
]

// Read feed file
fs.readFile(`./${path.input.folder}/${input_file_name}`, function(err, data) {
    parser.parseString(data, function (err, result) {
        //console.log(util.inspect(result, false, null))

        // Delete disallowed categories
        const categories = result.yml_catalog.shop[0].categories[0].category
        categories.forEach((category, index) => {
            const current_category_id = category['$'].id
            const allowed_category = allowed_categories.find(allowed_category => allowed_category.id === current_category_id)
            // Delete category
            if (!allowed_category) delete categories[index]
        })

        // Update <offer> tag
        const offers = result.yml_catalog.shop[0].offers[0].offer
        offers.forEach((offer, index) => {
            
            // Remove disallowed products
            if (disallowed_products.includes(offer['$'].id)) return delete offers[index]
            
            // Add available attr
            offer['$'].available = 'true';

            // Replace <picture> to <photo> tag
            offer.photo = offer.picture
            delete offer.picture
        })

        // Make output dir
        if (!fs.existsSync(`./${output_folder}`)) fs.mkdirSync(`./${output_folder}`)

        // Build xml
        const xml = builder.buildObject(result)
        fs.writeFileSync(`./${output_folder}/${output_file_name}`, xml)

        console.log('Flagma feed done')
    })
})