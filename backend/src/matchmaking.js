const db = require('./db')
const _ = require('lodash')
const moment = require('moment')

const search = async () => {
    return new Promise(async (resolve, reject) => {
        const queued_users = await db.qry(
            'SELECT id, user_id, game_mode, valid, initialisation_date FROM queued_users WHERE valid = 1'
        )
        if (!queued_users.length) {
            resolve()
        }
        const grouped_users = _.groupBy(queued_users, 'game_mode')
        console.log(grouped_users)
        Object.keys(grouped_users).forEach(async key => {
            grouped_users[key] = _.sortBy(grouped_users[key], 'initialisation_date')

            for (let i = 0; i < grouped_users[key].length - 1; i += 2) {
                await db.qry(
                    'UPDATE queued_users SET valid = 0, matched = 1, matched_date = ?, match_id = ?, match_user_id = ? WHERE id = ?',
                    [
                        moment().format('YYYY-MM-DD HH:mm:ss'),
                        grouped_users[key][i + 1].id,
                        grouped_users[key][i + 1].user_id,
                        grouped_users[key][i].id,
                    ]
                )
                await db.qry(
                    'UPDATE queued_users SET valid = 0, matched = 1, matched_date = ?, match_id = ?, match_user_id = ? WHERE id = ?',
                    [
                        moment().format('YYYY-MM-DD HH:mm:ss'),
                        grouped_users[key][i].id,
                        grouped_users[key][i].user_id,
                        grouped_users[key][i + 1].id,
                    ]
                )
            }
        })
        resolve()
    })
}

module.exports = {
    search,
}
