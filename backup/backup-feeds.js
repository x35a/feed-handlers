const fs = require('fs')
const fetchFeed = require('../common/fetch-feed')

const tldYMLLink =
    'https://smartfood.org.ua/tstore/yml/96283d7854beada45245c1187fac3dd2.yml'

const tldCSVLink = 'https://smartfood.org.ua/feed-fb.csv'

const aveoptYMLLink =
    'https://aveon.net.ua/products_feed.xml?hash_tag=7b71fadcc4a12f03cf26a304da032fba&sales_notes=&product_ids=&label_ids=&exclude_fields=&html_description=0&yandex_cpa=&process_presence_sure=&languages=ru&group_ids='

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
