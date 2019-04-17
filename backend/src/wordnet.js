const db = require('./db')
const _ = require('lodash')

const words_per_game = 5

const getWordsForMultiplayer = async game_mode => {
    return new Promise(async (resolve, reject) => {
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

        if (answers.length < 5) {
            reject()
        }

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

const getWordsForSingleplayer = async game_mode => {
    return new Promise(async (resolve, reject) => {
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
            WHERE singleplayer_availability = 1`
        )

        const chosen_words = []

        const max_loop_val = answers.length > words_per_game ? words_per_game : answers.length

        if (answers.length) {
            for (let i = 0; i <= max_loop_val; i++) {
                const random_word = answers[Math.floor(Math.random() * answers.length)]
                _.remove(answers, { id: random_word.id })
                delete random_word.id
                chosen_words.push(random_word)
            }
        }

        resolve(JSON.stringify(chosen_words))
    })
}

module.exports = {
    getWordsForMultiplayer,
    getWordsForSingleplayer,
}
