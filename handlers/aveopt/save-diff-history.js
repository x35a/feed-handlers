const fs = require('fs')
const diffHistoryPath = './handlers/aveopt/diffHistory.json'

module.exports = (
    newFeedDate,
    lastFeedDate,
    newOffersIDList,
    missedOffersIDList,
    priceDiffDetails
) => {
    const diffHistoryList = JSON.parse(fs.readFileSync(diffHistoryPath))

    class Diff {
        constructor(
            newFeedDate,
            lastFeedDate,
            newOffersIDList,
            missedOffersIDList,
            priceDiffDetails
        ) {
            this.newFeedDate = newFeedDate
            this.lastFeedDate = lastFeedDate
            this.newOffers = [...newOffersIDList]
            this.missedOffers = [...missedOffersIDList]
            this.priceDiff = [...priceDiffDetails]
        }
    }

    const updateDiffFile = (
        diffHistoryPath,
        diffHistoryList,
        newOffersIDList,
        missedOffersIDList,
        priceDiffDetails
    ) => {
        diffHistoryList.unshift(
            new Diff(
                newFeedDate,
                lastFeedDate,
                newOffersIDList,
                missedOffersIDList,
                priceDiffDetails
            )
        )
        fs.writeFileSync(diffHistoryPath, JSON.stringify(diffHistoryList))
        console.log(
            `DIFF SAVED in ${diffHistoryPath}\nDELETE MISSED PRODUCTS IN TLD`
        )
    }

    if (!diffHistoryList.length)
        return updateDiffFile(
            diffHistoryPath,
            [],
            newOffersIDList,
            missedOffersIDList,
            priceDiffDetails
        )

    updateDiffFile(
        diffHistoryPath,
        diffHistoryList,
        newOffersIDList,
        missedOffersIDList,
        priceDiffDetails
    )
}
