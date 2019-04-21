<template>
    <div>
        <Header v-bind:user="user" />
        <div>
            <div class="container">
                <br />
                <br />
                <h2>Account Settings</h2>
                <br />
                <hr />
                <br />

                <!-- UPDATE EMAIL ADDRESS -->
                <h4>Update your email address</h4>
                <br />
                <el-form
                    ref="new_email_model"
                    :model="new_email_model"
                    :rules="rules"
                    label-width="200px"
                >
                    <!-- CURRENT PASSWORD -->
                    <el-form-item label="Current password:">
                        <el-input
                            v-model="new_email_model.email_current_password"
                            type="password"
                            required
                            placeholder="Enter Password"
                            :disabled="isEmailInputDisabled"
                        ></el-input>
                    </el-form-item>
                    <!-- NEW EMAIL -->
                    <el-form-item label="New email address:" prop="new_email">
                        <el-input
                            v-model="new_email_model.new_email"
                            required
                            placeholder="e.g. bob@example.co.uk"
                            :disabled="isEmailInputDisabled"
                        ></el-input>
                    </el-form-item>
                    <!-- SUBMIT -->
                    <el-form-item>
                        <el-button
                            :loading="this.email_loading"
                            :disabled="isEmailSubmitDisabled"
                            @click="onSubmitNewEmail"
                            >{{ this.change_email_button }}</el-button
                        >
                    </el-form-item>
                </el-form>
                <br />
                <hr />
                <br />

                <!-- CHANGE PASSWORD -->
                <h4>Change your password</h4>
                <br />
                <el-form
                    ref="new_password_model"
                    :model="new_password_model"
                    :rules="rules"
                    label-width="200px"
                >
                    <!-- CURRENT PASSWORD -->
                    <el-form-item label="Current password:">
                        <el-input
                            v-model="new_password_model.current_password"
                            type="password"
                            required
                            placeholder="Enter Current Password"
                            :disabled="isPasswordInputDisabled"
                        ></el-input>
                    </el-form-item>
                    <!-- NEW PASSWORD -->
                    <el-form-item label="New password:">
                        <el-input
                            v-model="new_password_model.new_password"
                            type="password"
                            required
                            placeholder="Enter New Password"
                            :disabled="isPasswordInputDisabled"
                        ></el-input>
                    </el-form-item>
                    <!-- CONFRIM NEW PASSWORD -->
                    <el-form-item label="Confirm password:" prop="c_new_password">
                        <el-input
                            v-model="new_password_model.c_new_password"
                            type="password"
                            required
                            placeholder="Confirm New Password"
                            :disabled="isPasswordInputDisabled"
                        ></el-input>
                    </el-form-item>
                    <!-- PASSWORD STRENTH METER -->
                    <el-form-item>
                        <password
                            v-model="new_password_model.new_password"
                            :strength-meter-only="true"
                            :toggle="true"
                            @score="showScore"
                        />
                    </el-form-item>
                    <!-- SUBMIT -->
                    <el-form-item>
                        <el-button
                            :loading="this.password_loading"
                            :disabled="isPasswordSubmitDisabled"
                            @click="onSubmitNewPassword"
                            >{{ this.change_password_button }}</el-button
                        >
                    </el-form-item>
                </el-form>
                <br />
                <br />
                <hr />
                <br />

                <!-- DELETE ACCOUNT -->
                <el-button
                    type="danger"
                    plain
                    style="float:right;"
                    v-on:click="redirect('DeleteAccount')"
                    >Delete Account</el-button
                >
                <br />
                <br />
                <br />
            </div>
        </div>
    </div>
</template>

<script>
import Header from './Header'
import Password from 'vue-password-strength-meter'
import { apiRequest } from '../api/auth'
import { mobileCheck } from '../assets/mobileCheck'

export default {
    name: 'AccountSettings',
    components: {
        Header,
        Password,
    },
    data() {
        const confirmPassword = (rule, value, callback) => {
            if (value !== this.new_password_model.new_password) {
                callback(new Error('Passwords must match'))
            } else {
                callback()
            }
        }
        return {
            user: null,
            new_email_model: {
                new_email: '',
                email_current_password: '',
            },
            new_password_model: {
                current_password: '',
                new_password: '',
                c_new_password: '',
            },
            email_loading: false,
            email_status: '',
            change_email_button: 'Save',
            password_loading: false,
            password_status: '',
            change_password_button: 'Save',
            password_score: 0,
            rules: {
                new_email: [
                    {
                        type: 'email',
                        message: 'Please input a valid email address',
                        trigger: ['blur', 'change'],
                    },
                ],
                c_new_password: [{ validator: confirmPassword, trigger: ['blur', 'change'] }],
            },
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
        isEmailSubmitDisabled() {
            return (
                !!this.email_loading ||
                !this.new_email_model.new_email.length ||
                !this.new_email_model.email_current_password.length
            )
        },
        isPasswordSubmitDisabled() {
            return (
                !!this.password_loading ||
                !this.new_password_model.current_password.length ||
                !this.new_password_model.new_password.length ||
                !this.new_password_model.c_new_password.length
            )
        },
        isEmailInputDisabled() {
            return !!this.email_loading
        },
        isPasswordInputDisabled() {
            return !!this.password_loading
        },
    },
    methods: {
        redirect(page) {
            this.$router.push({ name: page })
        },
        validatePassword() {
            if (this.new_password_model.new_password !== this.new_password_model.c_new_password) {
                return false
            }

            return true
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
        async onSubmitNewEmail() {
            this.$refs.new_email_model.validate(async valid => {
                if (!valid) {
                    this.$message({
                        message: 'Invalid email address',
                        type: 'warning',
                        showClose: true,
                    })
                } else {
                    const data = {
                        email: JSON.parse(localStorage.getItem('user')).email,
                        new_email: this.new_email_model.new_email,
                        password: this.new_email_model.email_current_password,
                    }

                    this.email_status = ''
                    this.email_loading = true
                    this.change_email_button = 'Saving'

                    const res = await apiRequest('post', 'changeEmail', data)
                    this.email_loading = false
                    this.change_email_button = 'Save'

                    if (res.data.status) {
                        this.email_status = res.data.message
                        this.$message({
                            message: this.email_status,
                            type: 'success',
                            showClose: true,
                        })
                        this.new_email_model.new_email = ''
                        this.new_email_model.email_current_password = ''
                    } else {
                        this.email_status = res.data.message
                        this.$message({
                            message: this.email_status,
                            type: 'warning',
                            showClose: true,
                        })
                    }
                }
            })
        },
        async onSubmitNewPassword() {
            const valid = this.validatePassword()
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
                    email: JSON.parse(localStorage.getItem('user')).email,
                    current_password: this.new_password_model.current_password,
                    new_password: this.new_password_model.new_password,
                }

                this.password_loading = true
                this.change_password_button = 'Saving'

                const res = await apiRequest('post', 'changePassword', data)

                this.password_loading = false
                this.change_password_button = 'Save'
                this.new_password_model.current_password = ''
                this.new_password_model.new_password = ''
                this.new_password_model.c_new_password = ''

                if (res.data.status) {
                    this.password_status = 'Password changed successfully'
                    this.$message({
                        message: this.password_status,
                        type: 'success',
                        showClose: true,
                    })
                } else {
                    this.password_status = res.data.message
                    this.$message({
                        message: this.password_status,
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
    text-align: right;
    font-family: 'Helvetica Neue';
}
</style>
