const db = require('./db')

const main = async () => {
    // users table
    await db.qry(`CREATE TABLE 'users' (
        'user_id' int(11) NOT NULL AUTO_INCREMENT,
        'email' varchar(200) DEFAULT '',
        'forename' varchar(30) DEFAULT NULL,
        'surname' varchar(30) DEFAULT NULL,
        'password' text,
        'account_creation_date' datetime DEFAULT NULL,
        'last_login_date' datetime DEFAULT NULL,
        'verified' tinyint(1) NOT NULL DEFAULT '0',
        'deleted' tinyint(1) NOT NULL DEFAULT '0',
        'deleted_date' datetime DEFAULT NULL,
        PRIMARY KEY ('user_id'),
        UNIQUE KEY 'email' ('email')
      ) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8;`)

    // sign_up_requests table
    await db.qry(`CREATE TABLE 'sign_up_requests' (
        'id' int(11) unsigned NOT NULL AUTO_INCREMENT,
        'user_id' int(11) NOT NULL,
        'token' varchar(50) DEFAULT NULL,
        'request_date' datetime DEFAULT NULL,
        'valid' tinyint(1) DEFAULT '1',
        'completed' tinyint(1) NOT NULL DEFAULT '0',
        'completed_date' datetime DEFAULT NULL,
        PRIMARY KEY ('id')
      ) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8;`)

    // email_change_requests table
    await db.qry(`CREATE TABLE 'email_change_requests' (
        'id' int(11) unsigned NOT NULL AUTO_INCREMENT,
        'user_id' int(11) NOT NULL,
        'requested_email' varchar(200) DEFAULT NULL,
        'token' varchar(50) DEFAULT NULL,
        'request_date' datetime DEFAULT NULL,
        'valid' tinyint(1) DEFAULT '1',
        'completed' tinyint(1) NOT NULL DEFAULT '0',
        'completed_date' datetime DEFAULT NULL,
        PRIMARY KEY ('id')
      ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;`)

    // password_reset_requests table
    await db.qry(`CREATE TABLE 'password_reset_requests' (
        'id' int(11) unsigned NOT NULL AUTO_INCREMENT,
        'user_id' int(11) NOT NULL,
        'token' varchar(50) DEFAULT NULL,
        'request_date' datetime DEFAULT NULL,
        'valid' tinyint(1) NOT NULL DEFAULT '1',
        'completed' tinyint(1) NOT NULL DEFAULT '0',
        'completed_date' datetime DEFAULT NULL,
        PRIMARY KEY ('id')
      ) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;`)

    // queued_users table
    await db.qry(`CREATE TABLE 'queued_users' (
        'id' int(11) unsigned NOT NULL AUTO_INCREMENT,
        'user_id' int(11) DEFAULT NULL,
        'game_mode' varchar(30) DEFAULT NULL,
        'valid' tinyint(1) DEFAULT '1',
        'initialisation_date' datetime DEFAULT NULL,
        'removed' tinyint(1) DEFAULT '0',
        'matched' tinyint(1) DEFAULT '0',
        'matched_date' datetime DEFAULT NULL,
        'match_id' int(11) DEFAULT NULL,
        'match_user_id' int(11) DEFAULT NULL,
        'last_heartbeat' datetime DEFAULT NULL,
        'game_token' varchar(50) DEFAULT NULL,
        PRIMARY KEY ('id')
      ) ENGINE=InnoDB AUTO_INCREMENT=233 DEFAULT CHARSET=utf8;`)

    // multiplayer_games table
    await db.qry(`CREATE TABLE 'multiplayer_games' (
        'id' int(11) unsigned NOT NULL AUTO_INCREMENT,
        'p1_user_id' int(11) DEFAULT NULL,
        'p2_user_id' int(11) DEFAULT NULL,
        'game_mode' varchar(11) DEFAULT NULL,
        'token' varchar(50) DEFAULT NULL,
        'initialisation_date' datetime DEFAULT NULL,
        'termination_date' datetime DEFAULT NULL,
        'words' text,
        'valid' tinyint(1) DEFAULT '1',
        'completed' tinyint(1) DEFAULT '0',
        'removed' tinyint(1) DEFAULT '0',
        'quitted' tinyint(1) DEFAULT '0',
        PRIMARY KEY ('id')
      ) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8;`)

    // multiplayer_answers table
    await db.qry(`CREATE TABLE 'multiplayer_answers' (
        'id' int(11) unsigned NOT NULL AUTO_INCREMENT,
        'game_id' int(11) DEFAULT NULL,
        'game_mode' varchar(11) DEFAULT NULL,
        'word' varchar(30) DEFAULT NULL,
        'p1_answers' varchar(1000) DEFAULT '[]',
        'p2_answers' varchar(1000) DEFAULT '[]',
        'matched' tinyint(1) DEFAULT '0',
        'matched_word' varchar(30) DEFAULT NULL,
        'passed' tinyint(1) DEFAULT '0',
        'uncompleted' tinyint(1) DEFAULT '0',
        'time' int(11) DEFAULT NULL,
        'processed' tinyint(1) DEFAULT '0',
        PRIMARY KEY ('id')
      ) ENGINE=InnoDB AUTO_INCREMENT=286 DEFAULT CHARSET=utf8;`)

    // singleplayer_games table
    await db.qry(`CREATE TABLE 'singleplayer_games' (
        'id' int(11) unsigned NOT NULL AUTO_INCREMENT,
        'user_id' int(11) DEFAULT NULL,
        'game_mode' varchar(11) DEFAULT NULL,
        'token' varchar(50) DEFAULT NULL,
        'initialisation_date' datetime DEFAULT NULL,
        'termination_date' datetime DEFAULT NULL,
        'words' text,
        'valid' tinyint(1) DEFAULT '1',
        'completed' tinyint(1) DEFAULT '0',
        'removed' tinyint(1) DEFAULT '0',
        'quitted' tinyint(1) DEFAULT '0',
        PRIMARY KEY ('id')
      ) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;`)

    // singleplayer_answers table
    await db.qry(`CREATE TABLE 'singleplayer_answers' (
        'id' int(11) unsigned NOT NULL AUTO_INCREMENT,
        'game_id' int(11) DEFAULT NULL,
        'game_mode' varchar(11) DEFAULT NULL,
        'word' varchar(30) DEFAULT NULL,
        'answers' varchar(1000) DEFAULT '[]',
        'matched' tinyint(1) DEFAULT '0',
        'matched_word' varchar(30) DEFAULT NULL,
        'passed' tinyint(1) DEFAULT '0',
        'uncompleted' tinyint(1) DEFAULT '0',
        'time' int(11) DEFAULT NULL,
        PRIMARY KEY ('id')
      ) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8;`)

    // synonyms table
    await db.qry(`CREATE TABLE 'synonyms' (
        'id' int(11) unsigned NOT NULL AUTO_INCREMENT,
        'word' varchar(30) DEFAULT NULL,
        'definition' mediumtext,
        'answers' mediumtext,
        'multiplayer_availability' tinyint(1) NOT NULL DEFAULT '0',
        'multiplayer_occurances' int(11) NOT NULL DEFAULT '0',
        'multiplayer_matches' int(11) NOT NULL DEFAULT '0',
        'multiplayer_passes' int(11) NOT NULL DEFAULT '0',
        'singleplayer_availability' tinyint(1) NOT NULL DEFAULT '0',
        'singleplayer_occurances' int(11) NOT NULL DEFAULT '0',
        'singleplayer_matches' int(11) NOT NULL DEFAULT '0',
        'singleplayer_passes' int(11) NOT NULL DEFAULT '0',
        PRIMARY KEY ('id')
      ) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;`)

    // antonyms table
    await db.qry(`CREATE TABLE 'antonyms' (
        'id' int(11) unsigned NOT NULL AUTO_INCREMENT,
        'word' varchar(30) DEFAULT NULL,
        'definition' mediumtext,
        'answers' mediumtext,
        'multiplayer_availability' tinyint(1) NOT NULL DEFAULT '0',
        'multiplayer_occurances' int(11) NOT NULL DEFAULT '0',
        'multiplayer_matches' int(11) NOT NULL DEFAULT '0',
        'multiplayer_passes' int(11) NOT NULL DEFAULT '0',
        'singleplayer_availability' tinyint(1) NOT NULL DEFAULT '0',
        'singleplayer_occurances' int(11) NOT NULL DEFAULT '0',
        'singleplayer_matches' int(11) NOT NULL DEFAULT '0',
        'singleplayer_passes' int(11) NOT NULL DEFAULT '0',
        PRIMARY KEY ('id')
      ) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;`)

    // hypernyms table
    await db.qry(`CREATE TABLE 'hypernyms' (
        'id' int(11) unsigned NOT NULL AUTO_INCREMENT,
        'word' varchar(30) DEFAULT NULL,
        'definition' mediumtext,
        'answers' mediumtext,
        'multiplayer_availability' tinyint(1) NOT NULL DEFAULT '0',
        'multiplayer_occurances' int(11) NOT NULL DEFAULT '0',
        'multiplayer_matches' int(11) NOT NULL DEFAULT '0',
        'multiplayer_passes' int(11) NOT NULL DEFAULT '0',
        'singleplayer_availability' tinyint(1) NOT NULL DEFAULT '0',
        'singleplayer_occurances' int(11) NOT NULL DEFAULT '0',
        'singleplayer_matches' int(11) NOT NULL DEFAULT '0',
        'singleplayer_passes' int(11) NOT NULL DEFAULT '0',
        PRIMARY KEY ('id')
      ) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;`)

    return
}

main()
