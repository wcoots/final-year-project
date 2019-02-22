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
import axios from 'axios'
import Header from './Header'

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
    created() {
        localStorage.setItem('token', JSON.stringify(null))
        localStorage.setItem('user', JSON.stringify(null))
        if (this.new_email_token === null) {
            this.$router.push({ name: 'SignUp' })
        }
        const formData = new FormData()
        formData.append('new_email_token', this.new_email_token)

        axios.post('http://localhost:8080/verifyNewEmail', formData).then(res => {
            if (res.data.status === false) {
                this.$router.push({ name: 'SignUp' })
            } else {
                this.email = res.data.email
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