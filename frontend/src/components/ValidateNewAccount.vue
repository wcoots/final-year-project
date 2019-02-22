<template>
  <div>
    <Header/>
    <br>
    <br>
    <br>
    <p>Your account has now been set up.</p>
    <br>
    <button class="btn btn-primary" v-on:click="redirect">Back to login</button>
  </div>
</template>

<script>
import axios from 'axios'
import Header from './Header'

export default {
    name: 'ResetPassword',
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
    created() {
        localStorage.setItem('token', JSON.stringify(null))
        localStorage.setItem('user', JSON.stringify(null))
        if (this.new_account_token === null) {
            this.$router.push({ name: 'SignUp' })
        }
        const formData = new FormData()
        formData.append('new_account_token', this.new_account_token)

        axios.post('http://localhost:8080/verifyNewAccount', formData).then(res => {
            if (res.data.status === false) {
                this.$router.push({ name: 'SignUp' })
            }
        })
    },
    methods: {
        redirect() {
            this.$router.push({ name: 'SignUp' })
        },
    },
}
</script>

<style scoped>
h1,
h2 {
    font-weight: normal;
}
ul {
    list-style-type: none;
    padding: 0;
}
li {
    display: inline-block;
    margin: 0 10px;
}
a {
    color: #426cb9;
}
</style>