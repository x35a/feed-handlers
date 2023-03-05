const fs = require('fs')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const sharp = require('sharp')
const feedPath = './handlers/aveopt/products_feed.xml'
const imagesRootFolderPath = `${__dirname}/images`

const noImgProductsID = ['1713782761', '1721553914', '1744931706', '1771646236']

;(async () => {
    if (!fs.existsSync(imagesRootFolderPath)) {
        fs.mkdirSync(imagesRootFolderPath)
        console.log('Created /images folder\n')
    }

    console.log(`Reading ${feedPath}\n`)
    const feedText = fs.readFileSync(feedPath)
    const feedObject = await parser.parseStringPromise(feedText)
    let feedOffers = feedObject.yml_catalog.shop[0].offers[0].offer

    let noImgProducts = []
    noImgProductsID.forEach((noImgProductID) => {
        const offer = feedOffers.find((offer) => offer.$.id === noImgProductID)
        if (!offer) return
        const folderPath = `${imagesRootFolderPath}/${offer.$.id}`
        noImgProducts.push({
            id: offer.$.id,
            pictures: [...offer.picture],
            folder: folderPath
        })
        fs.mkdirSync(folderPath)
    })

    for (product of noImgProducts) {
        for (pictureURL of product.pictures) {
            const pictureName = pictureURL.match(
                /[^/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/g
            )
            if (!pictureName[0])
                return console.log(
                    `pictureName is not found id: ${product.id} url: ${pictureURL}`
                )

            console.log(
                `Fetching PRODUCT ID: ${product.id} IMAGE URL ${pictureURL}\n`
            )
            const response = await fetch(pictureURL)
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer()
                const uint8Array = new Uint8Array(arrayBuffer) // https://learn.javascript.ru/arraybuffer-binary-arrays#metody-typedarray
                sharp(uint8Array).toFile(`${product.folder}/${pictureName}`) // https://sharp.pixelplumbing.com/api-constructor
            } else {
                console.log('HTTP Error: ' + response.status)
            }
        }
    }
})()
