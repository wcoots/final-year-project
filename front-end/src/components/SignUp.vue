<template>
  <div>
    <Header/>
    <div class="container">
      <ul id="pills-tab" class="nav nav-pills nav-fill mb-3" role="tablist">
        <li class="nav-item">
          <a
            id="pills-login-tab"
            class="nav-link active"
            data-toggle="pill"
            href="#pills-login"
            role="tab"
            aria-controls="pills-upload"
            aria-selected="true"
          >Log in</a>
        </li>
        <li class="nav-item">
          <a
            id="pills-register-tab"
            class="nav-link"
            data-toggle="pill"
            href="#pills-register"
            role="tab"
            aria-controls="pills-verify"
            aria-selected="false"
          >Register</a>
        </li>
      </ul>

      <br>

      <!-- LOGIN -->
      <div id="pills-tabContent" class="tab-content">
        <div
          id="pills-login"
          class="tab-pane fade show active"
          role="tabpanel"
          aria-labelledby="pills-login-tab"
        >
          <el-form ref="login_model" :model="login_model" label-width="120px">
            <!-- EMAIL -->
            <el-form-item label="Email:">
              <el-input
                v-model="login_model.email"
                required
                placeholder="e.g. bob@example.co.uk"
                :disabled="isInputDisabled"
              ></el-input>
            </el-form-item>
            <!-- PASSWORD -->
            <el-form-item label="Password:">
              <el-input
                v-model="login_model.password"
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
                @click="login"
                type="primary"
                :disabled="isLoginSubmitDisabled"
              >{{this.login_button}}</el-button>
              <!-- PASSWORD RECOVERY LINK -->
              <el-button
                type="text"
                style="color:#426cb9; float:right;"
                v-on:click="redirect('ForgottenPassword')"
              >Forgotten password</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- REGISTER -->
        <div
          id="pills-register"
          class="tab-pane fade"
          role="tabpanel"
          aria-labelledby="pills-register-tab"
        >
          <el-form ref="register_model" :model="register_model" :rules="rules" label-width="200px">
            <!-- FORENAME -->
            <el-form-item label="Forename:" prop="forename">
              <el-input
                v-model="register_model.forename"
                required
                placeholder="e.g. Bob"
                :disabled="isInputDisabled"
              ></el-input>
            </el-form-item>
            <!-- SURNAME -->
            <el-form-item label="Surname:" prop="surname">
              <el-input
                v-model="register_model.surname"
                required
                placeholder="e.g. Bob"
                :disabled="isInputDisabled"
              ></el-input>
            </el-form-item>
            <!-- EMAIL -->
            <el-form-item label="Email:" prop="new_email">
              <el-input
                v-model="register_model.new_email"
                required
                placeholder="e.g. bob@example.co.uk"
                :disabled="isInputDisabled"
              ></el-input>
            </el-form-item>
            <!-- NEW PASSWORD -->
            <el-form-item label="New password:" prop="new_password">
              <el-input
                v-model="register_model.new_password"
                type="password"
                required
                placeholder="Enter New Password"
                :disabled="isInputDisabled"
              ></el-input>
            </el-form-item>
            <!-- CONFRIM NEW PASSWORD -->
            <el-form-item label="Confirm password:" prop="confirm_password">
              <el-input
                v-model="register_model.confirm_password"
                type="password"
                required
                placeholder="Confirm New Password"
                :disabled="isInputDisabled"
              ></el-input>
            </el-form-item>
            <!-- PASSWORD STRENGTH METER -->
            <el-form-item>
              <password
                v-model="register_model.new_password"
                :strength-meter-only="true"
                :toggle="true"
                @score="showScore"
              />
            </el-form-item>
            <!-- TERMS AND CONDITIONS -->
            <el-form-item>
              <el-checkbox v-model="register_model.terms_agreed"></el-checkbox>By checking this box you declare that you have read and agree to the
              <el-button
                type="text"
                style="color:#426cb9;"
                v-on:click="redirectInNewTab('TermsAndConditions')"
              >terms and conditions</el-button>
            </el-form-item>
            <!-- SUBMIT -->
            <el-form-item>
              <el-button
                :loading="this.loading"
                @click="register"
                type="primary"
                :disabled="isRegisterSubmitDisabled"
              >{{this.register_button}}</el-button>
              <el-button :disabled="isInputDisabled" @click="resetForm" plain>Reset</el-button>
            </el-form-item>
          </el-form>
          <br>
          <br>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from './Header'
import Password from 'vue-password-strength-meter'
import { apiRequest } from '../api/auth'

