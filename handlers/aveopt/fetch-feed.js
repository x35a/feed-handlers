module.exports = async (feedYMLlink) => {
    let response = await fetch(feedYMLlink)
    console.log('Start feed fetching...')

    if (response.ok) {
        let text = await response.text()
        console.log('Fetching completed')
        console.log(response)
        return text
    } else {
        console.log('HTTP Error: ' + response.status)
        return ''
    }
}
