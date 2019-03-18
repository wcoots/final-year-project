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
              <el-input placeholder="Please input" v-model="input">
                <el-button @click="submit(input)" slot="append" icon="el-icon-caret-right"></el-button>
              </el-input>

              <br>
              <br>Definition
              <br>
              <br>
              <el-button
                :disabled="next_disabled"
                @click="skipWord()"
                type="danger"
                plain
                style="float:left;"
              >Skip word</el-button>

              <br>
              <br>
            </el-col>
            <el-col :span="2">
              <h2></h2>
            </el-col>
            <el-col :span="8">
              <br>
              <br>
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
            <el-button disabled @click="quit()" style="float:right;">Quit</el-button>
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
            user: null,
            game: null,
            current_word_index: 0,
            next_disabled: false,
            input: '',
            answers: [],
            no_of_opponent_answers: 0,
            player_no: null,
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

        this.player_no = res.data.player_no

        res.data.status ? (this.game = res.data.game) : this.$router.push({ name: 'Home' })
    },
    async mounted() {},
    methods: {
        async submit(input) {
            input = _.toLower(input)
            const data = {
                game_id: this.game.id,
                current_word: this.game.words[this.current_word_index],
                answers: [],
                user_id: this.user.user_id,
                player_no: this.player_no,
            }
            const words = _.words(input)
            words.forEach(word => {
                const x = { answer: word }
                if (!_.filter(this.answers, x).length && word.length) {
                    this.answers.push(x)
                    data.answers.push(x)
                }
            })
            if (data.answers.length) {
                const res = await apiRequest('post', 'submitAnswer', data)
                if (res.data.status) {
                    this.$message({
                        dangerouslyUseHTMLString: true,
                        message: `You matched on the word "<strong>${res.data.word}</strong>"`,
                        type: 'success',
                    })
                    this.nextWord()
                }
            }
            this.input = ''
        },
        async skipWord() {
            const data = {
                game_id: this.game.id,
                current_word: this.game.words[this.current_word_index],
                user_id: this.user.user_id,
            }
            await apiRequest('post', 'skipWord', data)
            await this.$alert('Waiting for the other player to confirm', 'Word skipped', {
                confirmButtonText: 'OK',
                closeOnClickModal: false,
                showClose: false,
                type: 'info',
                beforeClose: action => {
                    setInterval(10000000000)
                    // LISTEN HERE FOR THE OTHER PLAYER SKIPPING
                },
            })
            this.nextWord()
        },
        nextWord() {
            this.input = ''
            this.answers = []
            if (this.game.words.length > this.current_word_index + 2) {
                this.current_word_index++
            } else if (this.game.words.length === this.current_word_index + 2) {
                this.current_word_index++
                this.next_disabled = true
            }
        },
        async quit() {
            const res = await apiRequest('post', 'quitGame', this.game)
            this.$router.push({ name: 'Home' })
        },
    },
}
</script>