export default {
    name: 'SignUp',
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
            if (value !== this.register_model.new_password) {
                callback(new Error('Passwords must match'))
            } else {
                callback()
            }
        }
        const isAString = (rule, value, callback) => {
            const re = /^([a-z]+\s)*[a-z]+$/
            if (re.test(String(value).toLowerCase())) {
                callback()
            } else {
                callback(new Error('Names can only contain letters and spaces'))
            }
        }
        return {
            login_model: {
                email: '',
                password: '',
            },
            register_model: {
                forename: '',
                surname: '',
                new_email: '',
                new_password: '',
                confirm_password: '',
                terms_agreed: false,
            },
            loading: false,
            login_button: 'Login',
            register_button: 'Register',
            status: '',
            password_warning: '',
            password_score: 0,
            rules: {
                forename: [
                    {
                        required: true,
                        message: 'Please input your first name',
                        trigger: 'change',
                    },
                    { validator: isAString, trigger: ['blur', 'change'] },
                ],
                surname: [
                    {
                        required: true,
                        message: 'Please input your last name',
                        trigger: 'change',
                    },
                    { validator: isAString, trigger: ['blur', 'change'] },
                ],
                new_email: [
                    {
                        type: 'email',
                        message: 'Please input a valid email address',
                        trigger: ['blur', 'change'],
                    },
                    {
                        required: true,
                        message: 'Please input your email address',
                        trigger: 'blur',
                    },
                ],
                new_password: [
                    {
                        required: true,
                        message: 'Please input a password',
                        trigger: 'change',
                    },
                    { validator: passwordStrength, trigger: ['blur', 'change'] },
                ],
                confirm_password: [
                    {
                        required: true,
                        message: 'Please retype your password',
                        trigger: 'change',
                    },
                    { validator: confirmPassword, trigger: ['blur', 'change'] },
                ],
            },
        }
    },
    created() {
        if (localStorage.getItem('token') !== 'null' && localStorage.getItem('token') !== null) {
            this.$router.push({ name: 'Home' })
        }
    },
    computed: {
        isLoginSubmitDisabled() {
            return (
                !!this.loading ||
                !this.login_model.email.length ||
                !this.login_model.password.length
            )
        },
        isRegisterSubmitDisabled() {
            return (
                !!this.loading ||
                !this.register_model.terms_agreed ||
                !this.register_model.forename.length ||
                !this.register_model.surname.length ||
                !this.register_model.new_email.length ||
                !this.register_model.new_password.length ||
                !this.register_model.confirm_password.length
            )
        },
        isInputDisabled() {
            return !!this.loading
        },
    },
    methods: {
        redirect(location) {
            this.$router.push({ name: location })
        },
        redirectInNewTab(location) {
            let routeData = this.$router.resolve({ name: location })
            window.open(routeData.href, '_blank')
        },
        showFeedback({ warning }) {
            this.password_warning = warning
        },
        showScore(score) {
            this.password_score = score
        },
        validate() {
            if (this.register_model.new_password !== this.register_model.confirm_password) {
                return false
            }
            return true
        },
        strongEnough() {
            if (this.password_score < 2) {
                return false
            }
            return true
        },
        resetForm() {
            this.$refs['register_model'].resetFields()
            this.register_model.terms_agreed = false
        },
        async register() {
            this.$refs['register_model'].validate(async valid => {
                if (!valid) {
                    this.$message({
                        message: 'All fields with a (*) must be completed and valid',
                        type: 'warning',
                        showClose: true,
                    })
                } else {
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
                            forename: this.register_model.forename,
                            surname: this.register_model.surname,
                            email: this.register_model.new_email,
                            password: this.register_model.new_password,
                        }

                        this.status = ''
                        this.loading = true
                        this.register_button = 'Registering'

                        const res = await apiRequest('post', 'register', data)

                        this.loading = false
                        this.register_button = 'Register'

                        if (res.data.status) {
                            this.status = res.data.message
                            this.$alert(res.data.message, 'Werdz', {
                                confirmButtonText: 'OK',
                            })
                                .then(() => {
                                    this.$router.go(0)
                                })
                                .catch(() => {
                                    this.$router.go(0)
                                })
                        } else {
                            this.register_model.new_password = null
                            this.register_model.confirm_password = ''
                            this.status = res.data.message
                            this.$message({
                                message: this.status,
                                type: 'warning',
                                showClose: true,
                            })
                        }
                    }
                }
            })
        },
        async login() {
            const data = {
                email: this.login_model.email,
                password: this.login_model.password,
            }

            this.status = ''
            this.loading = true
            this.login_button = 'Logging in'

            const res = await apiRequest('post', 'login', data)

            this.loading = false
            this.login_button = 'Login'

            if (res.data.status) {
                localStorage.setItem('token', res.data.token)
                localStorage.setItem('user', JSON.stringify(res.data.user))
                this.$router.push({ name: 'Home' })
            } else {
                this.login_model.password = ''
                this.status = res.data.message
                this.$message({
                    message: this.status,
                    type: 'warning',
                    showClose: true,
                })
            }
        },
    },
}
</script>

