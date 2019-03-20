<template>
  <div>
    <Header v-bind:user="user"/>
    <div>
      <div class="container">
        <div v-if="game">
          <el-header height="100px">
            <br>
            <br>
            <Countdown v-bind:date="game.termination_date" style="float:centre;"></Countdown>
            <br>
          </el-header>

          <br>
          <br>

          <el-row :gutter="20">
            <el-col :span="14">
              <h1>{{ game.words[current_word_index] }}</h1>
              <br>
              <el-input placeholder="Please input" v-model="input" :disabled="submit_disabled">
                <el-button
                  @click="submit"
                  slot="append"
                  icon="el-icon-caret-right"
                  :disabled="submit_disabled"
                ></el-button>
              </el-input>

              <br>
              <br>Definition
              <br>
              <br>
              <el-button
                :disabled="skip_button_disabled"
                :loading="skip_button_loading"
                @click="skipWord()"
                type="danger"
                plain
                style="float:left;"
              >{{ skip_button_text }}</el-button>

              <br>
              <br>
            </el-col>
            <el-col :span="2">
              <h2></h2>
            </el-col>
            <el-col :span="8">
              <br>
              <br>
              <el-tag type="warning">
                <span
                  v-if="current_word_index !== game.words.length - 1"
                >{{ game.words.length - 1 - current_word_index }} words remaining</span>
                <span v-if="current_word_index === game.words.length - 1">final word</span>
              </el-tag>
              <el-tag
                type="warning"
              >The other player has submitted {{ no_of_opponent_answers }} answers</el-tag>
              <br>
              <br>
              <el-table :data="answers" width="180">
                <el-table-column prop="answer" label="Answers" width="180"></el-table-column>
              </el-table>
            </el-col>
          </el-row>
          <el-footer>
            <el-button @click="quit()" style="float:right;">Quit</el-button>
          </el-footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from './Header'
import { apiRequest } from '../api/auth'
import _ from 'lodash'
import io from 'socket.io-client'

import Countdown from './Countdown.vue'

export default {
    name: 'Game',
    components: {
        Header,
        Countdown,
    },
    data() {
        return {
            token: this.$route.query.token ? this.$route.query.token : null,
            socket: null,
            user: null,
            game: null,
            current_word_index: 0,
            submit_disabled: false,
            skip_button_disabled: false,
            skip_button_loading: false,
            skip_button_text: 'Skip word',
            input: '',
            answers: [],
            no_of_opponent_answers: 0,
            player_no: null,
            word_skipped: false,
        }
    },
    async created() {
        if (localStorage.getItem('token') === 'null' || localStorage.getItem('token') === null) {
            localStorage.setItem('token', JSON.stringify(null))
            localStorage.setItem('user', JSON.stringify(null))
            this.$router.push({ name: 'SignUp' })
        }
        // TODO: remove this
        if (this.token !== 'test_token') {
            this.$router.push({ name: 'Home' })
        }

        this.user = JSON.parse(localStorage.getItem('user'))

        const data = {
            user_id: JSON.parse(localStorage.getItem('user')).user_id,
            token: this.token,
        }
        const res = await apiRequest('post', 'getGameInfo', data)
        res.data.status ? (this.game = res.data.game) : this.$router.push({ name: 'Home' })
        this.player_no = res.data.player_no

        if (process.env.NODE_ENV === 'development') {
            this.socket = io.connect('localhost:8080', { query: `token=${this.game.token}` })
        } else if (process.env.NODE_ENV === 'production') {
            this.socket = io.connect('api.werdz.fun', { query: `token=${this.game.token}` })
        } else {
            this.$router.push({ name: 'Home' })
        }

        this.socket.on('answerSubmitted', data => {
            // WHEN EITHER PLAYER SUBMITS AN ANSWER
            if (data.status) {
                // IF THE ANSWER WAS A MATCH
                this.$message({
                    dangerouslyUseHTMLString: true,
                    message: `You matched on the word "<strong>${data.word}</strong>"`,
                    type: 'success',
                })
                if (this.current_word_index === this.game.words.length - 1) {
                    this.$router.push({
                        name: 'GameResults',
                        query: { token: this.token },
                    })
                } else {
                    this.nextWord()
                }
            } else {
                // IF THE ANSWER WAS NOT A MATCH
                this.no_of_opponent_answers =
                    data.this_player_id === this.user.user_id
                        ? data.other_player_word_count
                        : data.this_player_word_count
            }
        })
        this.socket.on('otherPlayerSkipped', data => {
            // WHEN THE OTHER PLAYER SKIPS THE WORD
            this.$alert('The other player skipped this word', 'Word skipped', {
                confirmButtonText: 'OK',
                closeOnClickModal: false,
                showClose: false,
                type: 'info',
                callback: action => {
                    this.socket.emit('confirmSkip', { game_token: this.game.token })
                    this.nextWord()
                },
            })
        })
        this.socket.on('otherPlayerConfirmedSkipped', data => {
            // WHEN THE OTHER PLAYER CONFIRMS THE SKIP
            this.skip_button_loading = false
            this.submit_disabled = false
            this.skip_button_text = 'Skip word'
            this.nextWord()
        })
        this.socket.on('otherPlayerQuit', data => {
            // WHEN THE OTHER PLAYER QUITS THE GAME
            this.$alert('Sorry, it looks like the other player quit the game :(', 'Game ended', {
                confirmButtonText: 'OK',
                closeOnClickModal: false,
                showClose: false,
                type: 'info',
                callback: action => {
                    this.$router.push({
                        name: 'GameResults',
                        query: { token: this.token },
                    })
                },
            })
        })
    },
    methods: {
        submit(e) {
            const data = {
                game_id: this.game.id,
                current_word: this.game.words[this.current_word_index],
                answers: [],
                user_id: this.user.user_id,
                player_no: this.player_no,
                game_token: this.game.token,
            }
            // DONE IN FRONTEND SO AS TO NOT ADD MUTLIPLE WORDS TO THE LIST
            const words = _.words(_.toLower(this.input))
            words.forEach(word => {
                const x = { answer: word }
                if (!_.filter(this.answers, x).length && word.length) {
                    this.answers.push(x)
                    data.answers.push(x)
                }
            })
            if (data.answers.length) {
                e.preventDefault()
                this.socket.emit('submitAnswer', data)
            }
            this.input = ''
        },
        skipWord(e) {
            const data = {
                game_id: this.game.id,
                current_word: this.game.words[this.current_word_index],
                user_id: this.user.user_id,
                game_token: this.game.token,
            }
            this.socket.emit('skipWord', data)
            this.skip_button_loading = true
            this.submit_disabled = true
            this.skip_button_text = 'Waiting for other player to skip'
        },
        nextWord() {
            this.input = ''
            this.answers = []
            if (this.game.words.length > this.current_word_index + 2) {
                this.current_word_index++
            } else if (this.game.words.length === this.current_word_index + 2) {
                this.current_word_index++
                this.skip_button_disabled = true
            }
        },
        quit() {
            const data = {
                game_id: this.game.id,
                game_token: this.game.token,
                player_no: this.player_no,
            }
            this.socket.emit('quitGame', data)
            this.$router.push({
                name: 'GameResults',
                query: { token: this.token },
            })
        },
    },
}
</script>