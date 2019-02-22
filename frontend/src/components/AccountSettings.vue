<template>
  <div>
    <div class="container">
      <div class="tab-pane fade show active">
        <div class="row">
          <div class="col-md-12">
            <h3>Account Settings</h3>

            <br>
            <hr>
            <br>

            <h4>Update your email address:</h4>
            <br>
            <form @submit.prevent="onSubmitNewEmail">
              <div class="form-group">
                <label for>Current password:</label>
                <input
                  type="password"
                  required
                  class="form-control"
                  placeholder="Enter Password"
                  v-model="model.email_current_password"
                >
              </div>
              <div class="form-group">
                <label for>New email address:</label>
                <input
                  type="email"
                  required
                  class="form-control"
                  placeholder="e.g. bob@example.co.uk"
                  v-model="model.new_email"
                >
              </div>
              <div class="form-group">
                <button class="btn btn-success btn-light btn-large" :disabled="isEmailDisabled">Save</button>
                {{ email_loading }}
                {{ email_status }}
              </div>
            </form>

            <br>
            <hr>
            <br>

            <h4>Change your password:</h4>
            <br>
            <form @submit.prevent="onSubmitNewPassword">
              <div class="form-group">
                <label for>Current password:</label>
                <input
                  type="password"
                  required
                  class="form-control"
                  placeholder="Enter Password"
                  v-model="model.current_password"
                >
              </div>
              <div class="form-group">
                <label for>New password:</label>
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
                <label for>Confirm password:</label>
                <input
                  type="password"
                  required
                  class="form-control"
                  placeholder="Enter Password"
                  v-model="model.c_new_password"
                >
              </div>
              <div class="form-group">
                <button
                  class="btn btn-success btn-light btn-large"
                  :disabled="isPasswordDisabled"
                >Save</button>
                {{ password_loading }}
                {{ password_status }}
              </div>
            </form>

            <br>
            <br>
            <hr>
            <br>

            <button
              type="button"
              class="btn btn-danger"
              v-on:click="setActive('goToDeleteAccount')"
            >Delete Account</button>

            <br>
            <br>
            <hr>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Password from 'vue-password-strength-meter'
import { apiRequest } from '../api/auth'

export default {
    name: 'AccountSettings',
    components: {
        Password,
    },
    data() {
        return {
            model: {
                new_email: '',
                email_current_password: '',
                current_password: '',
                new_password: '',
                c_new_password: '',
            },
            email_loading: '',
            email_status: '',
            password_loading: '',
            password_status: '',
            password_warning: '',
            password_score: 0,
        }
    },
    computed: {
        isEmailDisabled() {
            return (
                !!this.email_loading.length ||
                !this.model.new_email.length ||
                !this.model.email_current_password.length
            )
        },
        isPasswordDisabled() {
            return (
                !!this.password_loading.length ||
                !this.model.current_password.length ||
                !this.model.new_password.length ||
                !this.model.c_new_password.length
            )
        },
    },
    methods: {
        setActive(option) {
            this.$parent.isactive = option
        },
        validate() {
            if (this.model.new_password != this.model.c_new_password) {
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
            if (this.password_score < 3) {
                return false
            }
            return true
        },
        async onSubmitNewEmail() {
            const data = {
                email: JSON.parse(localStorage.getItem('user')).email,
                new_email: this.model.new_email,
                password: this.model.email_current_password,
            }

            this.email_status = ''
            this.email_loading = 'Changing email'

            const res = await apiRequest('post', 'changeEmail', data)

            this.email_loading = ''
            if (res.data.status) {
                this.email_status = res.data.message
                this.model.new_email = ''
                this.model.email_current_password = ''
            } else {
                this.model.email_current_password = ''
                this.email_status = res.data.message
            }
        },
        async onSubmitNewPassword() {
            let valid = this.validate()
            let strong = this.strongEnough()
            if (!valid) {
                alert('Passwords do not match')
            } else if (!strong) {
                alert('Password not strong enough')
            }
            if (valid && strong) {
                const data = {
                    email: JSON.parse(localStorage.getItem('user')).email,
                    current_password: this.model.current_password,
                    new_password: this.model.new_password,
                }

                this.password_status = ''
                this.password_loading = 'Changing password'

                const res = await apiRequest('post', 'changePassword', data)

                this.password_loading = ''
                this.model.current_password = ''
                this.model.new_password = ''
                this.model.c_new_password = ''

                if (res.data.status) {
                    this.password_status = 'Password changed successfully'
                } else {
                    this.password_status = res.data.message
                }
            }
        },
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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
.tab-pane {
    margin-top: 20px;
}
</style>