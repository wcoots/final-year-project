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
          <el-form ref="model" :model="model" label-width="120px">
            <!-- EMAIL -->
            <el-form-item label="Email:">
              <el-input
                v-model="model.email"
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
            <el-row>
              <el-col :span="8">
                <el-form-item>
                  <el-button @click="login" type="primary" :disabled="isLoginSubmitDisabled">Login</el-button>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <p class="status">{{ loading }}</p>
              </el-col>
              <el-col :span="8"></el-col>
              <p
                class="clickable"
                style="color:#426cb9"
                v-on:click="redirect('ForgottenPassword')"
              >Forgotten password</p>
            </el-row>
          </el-form>
        </div>

        <!-- REGISTER -->
        <div
          id="pills-register"
          class="tab-pane fade"
          role="tabpanel"
          aria-labelledby="pills-register-tab"
        >
          <el-form ref="model" :model="model" :rules="rules" label-width="200px">
            <!-- FORENAME -->
            <el-form-item label="Forename:" prop="forename">
              <el-input
                v-model="model.forename"
                required
                placeholder="e.g. Bob"
                :disabled="isInputDisabled"
              ></el-input>
            </el-form-item>
            <!-- SURNAME -->
            <el-form-item label="Surname:" prop="surname">
              <el-input
                v-model="model.surname"
                required
                placeholder="e.g. Bob"
                :disabled="isInputDisabled"
              ></el-input>
            </el-form-item>
            <!-- EMAIL -->
            <el-form-item label="Email:" prop="new_email">
              <el-input
                v-model="model.new_email"
                required
                placeholder="e.g. bob@example.co.uk"
                :disabled="isInputDisabled"
              ></el-input>
            </el-form-item>
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
            <el-form-item label="Confirm password:" prop="confirm_password">
              <el-input
                v-model="model.confirm_password"
                type="password"
                required
                placeholder="Confirm New Password"
                :disabled="isInputDisabled"
              ></el-input>
            </el-form-item>
            <password
              v-model="model.new_password"
              :strength-meter-only="true"
              :toggle="true"
              @score="showScore"
            />
            <!-- TERMS AND CONDITIONS -->
            <el-form-item>
              <el-checkbox
                v-model="terms_agreed"
              >By checking this box you declare that you agree to the
                <div
                  id="d"
                  style="color:#426cb9"
                  class="clickable"
                  v-on:click="redirect('TermsAndConditions')"
                >terms and conditions</div>
              </el-checkbox>
            </el-form-item>
            <!-- SUBMIT -->
            <el-row>
              <el-col :span="8">
                <el-form-item>
                  <el-button
                    @click="register"
                    type="primary"
                    :disabled="isRegisterSubmitDisabled"
                  >Register</el-button>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <p class="status">{{ loading }}</p>
              </el-col>
              <el-col :span="8"></el-col>
            </el-row>
          </el-form>
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
        return {
            model: {
                email: '',
                password: '',

                forename: '',
                surname: '',
                new_email: '',
                new_password: null,
                confirm_password: '',
            },
            rules: {
                forename: [
                    {
                        required: true,
                        message: 'Please input your first name',
                        trigger: 'change',
                    },
                ],
                surname: [
                    {
                        required: true,
                        message: 'Please input your last name',
                        trigger: 'change',
                    },
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
                ],
                confirm_password: [
                    {
                        required: true,
                        message: 'Please retype your password',
                        trigger: 'change',
                    },
                ],
            },
            loading: '',
            status: '',
            password_warning: '',
            password_score: 0,
            terms_agreed: false,
        }
    },
    created() {
        if (localStorage.getItem('token') !== 'null' && localStorage.getItem('token') !== null) {
            this.$router.push({ name: 'Home' })
        }
    },
    computed: {
        isLoginSubmitDisabled() {
            return !!this.loading.length || !this.model.email.length || !this.model.password.length
        },
        isRegisterSubmitDisabled() {
            return (
                !!this.loading.length ||
                !this.terms_agreed ||
                !this.model.forename.length ||
                !this.model.surname.length ||
                !this.model.new_email.length ||
                !this.model.new_password.length ||
                !this.model.confirm_password.length
            )
        },
        isInputDisabled() {
            return !!this.loading.length
        },
    },
    methods: {
        redirect(location) {
            this.$router.push({ name: location })
        },
        showFeedback({ warning }) {
            this.password_warning = warning
        },
        showScore(score) {
            this.password_score = score
        },
        validate() {
            if (this.model.new_password !== this.model.confirm_password) {
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
        async register() {
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
                    forename: this.model.forename,
                    surname: this.model.surname,
                    email: this.model.new_email,
                    password: this.model.new_password,
                }

                this.status = ''
                this.loading = 'Registering you, please wait'

                const res = await apiRequest('post', 'register', data)

                this.loading = ''

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
                    this.model.new_password = null
                    this.model.confirm_password = ''
                    this.status = res.data.message
                    this.$message({
                        message: this.status,
                        type: 'warning',
                        showClose: true,
                    })
                }
            }
        },
        async login() {
            const data = {
                email: this.model.email,
                password: this.model.password,
            }

            this.status = ''
            this.loading = 'Signing in'

            const res = await apiRequest('post', 'login', data)

            this.loading = ''
            if (res.data.status) {
                localStorage.setItem('token', res.data.token)
                localStorage.setItem('user', JSON.stringify(res.data.user))
                this.$router.push({ name: 'Home' })
            } else {
                this.model.password = ''
                this.status = res.data.message
            }
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
#c,
#d {
    display: inline;
}
</style>
