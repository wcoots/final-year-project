<template>
    <div>
        <Header v-bind:user="user" />
        <div>
            <div class="container">
                <br />
                <br />
                <h3>Single Player</h3>
                <br />
                <h4>Choose word type</h4>
                <br />
                <el-row :gutter="20">
                    <el-col :span="4">
                        <!-- SYNONYMS -->
                        <el-popover
                            placement="bottom-start"
                            title="Synonyms"
                            width="240"
                            trigger="hover"
                        >
                            <div>
                                Words with the
                                <b>same</b> meaning <br />eg: fast → quick
                            </div>
                            <el-button
                                slot="reference"
                                type="warning"
                                round
                                @click="initialise('SYN')"
                                >Synonyms</el-button
                            >
                        </el-popover>
                    </el-col>
                    <el-col :span="4">
                        <!-- ANTONYMS -->
                        <el-popover placement="bottom" title="Antonyms" width="255" trigger="hover">
                            <div>
                                Words with the
                                <b>opposite</b> meaning <br />eg: fast → slow
                            </div>
                            <el-button
                                slot="reference"
                                type="warning"
                                round
                                @click="initialise('ANT')"
                                >Antonyms</el-button
                            >
                        </el-popover>
                    </el-col>
                    <el-col :span="4">
                        <!-- HYPERNYMS -->
                        <el-popover
                            placement="bottom-end"
                            title="Hypernyms"
                            width="270"
                            trigger="hover"
                        >
                            <div>
                                Words with a
                                <b>more general</b> meaning <br />eg: chair → furniture
                            </div>
                            <el-button
                                slot="reference"
                                type="warning"
                                round
                                @click="initialise('HYP')"
                                >Hypernyms</el-button
                            >
                        </el-popover>
                    </el-col>
                </el-row>

                <br />
                <br />
            </div>
        </div>
    </div>
</template>

<script>
import Header from './Header'
import { apiRequest } from '../api/auth'

export default {
    name: 'Home',
    components: {
        Header,
    },
    data() {
        return {
            user: null,
            loading: false,
            alive: null,
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
            this.loading = this.$loading({
                lock: true,
                text: 'Finding another player...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.8)',
            })
            const data = {
                user_id: JSON.parse(localStorage.getItem('user')).user_id,
                game_mode,
            }

            await apiRequest('post', 'joinQueue', data)

            this.alive = await setInterval(async () => {
                const hb_res = await apiRequest('post', 'heartbeat', data)
                if (hb_res.data.status) {
                    this.loading.close()
                    this.$router.push({
                        name: 'Game',
                        query: { token: hb_res.data.user.game_token },
                    })
                    clearInterval(this.alive)
                }
            }, 2000)
        },
    },
    destroyed() {
        clearInterval(this.alive)
        if (this.loading) {
            this.loading.close()
        }
    },
}
</script>
