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
                                <h1>{{ game.words[current_word_index].word }}</h1>
                                <br />
                                <!-- WORD INPUT -->
                                <el-input
                                    v-model="input"
                                    :placeholder="input_placeholder"
                                    :disabled="submit_disabled"
                                    @keyup.enter.native="submit"
                                >
                                    <el-button
                                        slot="append"
                                        icon="el-icon-caret-right"
                                        :disabled="submit_disabled"
                                        @click="submit"
                                    ></el-button>
                                </el-input>

                                <br />
                                <br />
                                {{ game.words[current_word_index].definition }}
                                <br />
                                <br />
                                <!-- SKIP WORD BUTTON -->
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
                            </el-col>
                            <!-- JUST FOR SPACING -->
                            <el-col :span="2">
                                <h2></h2>
                            </el-col>

                            <el-col :span="8">
                                <el-card shadow="always">
                                    <!-- GAME MODE -->
                                    <div slot="header" class="clearfix">
                                        <span v-if="game.game_mode === 'SYN'">Syno</span>
                                        <span v-if="game.game_mode === 'ANT'">Anto</span>
                                        <span v-if="game.game_mode === 'HYP'">Hyper</span>nym
                                        <!-- Yes this is ridiculuous but who cares -->
                                        <b>{{ current_word_index + 1 }}</b> of
                                        <b>{{ game.words.length }}</b>
                                    </div>
                                    <!-- SYNONYM DESC -->
                                    <span v-if="game.game_mode === 'SYN'">
                                        <div>
                                            Words with the
                                            <b>same</b> meaning
                                        </div>
                                        <div>eg: fast → quick</div>
                                    </span>
                                    <!-- ANTONYM DESC -->
                                    <span v-if="game.game_mode === 'ANT'">
                                        <div>
                                            Words with the
                                            <b>opposite</b> meaning
                                        </div>
                                        <div>eg: fast → slow</div>
                                    </span>
                                    <!-- HYPERNYM DESC -->
                                    <span v-if="game.game_mode === 'HYP'">
                                        <div>
                                            Words with a
                                            <b>more general</b> meaning
                                        </div>
                                        <div>eg: chair → furniture</div>
                                    </span>
                                    <hr />
                                    <!-- OTHER PLAYER ANSWER COUNT -->
                                    <div>
                                        The other player has submitted
                                        <b v-if="no_of_opponent_answers" style="color:#67C23A;">{{
                                            no_of_opponent_answers
                                        }}</b>
                                        <b v-else style="color:#F56C6C;">{{
                                            no_of_opponent_answers
                                        }}</b>
                                        answers
                                    </div>
                                    <hr />
                                    <!-- RESULTS SO FAR -->
                                    <el-tag type="success">
                                        <i class="el-icon-success"></i>
                                        Matched:
                                        <b>{{ matched_count }}</b>
                                    </el-tag>
                                    <el-tag type="warning" style="margin:10px;">
                                        <i class="el-icon-error" style="color:#E6A23C;"></i>
                                        Passed:
                                        <b>{{ passed_count }}</b>
                                    </el-tag>
                                </el-card>
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
                            <br />
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
            input_placeholder: '',
            answers: [],
            no_of_opponent_answers: 0,
            player_no: null,
            word_skipped: false,
            passed_count: 0,
            matched_count: 0,
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

        if (this.game.game_mode === 'SYN') {
            this.input_placeholder = 'Please input a synonym...'
        } else if (this.game.game_mode === 'ANT') {
            this.input_placeholder = 'Please input an antonym...'
        } else if (this.game.game_mode === 'HYP') {
            this.input_placeholder = 'Please input a hypernym...'
        }

        if (process.env.NODE_ENV === 'development') {
            this.socket = io.connect('localhost:8080', { query: `token=${this.token}` })
        } else if (process.env.NODE_ENV === 'production') {
            this.socket = io.connect('api.werdz.fun', { query: `token=${this.token}` })
        } else {
            this.$router.push({ name: 'Home' })
        }

        this.socket.on('answerSubmitted', async res => {
            // WHEN EITHER PLAYER SUBMITS AN ANSWER
            if (res.status) {
                // IF THE ANSWER WAS A MATCH
                this.$message({
                    dangerouslyUseHTMLString: true,
                    message: `You matched on the word "<strong>${res.word}</strong>"`,
                    type: 'success',
                })
                if (this.current_word_index === this.game.words.length - 1) {
                    this.$router.push({
                        name: 'GameResults',
                        query: { token: this.token },
                    })
                } else {
                    this.matched_count++
                    this.nextWord()
                }
            } else {
                // IF THE ANSWER WAS NOT A MATCH
                this.no_of_opponent_answers =
                    res.this_player_id === this.user.user_id
                        ? res.other_player_word_count
                        : res.this_player_word_count
            }
        })
        this.socket.on('otherPlayerSkipped', async res => {
            // WHEN THE OTHER PLAYER SKIPS THE WORD
            if (res.status && res.user_id !== this.user.user_id) {
                const data = {
                    game_token: this.game.token,
                    user_id: this.user.user_id,
                }
                this.$alert('The other player skipped this word', 'Word skipped', {
                    confirmButtonText: 'OK',
                    closeOnClickModal: false,
                    showClose: false,
                    type: 'info',
                    callback: () => {
                        this.socket.emit('confirmSkip', data)
                        this.passed_count++
                        this.nextWord()
                    },
                })
            }
        })
        this.socket.on('otherPlayerConfirmedSkipped', async res => {
            // WHEN THE OTHER PLAYER CONFIRMS THE SKIP
            if (res.status && res.user_id !== this.user.user_id) {
                this.passed_count++
                this.skip_button_loading = false
                this.submit_disabled = false
                this.skip_button_text = 'Skip word'
                this.nextWord()
            }
        })
        this.socket.on('otherPlayerQuit', async res => {
            // WHEN THE OTHER PLAYER QUITS THE GAME
            if (res.status && res.user_id !== this.user.user_id) {
                this.$router.push({
                    name: 'GameResults',
                    query: { token: this.token },
                })
                this.$alert(
                    'Sorry, it looks like the other player quit the game :(',
                    'Game ended',
                    {
                        confirmButtonText: 'OK',
                        closeOnClickModal: false,
                        showClose: false,
                        type: 'info',
                    }
                )
            }
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
                current_word: this.game.words[this.current_word_index].word,
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
                const cond1 = !_.filter(this.answers, x).length
                const cond2 = word.length
                const cond3 = word !== _.toLower(this.game.words[this.current_word_index].word)
                const cond4 = !_.words(
                    _.toLower(this.game.words[this.current_word_index].definition)
                ).includes(_.toLower(word))
                if (cond1 && cond2 && cond3 && cond4) {
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
                current_word: this.game.words[this.current_word_index].word,
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
            this.no_of_opponent_answers = 0
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
                user_id: this.user.user_id,
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
