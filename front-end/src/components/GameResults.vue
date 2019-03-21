<template>
  <div>
    <Header v-bind:user="user"/>
    <div>
      <div class="container">
        <br>
        <br>

        <el-row :gutter="20">
          <el-col :span="12">
            <h3>Results:</h3>
          </el-col>
          <el-col :span="12">
            <span style="float:right;">
              <el-tag type="success">
                <i class="el-icon-success" style="color:#67C23A;"></i>
                Matched: {{ matched_count }}
              </el-tag>
              <el-tag type="danger">
                <i class="el-icon-error" style="color:#F56C6C;"></i>
                Passed: {{ passed_count }}
              </el-tag>
            </span>
          </el-col>
        </el-row>

        <br>
        <el-table :data="table_data" style="width: 100%" :row-class-name="tableRowClassName">
          <el-table-column prop="matched" width="40">
            <template slot-scope="scope">
              <i v-if="scope.row.matched" class="el-icon-success" style="color:#67C23A;"></i>
              <i v-if="!scope.row.matched" class="el-icon-error" style="color:#F56C6C;"></i>
            </template>
          </el-table-column>
          <el-table-column prop="word" label="Word" width="180"></el-table-column>
          <el-table-column prop="matched_word" label="Match" width="180"></el-table-column>
          <el-table-column prop="this_player" label="Your answers"></el-table-column>
          <el-table-column prop="other_player" label="Opponent's answers"></el-table-column>
        </el-table>

        <br>
        <el-button type="success" round @click="redirect('Home')" style="float:right;">New Game</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import Header from './Header'
import { apiRequest } from '../api/auth'
import _ from 'lodash'

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
    },
    methods: {
        tableRowClassName({ row, rowIndex }) {
            if (row.passed) {
                return 'warning-row'
            } else if (row.matched) {
                return 'success-row'
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
.el-table .warning-row {
    background: oldlace;
}

.el-table .success-row {
    background: #f0f9eb;
}
</style>