// Remove out of stock products
module.exports = (offers) =>
    offers.filter((offer) => offer['$'].available === 'true')
