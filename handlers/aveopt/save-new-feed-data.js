const fs = require('fs')
const buildFeedSimpleObject = require('./build-feed-simple-object')

module.exports = (offers, feedObject, previousFeedDataFilePath) => {
    const feedSimpleObject = buildFeedSimpleObject(offers, feedObject)
    fs.writeFileSync(previousFeedDataFilePath, JSON.stringify(feedSimpleObject))
    console.log(`UPDATED ${previousFeedDataFilePath}`)
}
