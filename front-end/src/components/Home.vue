<template>
    <div>
        <Header v-bind:user="user" />

        <div>
            <div v-loading="loading" class="container">
                <br />
                <br />
                <h3>
                    Hello
                    <span v-if="user">{{ user.forename }}</span
                    >!
                </h3>
                <br />
                <h4>Choose game mode</h4>
                <br />

                <el-row :gutter="12">
                    <!-- SINGLE PLAYER -->
                    <el-col :span="8">
                        <el-card shadow="hover">
                            <div slot="header" class="clearfix">
                                <el-button
                                    type="primary"
                                    round
                                    disabled
                                    @click="redirect('OnePlayerMenu')"
                                    >One Player</el-button
                                >
                            </div>
                            <div>Play by yourself</div>
                        </el-card>
                    </el-col>
                    <!-- MULTIPLAYER -->
                    <el-col :span="8">
                        <el-card shadow="hover">
                            <div slot="header" class="clearfix">
                                <el-button type="success" round @click="redirect('TwoPlayerMenu')"
                                    >Two Player</el-button
                                >
                            </div>
                            <div>Match and play with another player</div>
                        </el-card>
                    </el-col>
                    <!-- HYPERNYMS -->
                    <el-col :span="8">
                        <p></p>
                    </el-col>
                </el-row>

                <br />
            </div>
        </div>
    </div>
</template>

<script>
import Header from './Header'
import { mobileCheck } from '../assets/mobileCheck'

export default {
    name: 'Home',
    components: {
        Header,
    },
    data() {
        return {
            user: null,
            loading: false,
        }
    },
    created() {
        mobileCheck() ? this.$router.push({ name: 'MobileRedirect' }) : console.log()
        if (localStorage.getItem('token') === 'null' || localStorage.getItem('token') === null) {
            localStorage.setItem('token', JSON.stringify(null))
            localStorage.setItem('user', JSON.stringify(null))
            this.$router.push({ name: 'SignUp' })
        }
    },
    mounted() {
        this.user = JSON.parse(localStorage.getItem('user'))
    },
    methods: {
        redirect(location) {
            this.$router.push({ name: location })
        },
    },
}
</script>
