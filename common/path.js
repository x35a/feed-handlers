const inputFeedYML = 'input/tilda-feed.yml'
const inputFeedCSV = 'input/tilda-feed.csv'

module.exports = {
    flagma: {
        input: inputFeedYML,
        output: 'output/flagma-feed.yml'
    },
    obyava: {
        input: inputFeedYML,
        output: 'output/obyava-feed.xml'
    },
    prom: {
        input: inputFeedYML,
        output: 'output/prom-feed.yml'
    },
    synthetic: {
        input: inputFeedYML,
        output: 'output/synthetic-feed-edited.yml'
    },
    vseua: {
        input: inputFeedCSV,
        output: 'output/vseua-feed.csv'
    },
    merchant: {
        outputAd: 'output/merchant-ad.tsv',
        outputFree: 'output/merchant-free.tsv'
    }
}
