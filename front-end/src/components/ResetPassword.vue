<template>
  <div>
    <Header/>
    <div class="container">
      <div class="tab-pane fade show active">
        <div class="row">
          <div class="col-md-12">
            <h3>Reset Password</h3>

            <br>
            <hr>
            <br>

            <form @submit.prevent="onSubmitNewPassword">
              <div class="form-group">
                <label for>New password:</label>
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
                <label for>Confirm password:</label>
                <input
                  v-model="model.c_new_password"
                  type="password"
                  required
                  class="form-control"
                  placeholder="Enter Password"
                  :disabled="isInputDisabled"
                >
              </div>
              <div class="form-group">
                <button
                  class="btn btn-success btn-light btn-large"
                  :disabled="isSubmitDisabled"
                >Save</button>
                {{ loading }}
                {{ status }}
              </div>
            </form>
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
    name: 'ResetPassword',
    components: {
        Header,
        Password,
    },
    data() {
        return {
            model: {
                new_password: '',
                c_new_password: '',
            },
            loading: '',
            status: '',
            password_warning: '',
            password_score: 0,
            reset_token: this.$route.query.reset_token ? this.$route.query.reset_token : null,
        }
    },
    async created() {
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
                alert('Passwords do not match')
            } else if (!strong) {
                alert('Password not strong enough')
            }
            if (valid && strong) {
                const data = {
                    new_password: this.model.new_password,
                    reset_token: this.reset_token,
                }

                this.status = ''
                this.loading = 'Changing password'

                const res = await apiRequest('post', 'resetPassword', data)

                this.loading = ''
                this.model.new_password = ''
                this.model.c_new_password = ''

                if (res.data.status) {
                    alert('Your password has been changed.')
                    this.$router.push({ name: 'SignUp' })
                } else {
                    this.status = res.data.message
                }
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
</style>
