<template>
    <div>
        <div class="container">
            <div class="tab-pane fade show active">
                <div class="row">
                    <div class="col-md-12">
                        <h3>Delete Account</h3>

                        <br />
                        <hr />
                        <br />

                        <form @submit.prevent="deleteAccount">
                            <div class="form-group">
                                <label for>Email:</label>
                                <input
                                    v-model="model.email"
                                    type="email"
                                    required
                                    class="form-control"
                                    placeholder="e.g. bob@example.co.uk"
                                />
                            </div>
                            <div class="form-group">
                                <label for>Password:</label>
                                <input
                                    v-model="model.password"
                                    type="password"
                                    required
                                    class="form-control"
                                    placeholder="Enter Password"
                                />
                            </div>
                            <div class="form-group">
                                <button
                                    class="btn btn-success btn-danger btn-large"
                                    :disabled="isDisabled"
                                    v-on:click="deleteAccount()"
                                >
                                    Delete Account
                                </button>
                                {{ loading }}
                                {{ status }}
                            </div>

                            <br />
                            <br />
                            <hr />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { apiRequest } from '../api/auth'

export default {
    name: 'DeleteAccount',
    components: {},
    data() {
        return {
            model: {
                email: '',
                password: '',
            },
            loading: '',
            status: '',
        }
    },
    computed: {
        isDisabled() {
            return !!this.loading.length || !this.model.email.length || !this.model.password.length
        },
    },
    methods: {
        async deleteAccount() {
            if (this.model.email !== JSON.parse(localStorage.getItem('user')).email) {
                this.model.email = ''
                this.model.password = ''
                this.status = 'Wrong email or password'
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

                    this.$router.push({
                        name: 'SignUp',
                    })
                } else {
                    this.model.email = ''
                    this.model.password = ''
                    this.status = res.data.message
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
