<template>
  <div>
    <Header v-bind:user="user"/>
    <div>
      <div class="container">
        <br>
        <br>
        <h3>Single Player</h3>
        <br>
        <h4>Choose word type</h4>
        <br>
        <el-row :gutter="20">
          <el-col :span="4">
            <!-- SYNONYMS -->
            <el-popover placement="bottom-start" title="Synonyms" width="240" trigger="hover">
              <div>Words with the same meaning
                <br>eg: fast -> quick
              </div>
              <el-button slot="reference" type="warning" round @click="initialise('SYN')">Synonyms</el-button>
            </el-popover>
          </el-col>
          <el-col :span="4">
            <!-- ANTONYMS -->
            <el-popover placement="bottom" title="Antonyms" width="255" trigger="hover">
              <div>Words with the opposite meaning
                <br>eg: fast -> slow
              </div>
              <el-button slot="reference" type="warning" round @click="initialise('ANT')">Antonyms</el-button>
            </el-popover>
          </el-col>
          <el-col :span="4">
            <!-- HYPERNYMS -->
            <el-popover placement="bottom-end" title="Hypernyms" width="260" trigger="hover">
              <div>Words with a more general meaning
                <br>eg: chair -> furniture
              </div>
              <el-button slot="reference" type="warning" round @click="initialise('HYP')">Hypernyms</el-button>
            </el-popover>
          </el-col>
        </el-row>

        <br>
        <br>
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
        async initialise(game_mode) {},
    },
}
</script>

<style>
.el-row {
    margin-bottom: 20px;
    &:last-child {
        margin-bottom: 0;
    }
}
.el-col {
    border-radius: 4px;
}
.bg-purple-dark {
    background: #99a9bf;
}
.bg-purple {
    background: #d3dce6;
}
.bg-purple-light {
    background: #e5e9f2;
}
.grid-content {
    border-radius: 4px;
    min-height: 36px;
}
.row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
}
</style>