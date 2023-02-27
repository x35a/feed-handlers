const fs = require('fs')
const fetchFeed = require('../common/fetch-feed')
const { tldYMLLink, tldCSVLink, aveoptYMLLink } = require('../common/const')

;(async () => {
    const fetchNSave = async (link, path, msg) => {
        const file = await fetchFeed(link)
        fs.writeFileSync(path, file)
        console.log(msg)
    }

    await fetchNSave(tldYMLLink, './backup/tstore.xml', 'Tld YML Saved')
    await fetchNSave(tldCSVLink, './backup/feed-fb.csv', 'Tld CSV Saved')
    await fetchNSave(
        aveoptYMLLink,
        './backup/products_feed.xml',
        'Aveopt YML Saved'
    )
})()
