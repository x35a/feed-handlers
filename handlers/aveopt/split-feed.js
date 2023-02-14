const cloneDeep = require('lodash/cloneDeep')

module.exports = (offers, feedObject) => {
    const chunkMaxSize = 300 // max products in chunk

    console.log(`Feed splitting\nTotal offers ${offers.length}`)
    console.log(`Chunks`)
    let chunks = []
    let chunk = []
    for (let i = 0; i < offers.length; i++) {
        if (chunk.length === chunkMaxSize) {
            chunks.push(chunk)
            chunk = []
            chunk.push(offers[i])
            continue
        } else if (i === offers.length - 1) {
            chunk.push(offers[i])
            chunks.push(chunk)
            continue
        } else {
            chunk.push(offers[i])
        }
    }
    chunks.forEach((chunk) => console.log(chunk.length))

    let feeds = []
    for (let k = 0; k < chunks.length; k++) {
        const feed = cloneDeep(feedObject)
        feed.yml_catalog.shop[0].offers[0].offer = chunks[k]
        feeds.push(feed)
    }
    return feeds
}
