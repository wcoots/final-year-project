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
    let words = null
    if (game_mode === 'SYN') {
        words = JSON.stringify([
            { word: 'Cold', def: `Low temperature` },
            { word: 'House', def: `A place to live in` },
            { word: 'Listen', def: `Open your ears to someone speaking` },
            { word: 'Eat', def: `Intake food` },
            { word: 'Finger', def: `A part of your hand` },
        ])
    } else if (game_mode === 'ANT') {
        words = JSON.stringify([
            { word: 'Hot', def: `High temperature` },
            { word: 'Tall', def: `Long in the verticle sense` },
            { word: 'Ugly', def: `Unpleasant to look at` },
            { word: 'Clean', def: `Tidy and prestigne` },
            { word: 'Slow', def: `Like a snail` },
        ])
    } else if (game_mode === 'HYP') {
        words = JSON.stringify([
            { word: 'Chair', def: `What you sit on` },
            { word: 'Phone', def: `What you call with` },
            { word: 'T-Shirt', def: `What you wear` },
            { word: 'Pen', def: `What your write with` },
            { word: 'Smile', def: `What happens to your face when you're happy` },
        ])
    }
    return words
}

module.exports = {
    getWords,
}
