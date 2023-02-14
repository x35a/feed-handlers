module.exports = async (feedYMLlink) => {
    let response = await fetch(feedYMLlink)
    console.log('Start feed fetching...')

    if (response.ok) {
        let text = await response.text()
        return text
    } else {
        console.log('HTTP Error: ' + response.status)
        return ''
    }
}
