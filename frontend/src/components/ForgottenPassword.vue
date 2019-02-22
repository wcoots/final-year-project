<template>
  <div>
    <Header/>
    <div class="container">
      <div class="tab-pane fade show active">
        <div class="row">
          <div class="col-md-12">
            <h3>Forgotten Password</h3>

            <br>
            <hr>
            <br>

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
import Header from './Header'
import { apiRequest } from '../api/auth'

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
        async onSubmitEmail() {
            const data = {
                email: this.model.email,
            }

            this.status = ''
            this.loading = 'Sending recovery email'

            const res = await apiRequest('post', 'forgottenPassword', data)

            this.loading = ''
            alert(`Password recovery email sent to ${this.model.email}`)
            this.model.email = ''
            this.$router.push({ name: 'SignUp' })
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