<template>
  <div>
    <Header/>
    <br>
    <br>
    <br>
    <p>
      An email has been sent to
      <b>{{user.email}}</b>
    </p>
    <p>Please click the link in the email to activate your account</p>
    <br>
    <button class="btn btn-primary" v-on:click="redirect">Back to login</button>
  </div>
</template>

<script>
import Header from './Header'
import axios from 'axios'

export default {
    name: 'Registered',
    components: {
        Header,
    },
    data() {
        return {
            user: '',
        }
    },
    created() {
        if (localStorage.getItem('user') === 'null') {
            this.$router.push({ name: 'SignUp' })
        } else {
            this.user = JSON.parse(localStorage.getItem('user'))
        }
    },
    methods: {
        redirect() {
            localStorage.setItem('user', JSON.stringify(null))
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