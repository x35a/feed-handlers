module.exports = async (fileLink) => {
    let response = await fetch(fileLink)
    console.log('Start feed fetching...')

    if (response.ok) {
        let text = await response.text()
        return text
    } else {
        console.log('HTTP Error: ' + response.status)
        return ''
    }
}
