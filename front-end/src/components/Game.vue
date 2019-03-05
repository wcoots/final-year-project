<template>
  <div>
    <Header v-bind:user="user"/>
    <div>
      <div class="container">
        <br>
        <br>
        <h3>Lets play</h3>
        <br>
        <p>Hello player user_id: {{user.user_id}}</p>
        <p>You are playing with user_id: {{opponent.user_id}}</p>
        <el-button @click="quit()">Quit</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import Header from './Header'
import { apiRequest } from '../api/auth'

export default {
    name: 'Game',
    components: {
        Header,
    },
    data() {
        return {
            user: {
                user_id: '',
            },
            opponent: {
                user_id: '',
            },
            game: {},
        }
    },
    created() {
        if (localStorage.getItem('token') === 'null' || localStorage.getItem('token') === null) {
            localStorage.setItem('token', JSON.stringify(null))
            localStorage.setItem('user', JSON.stringify(null))
            this.$router.push({ name: 'SignUp' })
        }
    },
    async mounted() {
        this.user = JSON.parse(localStorage.getItem('user'))

        const data = {
            user_id: JSON.parse(localStorage.getItem('user')).user_id,
        }

        const res = await apiRequest('post', 'getOpponent', data)

        if (!res.data.status) {
            this.$router.push({ name: 'Home' })
        } else {
            if (this.user.user_id === res.data.game.p1_user_id) {
                this.opponent.user_id = res.data.game.p2_user_id
            } else if (this.user.user_id === res.data.game.p2_user_id) {
                this.opponent.user_id = res.data.game.p1_user_id
            } else {
                this.$router.push({ name: 'Home' })
            }
            this.game = res.data.game
        }
    },
    methods: {
        async quit() {
            const data = this.game
            const res = await apiRequest('post', 'quitGame', data)
            this.$router.push({ name: 'Home' })
        },
    },
}
</script>