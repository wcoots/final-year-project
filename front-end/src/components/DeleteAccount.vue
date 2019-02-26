<template>
  <div>
    <Header v-bind:user="user"/>
    <div>
      <div class="container">
        <br>
        <br>
        <h2>Delete Account</h2>
        <br>
        <hr>
        <br>
        <!-- EMAIL -->
        <el-form ref="form" :model="model" label-width="100px">
          <el-form-item label="Email:">
            <el-input
              v-model="model.email"
              type="email"
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
          <el-form-item>
            <el-row>
              <el-col :span="12">
                <el-form-item>
                  <el-button
                    type="danger"
                    @click="deleteAccount"
                    :disabled="isSubmitDisabled"
                  >Delete Account</el-button>
                  <el-button @click="redirect('AccountSettings')">Cancel</el-button>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <p class="status">{{ loading }}</p>
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import Header from './Header'

import { apiRequest } from '../api/auth'

export default {
    name: 'DeleteAccount',
    components: {
        Header,
    },
    data() {
        return {
            user: null,
            model: {
                email: '',
                password: '',
            },
            loading: '',
            status: '',
        }
    },
    created() {
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
        isSubmitDisabled() {
            return !!this.loading.length || !this.model.email.length || !this.model.password.length
        },
        isInputDisabled() {
            return !!this.loading.length
        },
    },
    methods: {
        redirect(action) {
            this.$router.push({ name: action })
        },
        async deleteAccount() {
            if (this.model.email !== JSON.parse(localStorage.getItem('user')).email) {
                this.model.email = ''
                this.model.password = ''
                this.status = 'Wrong email or password'
                this.$message({
                    message: this.status,
                    type: 'warning',
                    showClose: true,
                })
            } else {
                const data = {
                    email: this.model.email,
                    password: this.model.password,
                }

                this.status = ''
                this.loading = 'Deleting account'

                const res = await apiRequest('post', 'deleteAccount', data)

                this.loading = ''

                if (res.data.status) {
                    localStorage.setItem('token', null)
                    localStorage.setItem('user', null)
                    this.$alert('Your account has been deleted. Goodbye!', 'Werdz', {
                        confirmButtonText: 'OK',
                    })
                    this.$router.push({
                        name: 'SignUp',
                    })
                } else {
                    this.model.email = ''
                    this.model.password = ''
                    this.status = res.data.message
                    this.$message({
                        message: this.status,
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
    text-align: left;
    font-family: 'Helvetica Neue';
}
</style>