<template>
    <div>
        <Header />
        <div>
            <div class="container">
                <div v-if="game">
                    <el-header height="100px">
                        <br />
                        <br />
                        <Timer
                            v-bind:date="game.termination_date"
                            v-bind:game_id="game.id"
                            v-bind:token="token"
                            style="float:centre;"
                            @start_game="startGame"
                            @delay_game="delayGame"
                        ></Timer>
                        <br />
                    </el-header>

                    <br />
                    <br />

                    <span v-if="!game_started && time_until_start">
                        <h1 style="text-align: center;">Game starts in</h1>
                        <h1 style="text-align: center;">
                            <b style="font-size: 150%;>">{{ time_until_start }}</b>
                        </h1>
                        <h1 style="text-align: center;">seconds</h1>
                    </span>

                    <span v-if="game_started">
                        <el-row :gutter="20">
                            <el-col :span="14">
                                <h1>{{ game.words[current_word_index] }}</h1>
                                <br />
                                <el-input
                                    v-model="input"
                                    placeholder="Please input"
                                    :disabled="submit_disabled"
                                >
                                    <el-button
                                        slot="append"
                                        icon="el-icon-caret-right"
                                        :disabled="submit_disabled"
                                        @click="submit"
                                    ></el-button>
                                </el-input>

                                <br />
                                <br />Definition
                                <br />
                                <br />
                                <el-button
                                    :disabled="skip_button_disabled"
                                    :loading="skip_button_loading"
                                    type="danger"
                                    plain
                                    style="float:left;"
                                    @click="skipWord()"
                                    >{{ skip_button_text }}</el-button
                                >

                                <br />
                                <br />
                            </el-col>
                            <el-col :span="2">
                                <h2></h2>
                            </el-col>
                            <el-col :span="8">
                                <br />
                                <br />
                                <el-tag type="warning">
                                    <b>{{ current_word_index + 1 }}/{{ game.words.length }}</b>
                                </el-tag>
                                <el-tag type="warning">
                                    The other player has submitted
                                    <b>{{ no_of_opponent_answers }}</b> answers
                                </el-tag>
                                <br />
                                <br />
                                <el-table :data="answers" width="180">
                                    <el-table-column
                                        prop="answer"
                                        label="Answers"
                                        width="180"
                                    ></el-table-column>
                                </el-table>
                            </el-col>
                        </el-row>
                        <el-footer>
                            <el-button style="float:right;" @click="quit()">Quit</el-button>
                        </el-footer>
                    </span>
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

import Timer from './Timer.vue'

export default {
    name: 'Game',
    components: {
        Header,
        Timer,
    },
    data() {
        return {
            game_started: false,
            time_until_start: 0,
            token: null,
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
        this.token = this.$route.query.token ? this.$route.query.token : null

        this.user = JSON.parse(localStorage.getItem('user'))

        const data = {
            user_id: JSON.parse(localStorage.getItem('user')).user_id,
            token: this.token,
        }
        const res = await apiRequest('post', 'getGameInfo', data)
        res.data.status ? (this.game = res.data.game) : this.$router.push({ name: 'Home' })
        this.player_no = res.data.player_no

        if (process.env.NODE_ENV === 'development') {
            this.socket = io.connect('localhost:8080', { query: `token=${this.token}` })
        } else if (process.env.NODE_ENV === 'production') {
            this.socket = io.connect('api.werdz.fun', { query: `token=${this.token}` })
        } else {
            this.$router.push({ name: 'Home' })
        }

        this.socket.on('answerSubmitted', async data => {
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
        this.socket.on('otherPlayerSkipped', () => {
            // WHEN THE OTHER PLAYER SKIPS THE WORD
            this.$alert('The other player skipped this word', 'Word skipped', {
                confirmButtonText: 'OK',
                closeOnClickModal: false,
                showClose: false,
                type: 'info',
                callback: () => {
                    this.socket.emit('confirmSkip', { game_token: this.game.token })
                    this.nextWord()
                },
            })
        })
        this.socket.on('otherPlayerConfirmedSkipped', () => {
            // WHEN THE OTHER PLAYER CONFIRMS THE SKIP
            this.skip_button_loading = false
            this.submit_disabled = false
            this.skip_button_text = 'Skip word'
            this.nextWord()
        })
        this.socket.on('otherPlayerQuit', () => {
            // WHEN THE OTHER PLAYER QUITS THE GAME
            this.$router.push({
                name: 'GameResults',
                query: { token: this.token },
            })
            this.$alert('Sorry, it looks like the other player quit the game :(', 'Game ended', {
                confirmButtonText: 'OK',
                closeOnClickModal: false,
                showClose: false,
                type: 'info',
            })
        })
    },
    methods: {
        startGame() {
            this.game_started = true
        },
        delayGame(time) {
            this.time_until_start = time - 150
        },
        submit(e) {
            const data = {
                game_id: this.game.id,
                current_word: this.game.words[this.current_word_index],
                answers: [],
                user_id: this.user.user_id,
                player_no: this.player_no,
                game_token: this.game.token,
                current_word_index: this.current_word_index,
                max_word_index: this.game.words.length - 1,
            }
            // DONE IN FRONTEND SO AS TO NOT ADD MUTLIPLE WORDS TO THE LIST
            const words = _.words(_.toLower(this.input))
            words.forEach(word => {
                const x = { answer: word }
                if (
                    !_.filter(this.answers, x).length &&
                    word.length &&
                    word !== _.toLower(this.game.words[this.current_word_index])
                ) {
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
        skipWord() {
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
