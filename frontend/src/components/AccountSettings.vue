<template>
  <div>
    <div class="container">
      <div class="tab-pane fade show active">
        <div class="row">
          <div class="col-md-12">
            <h3>Account Settings</h3>
            <h4>Update your email address:</h4>
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
                  v-model="model.email"
                >
              </div>
              <div class="form-group">
                <button class="btn btn-success btn-light btn-large" :disabled="isEmailDisabled">Save</button>
                {{ email_loading }}
                {{ email_status }}
              </div>
            </form>

            <h4>Change your password:</h4>
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
                <input
                  type="password"
                  required
                  class="form-control"
                  placeholder="Enter Password"
                  v-model="model.new_password"
                >
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

            <h4>Delete Account:</h4>
            <button
              type="button"
              class="btn btn-danger"
              v-on:click="setActive('goToDeleteAccount')"
            >Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
    name: 'AccountSettings',
    components: {},
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
        }
    },
    computed: {
        isEmailDisabled() {
            return !!this.email_loading.length
        },
        isPasswordDisabled() {
            return !!this.password_loading.length
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
        onSubmitNewEmail() {
            const formData = new FormData()
            formData.append('email', JSON.parse(localStorage.getItem('user')).email)
            formData.append('new_email', this.model.new_email)
            formData.append('current_password', this.model.email_current_password)

            this.email_status = ''
            this.email_loading = 'Changing email'

            axios.post('http://localhost:3128/changeEmail', formData).then(res => {
                this.email_loading = ''
                if (res.data.status === true) {
                    localStorage.setItem('user', JSON.stringify(res.data.user))
                    localStorage.setItem('token', res.data.token)
                    this.email_status = 'Email changed successfully'
                } else {
                    this.email_status = res.data.message
                }
            })
        },
        onSubmitNewPassword() {
            const formData = new FormData()
            let valid = this.validate()
            if (valid) {
                formData.append('email', JSON.parse(localStorage.getItem('user')).email)
                formData.append('current_password', this.model.current_password)
                formData.append('new_password', this.model.new_password)
                formData.append('c_new_password', this.model.c_new_password)

                this.password_status = ''
                this.password_loading = 'Changing password'

                axios.post('http://localhost:3128/changePassword', formData).then(res => {
                    this.password_loading = ''
                    if (res.data.status === true) {
                        this.password_status = 'Password changed successfully'
                    } else {
                        this.password_status = res.data.message
                    }
                })
            } else {
                alert('Passwords do not match')
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