<template>
  <div>
    <Header v-bind:user="user"/>
    <div>
      <div class="container" v-loading="loading">
        <br>
        <br>
        <h3>Choose game mode</h3>
        <br>
        <el-button type="primary" round disabled @click="redirect('SinglePlayer')">Single Player</el-button>
        <el-button type="success" round @click="redirect('MultiPlayer')">Multiplayer</el-button>
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
            user: null,
            loading: false,
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
        redirect(location) {
            this.$router.push({ name: location })
        },
    },
}
</script>