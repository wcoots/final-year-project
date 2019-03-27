<template>
    <div>
        <Header v-bind:user="user" />
        <div>
            <div class="container">
                <br />
                <br />
                <h3>Fuck off</h3>
                <br />
                <br />
            </div>
        </div>
    </div>
</template>

<script>
import Header from './Header'

export default {
    name: 'OnePlayerMenu',
    components: {
        Header,
    },
    data() {
        return {
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
    methods: {},
}
</script>
