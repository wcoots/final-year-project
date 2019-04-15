// const wordnet = require('node-wordnet')
// const wndb = require('wordnet-db')
// TODO: INSTALL WORDNET NODE MODULES ABOVE

const db = require('./db')
const _ = require('lodash')

const words_per_game = 5

const getWords = async game_mode => {
    return new Promise(async (resolve, reject) => {
        // var wn = new wordnet(wndb)
        // const value = 'cold'
        // wn.lookup(value, results => {
        //     results.forEach(result => {
        //         console.log('------------------------------------')
        //         console.log(result)
        //     })
        // })

        let table = null

        if (game_mode === 'SYN') {
            table = 'synonyms'
        } else if (game_mode === 'ANT') {
            table = 'antonyms'
        } else if (game_mode === 'HYP') {
            table = 'hypernyms'
        }

        const answers = await db.qry(
            `SELECT id, word, definition
        FROM ${table}
        WHERE multiplayer_availability = 1`
        )

        const chosen_words = []
        for (let i = 0; i < words_per_game; i++) {
            const random_word = answers[Math.floor(Math.random() * answers.length)]
            _.remove(answers, { id: random_word.id })
            delete random_word.id
            chosen_words.push(random_word)
        }

        resolve(JSON.stringify(chosen_words))
    })
}

module.exports = {
    getWords,
}
