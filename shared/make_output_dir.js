const fs = require('fs')
module.exports = (output_folder) => {
    if (!fs.existsSync(`./${output_folder}`)) fs.mkdirSync(`./${output_folder}`)
    return
}