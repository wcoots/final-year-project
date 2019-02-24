<template>
  <div>
    <Header/>
    <br>
    <br>
    <br>
    <p>
      Your email address has now been changed to
      <b>{{email}}</b>.
    </p>
    <br>
    <button class="btn btn-primary" v-on:click="redirect">Back to login</button>
  </div>
</template>

<script>
import Header from './Header'
import { apiRequest } from '../api/auth'

export default {
    name: 'ResetPassword',
    components: {
        Header,
    },
    data() {
        return {
            new_email_token: this.$route.query.new_email_token
                ? this.$route.query.new_email_token
                : null,
            email: '',
        }
    },
    async created() {
        localStorage.setItem('token', JSON.stringify(null))
        localStorage.setItem('user', JSON.stringify(null))

        if (!this.new_email_token) {
            this.$router.push({ name: 'SignUp' })
        }

        const data = {
            new_email_token: this.new_email_token,
        }

        const res = await apiRequest('post', 'verifyNewEmail', data)

        if (res.data.status) {
            this.email = res.data.email
        } else {
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