// const wordnet = require('node-wordnet')
// const wndb = require('wordnet-db')
// TODO: INSTALL WORDNET NODE MODULES ABOVE

const getWords = game_mode => {
    // var wn = new wordnet(wndb)
    // const value = 'cold'
    // wn.lookup(value, results => {
    //     results.forEach(result => {
    //         console.log('------------------------------------')
    //         console.log(result)
    //     })
    // })
    let words = ''
    if (game_mode === 'SYN') {
        words = `["cold", "house", "listen", "eat", "finger"]`
    } else if (game_mode === 'ANT') {
        words = `["hot", "tall", "ugly", "clean", "slow"]`
    } else if (game_mode === 'HYP') {
        words = `["chair", "phone", "t-shirt", "pen", "smile"]`
    }
    return words
}

module.exports = {
    getWords,
}
