<template>
    <div>
        <Header v-bind:user="user" />
        <div>
            <div class="container">
                <br />
                <br />
                <h3>Multiplayer</h3>
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
                            <br />
                            <div>
                                <span v-if="syn_queueing" style="color:#67C23A;">
                                    <b>{{ syn_queueing }}</b>
                                </span>
                                <span v-else style="color:#F56C6C;">
                                    <b>{{ syn_queueing }}</b>
                                </span>
                                users queueing
                            </div>
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
                            <br />
                            <div>
                                <span v-if="ant_queueing" style="color:#67C23A;">
                                    <b>{{ ant_queueing }}</b>
                                </span>
                                <span v-else style="color:#F56C6C;">
                                    <b>{{ ant_queueing }}</b>
                                </span>
                                users queueing
                            </div>
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
                            <br />
                            <div>
                                <span v-if="hyp_queueing" style="color:#67C23A;">
                                    <b>{{ hyp_queueing }}</b>
                                </span>
                                <span v-else style="color:#F56C6C;">
                                    <b>{{ hyp_queueing }}</b>
                                </span>
                                users queueing
                            </div>
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
import io from 'socket.io-client'

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
            socket: null,
            syn_queueing: 0,
            ant_queueing: 0,
            hyp_queueing: 0,
        }
    },
    created() {
        if (localStorage.getItem('token') === 'null' || localStorage.getItem('token') === null) {
            localStorage.setItem('token', JSON.stringify(null))
            localStorage.setItem('user', JSON.stringify(null))
            this.$router.push({ name: 'SignUp' })
        }

        if (process.env.NODE_ENV === 'development') {
            this.socket = io.connect('localhost:8080')
        } else if (process.env.NODE_ENV === 'production') {
            this.socket = io.connect('api.werdz.fun')
        } else {
            this.$router.push({ name: 'Home' })
        }

        this.socket.on('queueStatus', async data => {
            // WHEN EITHER PLAYER SUBMITS AN ANSWER
            const grouped_queued_users = _.countBy(data.queued_users, 'game_mode')

            if (data.status) {
                this.syn_queueing = grouped_queued_users.SYN ? grouped_queued_users.SYN : 0
                this.ant_queueing = grouped_queued_users.ANT ? grouped_queued_users.ANT : 0
                this.hyp_queueing = grouped_queued_users.HYP ? grouped_queued_users.HYP : 0
            }
        })
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
                this.socket.emit('inQueue')
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
