const fs = require('fs')
const util = require('util')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({cdata: true})
const path = require('./shared/path')
const make_output_dir = require('./shared/make_output_dir')
const beer = require('./feed_data/beer')

const input_file_path = `./${path.input.folder}/${path.flagma.input.file}` 
const output_file_path = `./${path.output.folder}/${path.flagma.output.file}`

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

// Make output dir
make_output_dir(path.output.folder)

// Read feed file
const feed_content = fs.readFileSync(input_file_path)

// Read feed file
parser.parseString(feed_content, function (err, result) {
    //console.log(util.inspect(result, false, null))
    const offers = result.yml_catalog.shop[0].offers[0].offer

    // Remove beer
    const offers_without_beer = offers.filter(offer => !beer.includes(offer['$'].id))
    result.yml_catalog.shop[0].offers[0].offer = offers_without_beer

    // Delete disallowed categories
    const categories = result.yml_catalog.shop[0].categories[0].category
    categories.forEach((category, index) => {
        const current_category_id = category['$'].id
        const allowed_category = allowed_categories.find(allowed_category => allowed_category.id === current_category_id)
        // Delete category
        if (!allowed_category) delete categories[index]
    })

    // Update <offer> tag    
    offers.forEach((offer, index) => {
        
        // Add available attr
        offer['$'].available = 'true';

        // Replace <picture> to <photo> tag
        offer.photo = offer.picture
        delete offer.picture
    })

    // Make output dir
    //if (!fs.existsSync(`./${output_folder}`)) fs.mkdirSync(`./${output_folder}`)

    // Build xml
    const xml = builder.buildObject(result)
    fs.writeFileSync(output_file_path, xml)

    console.log('Flagma feed done')
})