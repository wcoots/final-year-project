<template>
  <div>
    <Header v-bind:user="user"/>
    <div>
      <div class="container">
        <h3>Choose game mode</h3>
        <br>
        <el-button @click="initialise('SYN')">Synonyms</el-button>
        <el-button @click="initialise('ANT')">Antonyms</el-button>
        <el-button @click="initialise('HYP')">Hypernyms</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import Header from './Header'
import { apiRequest } from '../api/auth'

export default {
    name: 'Home',
    components: {
        Header,
    },
    data() {
        return {
            title: 'App',
            user: null,
        }
    },
    created() {
        if (localStorage.getItem('token') === 'null' || localStorage.getItem('token') === null) {
            localStorage.setItem('token', JSON.stringify(null))
            localStorage.setItem('user', JSON.stringify(null))
            this.$router.push({ name: 'SignUp' })
        }
    },
    mounted() {
        this.user = JSON.parse(localStorage.getItem('user'))
    },
    methods: {
        async initialise(game_mode) {
            const data = {
                user_id: JSON.parse(localStorage.getItem('user')).user_id,
                game_mode,
            }

            const res = await apiRequest('post', 'initialiseGame', data)

            console.log(res.data.message)
        },
    },
}
</script>