const db = require('./db')
const _ = require('lodash')

const reset_time = 1000 * 60 * 60 // 1 hour

const checkWords = async () => {
    // get all unprocessed answers
    const answers = await db.qry(
        `SELECT id, game_mode, word, matched, matched_word, passed, uncompleted
        FROM multiplayer_answers
        WHERE processed = 0`
    )
    // group these answers by game mode
    const grouped_answers = _.groupBy(answers, 'game_mode')
    // declaration of game mode types
    const game_mode_types = [
        {
            game_mode: 'SYN',
            table: 'synonyms',
        },
        {
            game_mode: 'ANT',
            table: 'antonyms',
        },
        {
            game_mode: 'HYP',
            table: 'hypernyms',
        },
    ]
    // for each of these game modes
    game_mode_types.forEach(async game_mode_type => {
        // if there are unproccessed answers from this game mode
        if (grouped_answers[game_mode_type.game_mode]) {
            const words = {}
            // for each answer to a word
            grouped_answers[game_mode_type.game_mode].forEach(answer => {
                if (words[answer.word]) {
                    // if the word already exists in the words object then append to it
                    words[answer.word].matched_words.push(answer.matched_word)
                    words[answer.word].matched += answer.matched
                    words[answer.word].passed += answer.passed
                    words[answer.word].uncompleted += answer.uncompleted
                } else {
                    // if the word does not exist in the words object then add it
                    words[answer.word] = {
                        matched_words: [answer.matched_word],
                        matched: answer.matched,
                        passed: answer.passed,
                        uncompleted: answer.uncompleted,
                    }
                }
            })
            // create list of words
            let words_as_array = `(`
            Object.keys(words).forEach(word => {
                words_as_array += `'${word}', `
                // remove nulls from the list of answers to a word
                words[word].matched_words = _.compact(words[word].matched_words)
            })
            words_as_array = words_as_array.slice(0, -2) + `)`
            // get the previous answers to a word in it's game mode
            const previous_answers = await db.qry(
                `SELECT word, answers, multiplayer_occurances, multiplayer_matches, multiplayer_passes
                FROM ${game_mode_type.table}
                WHERE word IN ${words_as_array}`
            )
            // for each of these previous answers, add the answers to the words object
            previous_answers.forEach(answer => {
                words[answer.word].total_occurances =
                    answer.multiplayer_occurances +
                    words[answer.word].matched +
                    words[answer.word].passed +
                    words[answer.word].uncompleted
                words[answer.word].matched += answer.multiplayer_matches
                words[answer.word].passed += answer.multiplayer_passes
                words[answer.word].previous_answers = JSON.parse(answer.answers)
            })
            console.log(words)

            // for each word in the words object
            Object.keys(words).forEach(async word => {
                // for each match in the new answers
                words[word].matched_words.forEach(matched_word => {
                    if (words[word].previous_answers[matched_word]) {
                        // if the answer already exists then append to it
                        words[word].previous_answers[matched_word] += 1
                    } else {
                        // if the answer does not exist then create it
                        words[word].previous_answers[matched_word] = 1
                    }
                })
                // update the game mode's words
                await db.qry(
                    `UPDATE ${game_mode_type.table}
                    SET answers = '${JSON.stringify(words[word].previous_answers)}',
                    multiplayer_occurances = ${words[word].total_occurances},
                    multiplayer_matches = ${words[word].matched},
                    multiplayer_passes = ${words[word].passed}
                    WHERE word = '${word}'`
                )
            })
        }
    })

    // set the answers to completed in multiplayer_answers
    let answer_ids = `(`
    answers.forEach(answer => {
        answer_ids += `${answer.id}, `
    })
    answer_ids = answer_ids.slice(0, -2) + `)`
    await db.qry(
        `UPDATE multiplayer_answers
        SET processed = 1
        WHERE id IN ${answer_ids}`
    )
}

const x = async () => {
    await db.qry(
        `UPDATE synonyms
        SET answers = '{}',
        multiplayer_occurances = 0,
        multiplayer_matches = 0,
        multiplayer_passes = 0`
    )
    await db.qry(
        `UPDATE antonyms
        SET answers = '{}',
        multiplayer_occurances = 0,
        multiplayer_matches = 0,
        multiplayer_passes = 0`
    )
    await db.qry(
        `UPDATE hypernyms
        SET answers = '{}',
        multiplayer_occurances = 0,
        multiplayer_matches = 0,
        multiplayer_passes = 0`
    )
    await db.qry(
        `UPDATE multiplayer_answers
        SET processed = 0`
    )
}

const processResults = async () => {
    checkWords()
    await setTimeout(() => {
        processResults()
    }, reset_time)
}

x()
// processResults()
