<template>
    <div>
        <Header v-bind:user="user" />
        <div v-if="game_mode_availability_loaded">
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
                                <el-button
                                    type="warning"
                                    round
                                    :disabled="syn_button_disabled"
                                    @click="initialise('SYN')"
                                    >Synonyms</el-button
                                >
                            </div>
                            <span v-if="syn_button_disabled">Coming soon!</span>
                            <span v-else>
                                <div>
                                    Words with the
                                    <b>same</b> meaning
                                </div>
                                <div>eg: fast → quick</div>
                            </span>
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
                                    :disabled="ant_button_disabled"
                                    @click="initialise('ANT')"
                                    >Antonyms</el-button
                                >
                            </div>
                            <span v-if="ant_button_disabled">Coming soon!</span>
                            <span v-else>
                                <div>
                                    Words with the
                                    <b>opposite</b> meaning
                                </div>
                                <div>eg: fast → slow</div>
                            </span>
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
                                    :disabled="hyp_button_disabled"
                                    @click="initialise('HYP')"
                                    >Hypernyms</el-button
                                >
                            </div>
                            <span v-if="hyp_button_disabled">Coming soon!</span>
                            <span v-else>
                                <div>
                                    Words with a
                                    <b>more general</b> meaning
                                </div>
                                <div>eg: fast → speed</div>
                            </span>
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
            syn_button_disabled: true,
            ant_button_disabled: true,
            hyp_button_disabled: true,
            game_mode_availability_loaded: false,
        }
    },
    async created() {
        if (localStorage.getItem('token') === 'null' || localStorage.getItem('token') === null) {
            localStorage.setItem('token', JSON.stringify(null))
            localStorage.setItem('user', JSON.stringify(null))
            this.$router.push({ name: 'SignUp' })
        }

        const res = await apiRequest('post', 'getGameModeAvailabilitySingle', {})

        this.game_mode_availability_loaded = true

        this.syn_button_disabled = res.data.game_modes.synonyms ? false : true
        this.ant_button_disabled = res.data.game_modes.antonyms ? false : true
        this.hyp_button_disabled = res.data.game_modes.hypernyms ? false : true
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

            if (res.data.status) {
                this.$router.push({
                    name: 'SinglePlayerGame',
                    query: { token: res.data.game_token },
                })
            }
        },
    },
}
</script>
