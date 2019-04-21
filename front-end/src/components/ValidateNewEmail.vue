<template>
    <div>
        <Header />
        <div class="container">
            <br />
            <br />
            <br />
            <p>
                Your email address has now been changed to
                <b>{{ email }}</b
                >.
            </p>
            <br />
            <el-button type="primary" plain v-on:click="redirect">Back to login</el-button>
        </div>
    </div>
</template>

<script>
import Header from './Header'
import { apiRequest } from '../api/auth'
import { mobileCheck } from '../assets/mobileCheck'

export default {
    name: 'ValidateNewEmail',
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
        mobileCheck() ? this.$router.push({ name: 'MobileRedirect' }) : console.log()
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
