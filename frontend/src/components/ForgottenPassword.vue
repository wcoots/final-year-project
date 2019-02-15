<template>
  <div>
    <Header/>
    <div class="container">
      <div class="tab-pane fade show active">
        <div class="row">
          <div class="col-md-12">
            <h3>Account Settings</h3>
            <h4>Update your email address:</h4>
            <form @submit.prevent="onSubmitEmail">
              <div class="form-group">
                <label for>Email address:</label>
                <input
                  type="email"
                  required
                  class="form-control"
                  placeholder="e.g. bob@example.co.uk"
                  v-model="model.email"
                >
              </div>
              <div class="form-group">
                <button class="btn btn-success btn-light btn-large" :disabled="isDisabled">Save</button>
                {{ loading }}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Header from './Header'

export default {
    name: 'ForgottenPassword',
    components: {
        Header,
    },
    data() {
        return {
            model: {
                email: '',
            },
            loading: '',
            status: '',
        }
    },
    computed: {
        isDisabled() {
            return !!this.loading.length || !this.model.email.length
        },
    },
    methods: {
        onSubmitEmail() {
            const formData = new FormData()
            formData.append('email', this.model.email)

            this.status = ''
            this.loading = 'Sending recovery email'

            axios.post('http://localhost:3128/forgottenPassword', formData).then(res => {
                this.loading = ''
                alert(`Password recovery email sent to ${this.model.email}`)
                this.model.email = ''
                this.$router.push({ name: 'SignUp' })
            })
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