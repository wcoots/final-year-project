const db = require('./db')
const _ = require('lodash')
const moment = require('moment')
let reset_time = 2000

const search = async () => {
    const queued_users = await db.qry('SELECT * FROM queued_users WHERE valid = 1')
    if (!queued_users || !queued_users.length) {
        return false
    }
    const grouped_users = _.groupBy(queued_users, 'game_mode')
    let ids = []
    let values = []
    Object.keys(grouped_users).forEach(async key => {
        grouped_users[key] = _.sortBy(grouped_users[key], 'initialisation_date')

        for (let i = 0; i < grouped_users[key].length - 1; i += 2) {
            let temp1 = []
            let temp2 = []
            temp1 = [
                grouped_users[key][i].id, // id
                grouped_users[key][i].user_id, // user_id
                grouped_users[key][i].game_mode, // game_mode
                0, // valid
                grouped_users[key][i].initialisation_date, // initialisation_date
                1, // matched
                moment().format('YYYY-MM-DD HH:mm:ss'), // matched_date
                grouped_users[key][i + 1].id, // match_id
                grouped_users[key][i + 1].user_id, // match_user_id
            ]
            temp2 = [
                grouped_users[key][i + 1].id, // id
                grouped_users[key][i + 1].user_id, // user_id
                grouped_users[key][i + 1].game_mode, // game_mode
                0, // valid
                grouped_users[key][i + 1].initialisation_date, // initialisation_date
                1, // matched
                moment().format('YYYY-MM-DD HH:mm:ss'), // matched_date
                grouped_users[key][i].id, // match_id
                grouped_users[key][i].user_id, // match_user_id
            ]
            values.push(temp1)
            values.push(temp2)
            // grouped_users[key][i].valid = 0
            // grouped_users[key][i].matched = 1
            // grouped_users[key][i].matched_date = moment().format('YYYY-MM-DD HH:mm:ss')
            // grouped_users[key][i].match_id = grouped_users[key][i + 1].id
            // grouped_users[key][i].match_user_id = grouped_users[key][i + 1].user_id

            // grouped_users[key][i + 1].valid = 0
            // grouped_users[key][i + 1].matched = 1
            // grouped_users[key][i + 1].matched_date = moment().format('YYYY-MM-DD HH:mm:ss')
            // grouped_users[key][i + 1].match_id = grouped_users[key][i].id
            // grouped_users[key][i + 1].match_user_id = grouped_users[key][i].user_id

            ids.push(grouped_users[key][i].id)
            ids.push(grouped_users[key][i + 1].id)

            // await db.qry(
            //     'UPDATE queued_users SET valid = 0, matched = 1, matched_date = ?, match_id = ?, match_user_id = ? WHERE id = ?',
            //     [
            //         moment().format('YYYY-MM-DD HH:mm:ss'),
            //         grouped_users[key][i + 1].id,
            //         grouped_users[key][i + 1].user_id,
            //         grouped_users[key][i].id,
            //     ]
            // )
            // await db.qry(
            //     'UPDATE queued_users SET valid = 0, matched = 1, matched_date = ?, match_id = ?, match_user_id = ? WHERE id = ?',
            //     [
            //         moment().format('YYYY-MM-DD HH:mm:ss'),
            //         grouped_users[key][i].id,
            //         grouped_users[key][i].user_id,
            //         grouped_users[key][i + 1].id,
            //     ]
            // )
        }
    })
    let all_joined_values = ''
    values.forEach(entry => {
        const joined_values = `(${entry.join(',')})`
        console.log(joined_values)
    })
    // const joined_ids = `(${ids.join(',')})`
    // await db.qry(`DELETE FROM queued_users_copy WHERE id IN ${joined_ids}`)
    // await db.qry(`INSERT INTO queued_users
    //     (id, user_id, game_mode, valid, initialisation_date, matched, matched_date, match_id, match_user_id)
    //     VALUES ${values}`)
    return true
}

const timeout = async () => {
    const users_exist = await search()
    if (!users_exist && reset_time < 20000) {
        reset_time += 3000
    } else if (users_exist) {
        reset_time = 2000
    }
    await setTimeout(() => {
        // console.log(`${reset_time / 1000} seconds`)
        timeout()
    }, reset_time)
}

timeout()
