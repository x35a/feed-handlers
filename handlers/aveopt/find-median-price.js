module.exports = (offers) => {
    const prices = offers.map((offer) => +offer.price)
    return median(prices)
}

function median(arr) {
    if (arr.length == 0) {
        return // 0.
    }
    arr.sort((a, b) => a - b) // 1.
    const midpoint = Math.floor(arr.length / 2) // 2.
    const median =
        arr.length % 2 === 1
            ? arr[midpoint] // 3.1. If odd length, just take midpoint
            : (arr[midpoint - 1] + arr[midpoint]) / 2 // 3.2. If even length, take median of midpoints
    return median
}
