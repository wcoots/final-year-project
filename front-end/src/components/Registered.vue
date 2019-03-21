<template>
    <div>
        <Header />
        <div class="container">
            <br />
            <br />
            <br />
            <p>
                An email has been sent to
                <b>{{ user.email }}</b>
            </p>
            <p>Please click the link in the email to activate your account</p>
            <br />
            <button class="btn btn-primary" v-on:click="redirect">Back to login</button>
        </div>
    </div>
</template>

<script>
import Header from './Header'

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
        if (localStorage.getItem('user') === 'null' || localStorage.getItem('token') === null) {
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
