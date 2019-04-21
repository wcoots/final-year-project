<template>
    <div>
        <Header v-bind:user="user" />
        <div>
            <div class="container">
                <br />
                <br />
                <h2>Delete Account</h2>
                <br />
                <hr />
                <br />
                <!-- EMAIL -->
                <el-form ref="form" :model="model" label-width="100px">
                    <el-form-item label="Email:">
                        <el-input
                            v-model="model.email"
                            type="email"
                            required
                            placeholder="e.g. bob@example.co.uk"
                            :disabled="isInputDisabled"
                        ></el-input>
                    </el-form-item>
                    <!-- PASSWORD -->
                    <el-form-item label="Password:">
                        <el-input
                            v-model="model.password"
                            type="password"
                            required
                            placeholder="Enter Password"
                            :disabled="isInputDisabled"
                        ></el-input>
                    </el-form-item>
                    <!-- SUBMIT -->
                    <el-form-item>
                        <el-button
                            :loading="this.loading"
                            type="danger"
                            :disabled="isSubmitDisabled"
                            @click="deleteAccount"
                            >{{ this.submit_button }}</el-button
                        >
                        <el-button @click="redirect('AccountSettings')">Cancel</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
import Header from './Header'
import { apiRequest } from '../api/auth'
import { mobileCheck } from '../assets/mobileCheck'

export default {
    name: 'DeleteAccount',
    components: {
        Header,
    },
    data() {
        return {
            user: null,
            model: {
                email: '',
                password: '',
            },
            loading: false,
            submit_button: 'Delete Account',
            status: '',
        }
    },
    created() {
        mobileCheck() ? this.$router.push({ name: 'MobileRedirect' }) : console.log()
        if (localStorage.getItem('token') === 'null' || localStorage.getItem('token') === null) {
            localStorage.setItem('token', JSON.stringify(null))
            localStorage.setItem('user', JSON.stringify(null))
            this.$router.push({ name: 'SignUp' })
        }
    },
    mounted() {
        this.user = JSON.parse(localStorage.getItem('user'))
    },
    computed: {
        isSubmitDisabled() {
            return !!this.loading || !this.model.email.length || !this.model.password.length
        },
        isInputDisabled() {
            return !!this.loading
        },
    },
    methods: {
        redirect(action) {
            this.$router.push({ name: action })
        },
        async deleteAccount() {
            if (this.model.email !== JSON.parse(localStorage.getItem('user')).email) {
                this.model.email = ''
                this.model.password = ''
                this.status = 'Wrong email or password'
                this.$message({
                    message: this.status,
                    type: 'warning',
                    showClose: true,
                })
            } else {
                const data = {
                    email: this.model.email,
                    password: this.model.password,
                }

                this.status = ''
                this.loading = true
                this.submit_button = 'Deleting Account'

                const res = await apiRequest('post', 'deleteAccount', data)

                this.loading = false
                this.submit_button = 'Delete Account'

                if (res.data.status) {
                    localStorage.setItem('token', null)
                    localStorage.setItem('user', null)
                    this.$alert('Your account has been deleted. Goodbye!', 'Werdz', {
                        confirmButtonText: 'OK',
                    })
                    this.$router.push({
                        name: 'SignUp',
                    })
                } else {
                    this.model.email = ''
                    this.model.password = ''
                    this.status = res.data.message
                    this.$message({
                        message: this.status,
                        type: 'warning',
                        showClose: true,
                    })
                }
            }
        },
    },
}
</script>

<style>
p.status {
    text-align: left;
    font-family: 'Helvetica Neue';
}
</style>
