<template>
  <div>
    <Header v-bind:user="user"/>
    <div>
      <div class="container">
        <div v-if="game">
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
              <br>
              <el-button :disabled="next_disabled" @click="nextWord()">Next</el-button>
              <el-button disabled @click="quit()">Quit</el-button>
              <br>
              <br>
            </el-col>
            <el-col :span="4">
              <h2></h2>
            </el-col>
            <el-col :span="6">
              <div v-if="answers.length">
                <el-table :data="answers" width="180">
                  <el-table-column prop="answer" label="Answers" width="180"></el-table-column>
                </el-table>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from './Header'
import { apiRequest } from '../api/auth'
import _ from 'lodash'

export default {
    name: 'Game',
    components: {
        Header,
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
    },
    async mounted() {},
    methods: {
        async submit(input) {
            const words = _.words(input)
            words.forEach(word => {
                const data = { answer: word }
                if (!_.filter(this.answers, data).length && word.length) {
                    this.answers.push(data)
                }
            })

            this.input = ''
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