<template>
  <div>
    <Header/>
    <div class="container">
      <br>
      <br>
      <br>
      <p>Your account has now been set up.</p>
      <br>
      <el-button type="primary" plain v-on:click="redirect">Back to login</el-button>
    </div>
  </div>
</template>

<script>
import Header from './Header'
import { apiRequest } from '../api/auth'

export default {
    name: 'ValidateNewAccount',
    components: {
        Header,
    },
    data() {
        return {
            new_account_token: this.$route.query.new_account_token
                ? this.$route.query.new_account_token
                : null,
        }
    },
    async created() {
        localStorage.setItem('token', JSON.stringify(null))
        localStorage.setItem('user', JSON.stringify(null))
        if (!this.new_account_token) {
            this.$router.push({ name: 'SignUp' })
        }
        const data = {
            new_account_token: this.new_account_token,
        }
        const res = await apiRequest('post', 'verifyNewAccount', data)
        if (!res.data.status) {
            this.$router.push({ name: 'SignUp' })
        }
    },
    methods: {
        redirect() {
            this.$router.push({ name: 'SignUp' })
        },
    },
}
</script>
