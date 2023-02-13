const categoriesExcludeList = [
    '108118382',
    '108117197',
    '101985757',
    '99406043',
    '109015942',
    '63744367',
    '108482107'
]

module.exports = (offers) =>
    offers.filter(
        (offer) => !categoriesExcludeList.includes(offer.categoryId[0])
    )
