// const wordnet = require('node-wordnet')
// const wndb = require('wordnet-db')
// TODO: INSTALL WORDNET NODE MODULES ABOVE

const getWords = () => {
    // var wn = new wordnet(wndb)
    // const value = 'cold'
    // wn.lookup(value, function(results) {
    //     results.forEach(function(result) {
    //         console.log('------------------------------------')
    //         console.log(result)
    //     })
    // })
    const words = `["cold", "chair"]`
    return words
}

module.exports = {
    getWords,
}
