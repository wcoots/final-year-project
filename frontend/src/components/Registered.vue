<template>
  <div>
    <p>Hello</p>
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
            user: this.$route.params.user ? this.$route.params.user : null,
        }
    },
    created() {
        console.log(localStorage.getItem('user.email'))
        console.log(user)
    },
    mounted() {},
}
</script>
