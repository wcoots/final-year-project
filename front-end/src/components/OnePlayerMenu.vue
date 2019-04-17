<template>
    <div>
        <Header v-bind:user="user" />
        <div>
            <div class="container">
                <br />
                <br />
                <h3>Single player</h3>
                <br />
                <h4>Choose word type</h4>
                <br />

                <el-row :gutter="12">
                    <!-- SYNONYMS -->
                    <el-col :span="8">
                        <el-card shadow="hover">
                            <div slot="header" class="clearfix">
                                <el-button type="warning" round @click="initialise('SYN')"
                                    >Synonyms</el-button
                                >
                            </div>
                            <div>
                                Words with the
                                <b>same</b> meaning
                            </div>
                            <div>eg: fast → quick</div>
                        </el-card>
                    </el-col>
                    <!-- ANTONYMS -->
                    <el-col :span="8">
                        <el-card shadow="hover">
                            <div slot="header" class="clearfix">
                                <el-button
                                    slot="reference"
                                    type="warning"
                                    round
                                    @click="initialise('ANT')"
                                    >Antonyms</el-button
                                >
                            </div>
                            <div>
                                Words with the
                                <b>opposite</b> meaning
                            </div>
                            <div>eg: fast → slow</div>
                        </el-card>
                    </el-col>
                    <!-- HYPERNYMS -->
                    <el-col :span="8">
                        <el-card shadow="hover">
                            <div slot="header" class="clearfix">
                                <el-button
                                    slot="reference"
                                    type="warning"
                                    round
                                    @click="initialise('HYP')"
                                    >Hypernyms</el-button
                                >
                            </div>
                            <div>
                                Words with a
                                <b>more general</b> meaning
                            </div>
                            <div>eg: chair → furniture</div>
                        </el-card>
                    </el-col>
                </el-row>

                <br />
            </div>
        </div>
    </div>
</template>

<script>
import Header from './Header'
import { apiRequest } from '../api/auth'

export default {
    name: 'OnePlayerMenu',
    components: {
        Header,
    },
    data() {
        return {
            user: null,
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
    methods: {
        async initialise(game_mode) {
            const data = {
                user_id: JSON.parse(localStorage.getItem('user')).user_id,
                game_mode,
            }

            const res = await apiRequest('post', 'startSinglePlayerGame', data)

            // if (res.data.status) {
            //     this.$router.push({
            //         name: 'SinglePlayerGame',
            //         query: { token: res.data.game_token },
            //     })
            // }
        },
    },
}
</script>
