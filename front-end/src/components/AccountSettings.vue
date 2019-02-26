<template>
  <div>
    <Header v-bind:user="user"/>
    <div>
      <div class="container">
        <br>
        <br>
        <h2>Account Settings</h2>
        <br>
        <hr>
        <br>

        <!-- UPDATE EMAIL ADDRESS -->
        <h4>Update your email address</h4>
        <br>
        <el-form ref="form" :model="model" label-width="200px">
          <!-- CURRENT PASSWORD -->
          <el-form-item label="Current password:">
            <el-input
              v-model="model.email_current_password"
              type="password"
              required
              placeholder="Enter Password"
              :disabled="isEmailInputDisabled"
            ></el-input>
          </el-form-item>
          <!-- NEW EMAIL -->
          <el-form-item label="New email address:">
            <el-input
              v-model="model.new_email"
              type="email"
              required
              placeholder="e.g. bob@example.co.uk"
              :disabled="isEmailInputDisabled"
            ></el-input>
          </el-form-item>
          <!-- SUBMIT -->
          <el-row>
            <el-col :span="8">
              <el-form-item>
                <el-button @click="onSubmitNewEmail" :disabled="isEmailSubmitDisabled">Save</el-button>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <p class="status">{{ email_loading }}</p>
            </el-col>
            <el-col :span="8"></el-col>
          </el-row>
        </el-form>
        <br>
        <hr>
        <br>

        <!-- CHANGE PASSWORD -->
        <h4>Change your password</h4>
        <br>
        <el-form ref="form" :model="model" label-width="200px">
          <!-- CURRENT PASSWORD -->
          <el-form-item label="Current password:">
            <el-input
              v-model="model.current_password"
              type="password"
              required
              placeholder="Enter Current Password"
              :disabled="isPasswordInputDisabled"
            ></el-input>
          </el-form-item>
          <!-- NEW PASSWORD -->
          <el-form-item label="New password:">
            <el-input
              v-model="model.new_password"
              type="password"
              required
              placeholder="Enter New Password"
              :disabled="isPasswordInputDisabled"
            ></el-input>
          </el-form-item>
          <!-- CONFRIM NEW PASSWORD -->
          <el-form-item label="Confirm password:">
            <el-input
              v-model="model.c_new_password"
              type="password"
              required
              placeholder="Confirm New Password"
              :disabled="isPasswordInputDisabled"
            ></el-input>
          </el-form-item>
          <password
            v-model="model.new_password"
            :strength-meter-only="true"
            :toggle="true"
            @score="showScore"
          />
          <!-- SUBMIT -->
          <el-row>
            <el-col :span="8">
              <el-form-item>
                <el-button @click="onSubmitNewPassword" :disabled="isPasswordSubmitDisabled">Save</el-button>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <p class="status">{{ password_loading }}</p>
            </el-col>
            <el-col :span="8"></el-col>
          </el-row>
        </el-form>
        <br>
        <br>
        <hr>
        <br>

        <!-- DELETE ACCOUNT -->
        <el-button
          type="danger"
          plain
          v-on:click="redirect('DeleteAccount')"
          style="float:right;"
        >Delete Account</el-button>
        <br>
        <br>
        <br>
      </div>
    </div>
  </div>
</template>


<script>
import Header from './Header'
import Password from 'vue-password-strength-meter'
import { apiRequest } from '../api/auth'

export default {
    name: 'AccountSettings',
    components: {
        Header,
        Password,
    },
    data() {
        return {
            user: null,
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
            password_score: 0,
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
        isEmailSubmitDisabled() {
            return (
                !!this.email_loading.length ||
                !this.model.new_email.length ||
                !this.model.email_current_password.length
            )
        },
        isPasswordSubmitDisabled() {
            return (
                !!this.password_loading.length ||
                !this.model.current_password.length ||
                !this.model.new_password.length ||
                !this.model.c_new_password.length
            )
        },
        isEmailInputDisabled() {
            return !!this.email_loading.length
        },
        isPasswordInputDisabled() {
            return !!this.password_loading.length
        },
    },
    methods: {
        redirect(page) {
            this.$router.push({ name: page })
        },
        validate() {
            if (this.model.new_password !== this.model.c_new_password) {
                return false
            }

            return true
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
                this.$message({
                    message: this.email_status,
                    type: 'success',
                    showClose: true,
                })
                this.model.new_email = ''
                this.model.email_current_password = ''
            } else {
                this.email_status = res.data.message
                this.$message({
                    message: this.email_status,
                    type: 'warning',
                    showClose: true,
                })
            }
        },
        async onSubmitNewPassword() {
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
                    const h = this.$createElement
                    this.password_status = 'Password changed successfully'
                    this.$message({
                        message: this.password_status,
                        type: 'success',
                        showClose: true,
                    })
                } else {
                    this.password_status = res.data.message
                    this.$message({
                        message: this.password_status,
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
    text-align: right;
    font-family: 'Helvetica Neue';
}
</style>