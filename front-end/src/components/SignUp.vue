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

      <div id="pills-tabContent" class="tab-content">
        <div
          id="pills-login"
          class="tab-pane fade show active"
          role="tabpanel"
          aria-labelledby="pills-login-tab"
        >
          <div class="row">
            <div class="col-md-12">
              <form @submit.prevent="login">
                <div class="form-group">
                  <label for>Email:</label>
                  <input
                    v-model="model.email"
                    type="email"
                    required
                    class="form-control"
                    placeholder="e.g. bob@example.co.uk"
                    :disabled="isInputDisabled"
                  >
                </div>

                <div class="form-group">
                  <label for>Password:</label>
                  <input
                    v-model="model.password"
                    type="password"
                    required
                    class="form-control"
                    placeholder="Enter Password"
                    :disabled="isInputDisabled"
                  >
                </div>

                <p
                  class="clickable"
                  style="color:#426cb9"
                  v-on:click="redirect('ForgottenPassword')"
                >Forgotten password</p>

                <div class="form-group">
                  <button class="btn btn-primary" :disabled="isLoginSubmitDisabled">Login</button>
                  {{ loading }}
                  {{ status }}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div
          id="pills-register"
          class="tab-pane fade"
          role="tabpanel"
          aria-labelledby="pills-register-tab"
        >
          <div class="row">
            <div class="col-md-12">
              <form @submit.prevent="register">
                <div class="form-group">
                  <label for>Forename:</label>
                  <input
                    v-model="model.forename"
                    type="text"
                    required
                    class="form-control"
                    placeholder="e.g. Bob"
                    :disabled="isInputDisabled"
                  >
                </div>

                <div class="form-group">
                  <label for>Surname:</label>
                  <input
                    v-model="model.surname"
                    type="text"
                    required
                    class="form-control"
                    placeholder="e.g. Jones"
                    :disabled="isInputDisabled"
                  >
                </div>

                <div class="form-group">
                  <label for>Email:</label>
                  <input
                    v-model="model.new_email"
                    type="email"
                    required
                    class="form-control"
                    placeholder="e.g. bob@example.co.uk"
                    :disabled="isInputDisabled"
                  >
                </div>

                <div class="form-group">
                  <label for>Password:</label>
                  <div>
                    <input
                      v-model="model.new_password"
                      type="password"
                      required
                      class="form-control"
                      placeholder="Enter Password"
                      :disabled="isInputDisabled"
                    >
                    <password
                      v-model="model.new_password"
                      :strength-meter-only="true"
                      :toggle="true"
                      @score="showScore"
                      @feedback="showFeedback"
                    />
                  </div>
                  <p style="color:red;">{{ password_warning }}</p>
                </div>

                <div class="form-group">
                  <label for>Confirm Password:</label>
                  <input
                    v-model="model.confirm_password"
                    type="password"
                    required
                    class="form-control"
                    placeholder="Confirm Password"
                    :disabled="isInputDisabled"
                  >
                </div>

                <div>
                  <input
                    id="checkbox"
                    v-model="terms_agreed"
                    type="checkbox"
                    value="true"
                    unchecked-value="false"
                  >
                  <label id="c" for>By checking this box you declare that you agree to the
                    <div
                      id="d"
                      style="color:#426cb9"
                      class="clickable"
                      v-on:click="redirect('TermsAndConditions')"
                    >terms and conditions</div>
                  </label>
                </div>
                <br>

                <div class="form-group">
                  <button class="btn btn-primary" :disabled="isRegisterSubmitDisabled">Register</button>
                  {{ loading }}
                  {{ status }}
                </div>
              </form>
            </div>
          </div>
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
            loading: '',
            status: '',
            password_warning: '',
            password_score: 0,
            terms_agreed: false,
        }
    },
    created() {
        if (localStorage.getItem('token') !== 'null' && localStorage.getItem('token') !== null) {
            this.$router.push({ name: 'Dashboard' })
        }
    },
    computed: {
        isLoginSubmitDisabled() {
            return !!this.loading.length || !this.model.email.length || !this.model.password.length
        },
        isRegisterSumbitDisabled() {
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
                alert('Passwords do not match')
            } else if (!strong) {
                alert('Password not strong enough')
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
                    localStorage.setItem('user', JSON.stringify(res.data.user))
                    this.$router.push({ name: 'Registered' })
                } else {
                    this.model.new_password = null
                    this.model.confirm_password = ''
                    this.status = res.data.message
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
                this.$router.push({ name: 'Dashboard' })
            } else {
                this.model.password = ''
                this.status = res.data.message
            }
        },
        redirect(location) {
            // localStorage.setItem('token', '')
            // localStorage.setItem('user', '')
            this.$router.push({ name: location })
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
