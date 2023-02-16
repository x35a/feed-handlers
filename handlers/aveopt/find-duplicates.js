const fs = require('fs')

const feed = JSON.parse(
    fs.readFileSync('./handlers/aveopt/previousFeedData.json')
)

let set = new Set()
let idDuplicates = []

feed.offersID.forEach((id) => {
    set.has(id) ? idDuplicates.push(id) : set.add(id)
})

console.log('duplicates', idDuplicates)
