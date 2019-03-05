const db = require('./db')
const _ = require('lodash')
const moment = require('moment')
const crypto = require('crypto')

let reset_time = 3000

const checkMatches = async () => {
    // GET VALID USERS IN THE QUEUE
    const queued_users = await db.qry(
        `SELECT *
        FROM queued_users_copy
        WHERE valid = 1
        AND removed = 0
        AND matched = 0`
    )
    // IF NOT USERS THEN QUIT HERE
    if (!queued_users || !queued_users.length) {
        return false
    }
    // FIND QUEUED USERS WHOSE LAST HEARTBEAT WAS MORE THAN 5 SECONDS AGO
    let dead_heartbeat_ids = ''
    let alive_queued_users = []
    queued_users.forEach(async user => {
        // IF DEAD THEN ADD THEIR QUEUE ID TO THE DEAD_HEARTBEAT_IDS
        if (!user.last_heartbeat || moment().diff(user.last_heartbeat, 'seconds') > 5) {
            dead_heartbeat_ids += user.id + ','
        } else {
            // IF ALIVE THEN ADD THE USER TO THE ALIVE_QUEUED_USERS
            alive_queued_users.push(user)
        }
    })
    // SET DEAD QUEUED USERS TO REMOVED
    if (dead_heartbeat_ids.length) {
        dead_heartbeat_ids = `(${dead_heartbeat_ids.slice(0, -1)})` // eg: "(1,2,3,4,5)"
        await db.qry(
            `UPDATE queued_users_copy
            SET valid = 0,
            removed = 1
            WHERE id IN ${dead_heartbeat_ids}
            AND valid = 1
            AND removed = 0`
        )
    }
    // GROUP THE REMAINING ALIVE USERS BY THEIR CHOSEN GAME MODE
    const grouped_users = _.groupBy(alive_queued_users, 'game_mode')
    let ids = ''
    let queued_values = ''
    let game_values = ''
    // FOR EACH GAME MODE
    Object.keys(grouped_users).forEach(key => {
        // SORT USERS BY THE TIME THEY JOINED THE QUEUE SO THAT THOSE QUEUEING THE LONGEST GET MATCHED FIRST
        grouped_users[key] = _.sortBy(grouped_users[key], 'initialisation_date')
        // FOR EVERY SECOND USER (USER A)
        for (let i = 0; i < grouped_users[key].length - 1; i += 2) {
            //
            // (id, user_id, game_mode, valid, initialisation_date, matched, matched_date, match_id, match_user_id)
            // RECORD USER A'S DATA AS A STRING
            const temp1 = `(${grouped_users[key][i].id}, ${grouped_users[key][i].user_id}, '${
                grouped_users[key][i].game_mode
            }', 0, '${moment(grouped_users[key][i].initialisation_date).format(
                'YYYY-MM-DD HH:mm:ss'
            )}', 1, '${moment().format('YYYY-MM-DD HH:mm:ss')}', ${grouped_users[key][i + 1].id}, ${
                grouped_users[key][i + 1].user_id
            }),\n`
            //
            // (id, user_id, game_mode, valid, initialisation_date, matched, matched_date, match_id, match_user_id)
            // RECORD USER B'S DATA AS A STRING
            const temp2 = `(${grouped_users[key][i + 1].id}, ${
                grouped_users[key][i + 1].user_id
            }, '${grouped_users[key][i + 1].game_mode}', 0, '${moment(
                grouped_users[key][i + 1].initialisation_date
            ).format('YYYY-MM-DD HH:mm:ss')}', 1, '${moment().format('YYYY-MM-DD HH:mm:ss')}', ${
                grouped_users[key][i].id
            }, ${grouped_users[key][i].user_id}),\n`
            //
            // (p1_user_id, p2_user_id, game_mode, token)
            // RECORD THE GAME'S DATA AS A STRING
            const token_val = crypto.randomBytes(20)
            const token = token_val.toString('hex')
            const temp3 = `(${grouped_users[key][i].user_id}, ${
                grouped_users[key][i + 1].user_id
            }, '${grouped_users[key][i].game_mode}', '${token}'),\n`

            queued_values += temp1
            queued_values += temp2

            game_values += temp3

            ids += grouped_users[key][i].id + ','
            ids += grouped_users[key][i + 1].id + ','
        }
    })
    // IF MATCHES WERE MADE
    if (ids.length) {
        ids = `(${ids.slice(0, -1)})` // eg: "(1,2,3,4,5)"
        queued_values = queued_values.slice(0, -2) // eg: "(1,2,3),(4,5,6),(7,8,9)"
        game_values = game_values.slice(0, -2) // eg: "(1,2,3),(4,5,6),(7,8,9)"

        // TODO: change queued_users_copy to queued_users
        // DELETE THESE QUEUED USERS
        await db.qry(
            `DELETE
            FROM queued_users_copy
            WHERE id IN ${ids}`
        )
        // REINSERT THESE QUEUED USERS WITH THEIR MATCHES
        await db.qry(
            `INSERT INTO queued_users_copy
            (id, user_id, game_mode, valid, initialisation_date, matched, matched_date, match_id, match_user_id)
            VALUES ${queued_values}`
        )
        // INSERT THE GAME DETAILS
        await db.qry(
            `INSERT INTO games
            (p1_user_id, p2_user_id, game_mode, token)
            VALUES ${game_values}`
        )
    }

    return true
}
const checkForMatches = async () => {
    const users_exist = await checkMatches()
    if (!users_exist && reset_time < 21000) {
        reset_time += 3000
    } else if (users_exist) {
        reset_time = 2000
    }
    await setTimeout(() => {
        // console.log(`${reset_time / 1000} seconds`)
        checkForMatches()
    }, reset_time)
}

checkForMatches()
