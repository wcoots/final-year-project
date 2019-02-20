<template>
  <div>
    <Header/>

    <div class="container">
      <ul class="nav nav-pills nav-fill mb-3" id="pills-tab" role="tablist">
        <li class="nav-item">
          <a
            class="nav-link active"
            id="pills-login-tab"
            data-toggle="pill"
            href="#pills-login"
            role="tab"
            aria-controls="pills-upload"
            aria-selected="true"
          >Log in</a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            id="pills-register-tab"
            data-toggle="pill"
            href="#pills-register"
            role="tab"
            aria-controls="pills-verify"
            aria-selected="false"
          >Register</a>
        </li>
      </ul>

      <div class="tab-content" id="pills-tabContent">
        <div
          class="tab-pane fade show active"
          id="pills-login"
          role="tabpanel"
          aria-labelledby="pills-login-tab"
        >
          <div class="row">
            <div class="col-md-12">
              <form @submit.prevent="login">
                <div class="form-group">
                  <label for>Email:</label>
                  <input
                    type="email"
                    required
                    class="form-control"
                    placeholder="e.g. bob@example.co.uk"
                    v-model="model.email"
                  >
                </div>

                <div class="form-group">
                  <label for>Password:</label>
                  <input
                    type="password"
                    required
                    class="form-control"
                    placeholder="Enter Password"
                    v-model="model.password"
                  >
                </div>

                <p
                  class="clickable"
                  style="color:#426cb9"
                  v-on:click="redirect('ForgottenPassword')"
                >Forgotten password</p>

                <div class="form-group">
                  <button class="btn btn-primary" :disabled="isLoginDisabled">Login</button>
                  {{ loading }}
                  {{ status }}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div
          class="tab-pane fade"
          id="pills-register"
          role="tabpanel"
          aria-labelledby="pills-register-tab"
        >
          <div class="row">
            <div class="col-md-12">
              <form @submit.prevent="register">
                <div class="form-group">
                  <label for>Forename:</label>
                  <input
                    type="text"
                    required
                    class="form-control"
                    placeholder="e.g. William"
                    v-model="model.forename"
                  >
                </div>

                <div class="form-group">
                  <label for>Surname:</label>
                  <input
                    type="text"
                    required
                    class="form-control"
                    placeholder="e.g. Cooter"
                    v-model="model.surname"
                  >
                </div>

                <div class="form-group">
                  <label for>Email:</label>
                  <input
                    type="email"
                    required
                    class="form-control"
                    placeholder="e.g. bob@example.co.uk"
                    v-model="model.new_email"
                  >
                </div>

                <div class="form-group">
                  <label for>Password:</label>
                  <div>
                    <input
                      type="password"
                      v-model="model.new_password"
                      required
                      class="form-control"
                      placeholder="Enter Password"
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
                    type="password"
                    required
                    class="form-control"
                    placeholder="Confirm Password"
                    v-model="model.confirm_password"
                  >
                </div>

                <div>
                  <input
                    type="checkbox"
                    id="checkbox"
                    v-model="terms_agreed"
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
                  <button class="btn btn-primary" :disabled="isRegisterDisabled">Register</button>
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
import axios from 'axios'
import Password from 'vue-password-strength-meter'

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
        if (localStorage.getItem('token') !== 'null') {
            this.$router.push({ name: 'Dashboard' })
        }
    },
    computed: {
        isLoginDisabled() {
            return !!this.loading.length || !this.model.email.length || !this.model.password.length
        },
        isRegisterDisabled() {
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
            if (this.password_score < 3) {
                return false
            }
            return true
        },
        register() {
            const formData = new FormData()
            let valid = this.validate()
            let strong = this.strongEnough()
            if (!valid) {
                alert('Passwords do not match')
            } else if (!strong) {
                alert('Password not strong enough')
            }
            if (valid && strong) {
                formData.append('forename', this.model.forename)
                formData.append('surname', this.model.surname)
                formData.append('email', this.model.new_email)
                formData.append('password', this.model.new_password)

                this.status = ''
                this.loading = 'Registering you, please wait'

                axios.post('http://localhost:3000/register', formData).then(res => {
                    this.loading = ''
                    if (res.data.status === true) {
                        localStorage.setItem('user', JSON.stringify(res.data.user))
                        this.$router.push({ name: 'Registered' })
                    } else {
                        this.model.new_password = null
                        this.model.confirm_password = ''
                        this.status = res.data.message
                    }
                })
            }
        },
        login() {
            const formData = new FormData()
            formData.append('email', this.model.email)
            formData.append('password', this.model.password)

            this.status = ''
            this.loading = 'Signing in'

            axios.post('http://localhost:3000/login', formData).then(res => {
                this.loading = ''
                if (res.data.status === true) {
                    localStorage.setItem('token', res.data.token)
                    localStorage.setItem('user', JSON.stringify(res.data.user))
                    this.$router.push({ name: 'Dashboard' })
                } else {
                    this.model.password = ''
                    this.status = res.data.message
                }
            })
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
