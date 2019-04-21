<template>
    <div>
        <Header />
        <div class="container">
            <h3>Reset Password</h3>

            <br />
            <hr />
            <br />

            <el-form ref="model" :model="model" :rules="rules" label-width="200px">
                <!-- NEW PASSWORD -->
                <el-form-item label="New password:" prop="new_password">
                    <el-input
                        v-model="model.new_password"
                        type="password"
                        required
                        placeholder="Enter New Password"
                        :disabled="isInputDisabled"
                    ></el-input>
                </el-form-item>
                <!-- CONFRIM NEW PASSWORD -->
                <el-form-item label="Confirm password:" prop="c_new_password">
                    <el-input
                        v-model="model.c_new_password"
                        type="password"
                        required
                        placeholder="Confirm New Password"
                        :disabled="isInputDisabled"
                    ></el-input>
                </el-form-item>
                <!-- PASSWORD STRENGTH METER -->
                <el-form-item>
                    <password
                        v-model="model.new_password"
                        :strength-meter-only="true"
                        :toggle="true"
                        @score="showScore"
                    />
                </el-form-item>
                <!-- SUBMIT -->
                <el-form-item>
                    <el-button
                        :loading="this.loading"
                        :disabled="isSubmitDisabled"
                        @click="onSubmitNewPassword"
                        >{{ this.submit_button }}</el-button
                    >
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
import Header from './Header'
import Password from 'vue-password-strength-meter'
import { apiRequest } from '../api/auth'
import { mobileCheck } from '../assets/mobileCheck'

export default {
    name: 'ResetPassword',
    components: {
        Header,
        Password,
    },
    data() {
        const passwordStrength = (rule, value, callback) => {
            if (this.password_score < 2) {
                callback(new Error('Not strong enough'))
            } else {
                callback()
            }
        }
        const confirmPassword = (rule, value, callback) => {
            if (value !== this.model.new_password) {
                callback(new Error('Passwords must match'))
            } else {
                callback()
            }
        }
        return {
            model: {
                new_password: '',
                c_new_password: '',
            },
            rules: {
                new_password: { validator: passwordStrength, trigger: ['blur', 'change'] },
                c_new_password: { validator: confirmPassword, trigger: ['blur', 'change'] },
            },
            loading: false,
            status: '',
            submit_button: 'Save',
            password_warning: '',
            password_score: 0,
            reset_token: this.$route.query.reset_token ? this.$route.query.reset_token : null,
        }
    },
    async created() {
        mobileCheck() ? this.$router.push({ name: 'MobileRedirect' }) : console.log()
        localStorage.setItem('token', JSON.stringify(null))
        localStorage.setItem('user', JSON.stringify(null))
        if (this.reset_token === null) {
            this.$router.push({ name: 'SignUp' })
        }
        const data = {
            reset_token: this.reset_token,
        }
        const res = await apiRequest('post', 'verifyPasswordResetToken', data)
        if (res.data.status === false) {
            this.$router.push({ name: 'SignUp' })
        }
    },
    computed: {
        isSubmitDisabled() {
            return (
                !!this.loading.length ||
                !this.model.new_password.length ||
                !this.model.c_new_password.length
            )
        },
        isInputDisabled() {
            return !!this.loading.length
        },
    },
    methods: {
        validate() {
            if (this.model.new_password !== this.model.c_new_password) {
                return false
            }

            return true
        },
        showFeedback({ warning }) {
            this.password_warning = warning
        },
        showScore(score) {
            this.password_score = score
        },
        strongEnough() {
            if (this.password_score < 2) {
                return false
            }
            return true
        },
        async onSubmitNewPassword() {
            const valid = this.validate()
            const strong = this.strongEnough()
            if (!valid) {
                this.$message({
                    message: 'Passwords do not match',
                    type: 'warning',
                    showClose: true,
                })
            } else if (!strong) {
                this.$message({
                    message: 'Password not strong enough',
                    type: 'warning',
                    showClose: true,
                })
            }
            if (valid && strong) {
                const data = {
                    new_password: this.model.new_password,
                    reset_token: this.reset_token,
                }

                this.status = ''
                this.loading = true
                this.submit_button = 'Saving'

                const res = await apiRequest('post', 'resetPassword', data)

                this.loading = false
                this.submit_button = 'Save'
                this.model.new_password = ''
                this.model.c_new_password = ''

                if (res.data.status) {
                    this.$alert('Your password has been changed.', 'Werdz', {
                        confirmButtonText: 'OK',
                    })
                    this.$router.push({
                        name: 'SignUp',
                    })
                } else {
                    this.status = res.data.message
                }
            }
        },
    },
}
</script>
