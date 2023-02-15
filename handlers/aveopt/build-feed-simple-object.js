module.exports = (offers, feedObject) => {
    let offersID = []
    offers.forEach((offer) => offersID.push(offer.$.id))
    return {
        date: feedObject.yml_catalog.$.date,
        offersID: offersID
    }
}
