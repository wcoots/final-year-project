<template>
    <div>
        <Header v-bind:user="user" />
        <div>
            <div class="container">
                <br />
                <br />

                <el-row :gutter="20">
                    <el-col :span="12">
                        <h3>Results:</h3>
                    </el-col>
                    <el-col :span="12">
                        <span style="float:right;">
                            <el-tag type="success" style="margin:5px;">
                                <i class="el-icon-success" style="color:#67C23A;"></i>
                                Matched:
                                <b>{{ matched_count }}</b>
                            </el-tag>
                            <el-tag type="warning" style="margin:5px;">
                                <i class="el-icon-error" style="color:#E6A23C;"></i>
                                Passed:
                                <b>{{ passed_count }}</b>
                            </el-tag>
                            <el-tag type="danger" style="margin:5px;">
                                <i class="el-icon-error" style="color:#F56C6C;"></i>
                                Uncompleted:
                                <b>{{ uncompleted_count }}</b>
                            </el-tag>
                        </span>
                    </el-col>
                </el-row>

                <br />
                <el-table
                    :data="table_data"
                    style="width: 100%"
                    :row-class-name="tableRowClassName"
                >
                    <el-table-column prop="matched" width="40">
                        <template slot-scope="scope">
                            <i
                                v-if="scope.row.matched"
                                class="el-icon-success"
                                style="color:#67C23A;"
                            ></i>
                            <i
                                v-if="scope.row.passed"
                                class="el-icon-warning"
                                style="color:#E6A23C;"
                            ></i>
                            <i
                                v-if="scope.row.uncompleted"
                                class="el-icon-error"
                                style="color:#F56C6C;"
                            ></i>
                        </template>
                    </el-table-column>
                    <el-table-column prop="word" label="Word" width="180"></el-table-column>
                    <el-table-column
                        prop="matched_word"
                        label="Match"
                        width="180"
                    ></el-table-column>
                    <el-table-column prop="this_player" label="Your answers"></el-table-column>
                    <el-table-column
                        prop="other_player"
                        label="Opponent's answers"
                    ></el-table-column>
                </el-table>

                <br />
                <el-button type="success" round style="float:right;" @click="redirect('Home')"
                    >New Game</el-button
                >
            </div>
        </div>
    </div>
</template>

<script>
import Header from './Header'
import { apiRequest } from '../api/auth'

export default {
    name: 'GameResults',
    components: {
        Header,
    },
    data() {
        return {
            token: this.$route.query.token ? this.$route.query.token : null,
            user: null,
            table_data: null,
            matched_count: null,
            passed_count: null,
            uncompleted_count: null,
        }
    },
    async created() {
        if (localStorage.getItem('token') === 'null' || localStorage.getItem('token') === null) {
            localStorage.setItem('token', JSON.stringify(null))
            localStorage.setItem('user', JSON.stringify(null))
            this.$router.push({ name: 'SignUp' })
        }

        this.user = JSON.parse(localStorage.getItem('user'))

        const data = {
            user_id: JSON.parse(localStorage.getItem('user')).user_id,
            token: this.token,
        }
        const res = await apiRequest('post', 'getGameResults', data)

        this.table_data = res.data.words
        this.matched_count = res.data.matched_count
        this.passed_count = res.data.passed_count
        this.uncompleted_count = res.data.uncompleted_count
    },
    methods: {
        tableRowClassName({ row }) {
            if (row.matched) {
                return 'success-row'
            } else if (row.passed) {
                return 'warning-row'
            } else if (row.uncompleted) {
                return 'danger-row'
            }
            return ''
        },
        redirect(location) {
            this.$router.push({ name: location })
        },
    },
}
</script>

<style>
.el-table .danger-row {
    background: #fde6e6;
}

.el-table .warning-row {
    background: #fdf5e6;
}

.el-table .success-row {
    background: #f0f9eb;
}
</style>
