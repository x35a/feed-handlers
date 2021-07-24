module.exports = {
    input: {
        folder: 'input'
    },
    output: {
        folder: 'output'
    },
    flagma: {
        input: {
            file: 'tilda-feed.yml'
        },
        output: {
            file: 'flagma-feed.yml'
        }
    },
    obyava: {
        input: {
            file: 'tilda-feed.yml'
        },
        output: {
            file: 'obyava-feed.xml'
        }
    },
    prom: {
        input: {
            file: 'tilda-feed.yml'
        },
        output: {
            file: 'prom-feed.yml'
        }
    },
    synthetic: {
        input: {
            file: 'tilda-feed.yml'
        },
        output: {
            file: 'synthetic-feed-edited.yml'
        }
    },
    vseua: {
        input: {
            file: 'tilda-feed.csv'
        },
        output: {
            file: 'vseua-feed.csv'
        }
    }
}