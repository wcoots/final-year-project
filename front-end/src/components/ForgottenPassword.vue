<template>
    <div>
        <Header />
        <div class="container">
            <br />
            <br />
            <h2>Forgotten Password</h2>
            <br />
            <hr />
            <br />

            <el-form>
                <!-- EMAIL -->
                <el-form-item label="Email:">
                    <el-input
                        v-model="model.email"
                        required
                        placeholder="e.g. bob@example.co.uk"
                        :disabled="isInputDisabled"
                    ></el-input>
                </el-form-item>
                <!-- SUBMIT -->
                <el-form-item>
                    <el-button
                        :loading="this.loading"
                        type="primary"
                        :disabled="isSubmitDisabled"
                        @click="onSubmitEmail"
                        >{{ this.submit_button }}</el-button
                    >
                    <el-button plain :disabled="isInputDisabled" @click="redirect('SignUp')"
                        >Cancel</el-button
                    >
                </el-form-item>
            </el-form>
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
            submit_button: 'Submit',
            loading: false,
            status: '',
        }
    },
    computed: {
        isSubmitDisabled() {
            return !!this.loading || !this.model.email.length
        },
        isInputDisabled() {
            return !!this.loading
        },
    },
    methods: {
        redirect(action) {
            this.$router.push({ name: action })
        },
        async onSubmitEmail() {
            const data = {
                email: this.model.email,
            }

            this.status = ''
            this.loading = true
            this.submit_button = 'Submitting'

            const res = await apiRequest('post', 'forgottenPassword', data)

            this.$alert(res.data.message, 'Werdz', {
                confirmButtonText: 'OK',
            })
            this.model.email = ''
            this.$router.push({ name: 'SignUp' })
        },
    },
}
</script>
