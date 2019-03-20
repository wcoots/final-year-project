<template>
  <div class="countdown">
    <el-row>
      <el-col :span="3">
        <span v-if="minutes">
          <el-tag v-bind:type="tag_type">{{ minutes }} min</el-tag>
        </span>
        <span v-if="seconds || minutes">
          <el-tag v-bind:type="tag_type">{{ seconds }} sec</el-tag>
        </span>
        <span v-if="!(seconds || minutes)">
          <el-tag v-bind:type="tag_type">Time up!</el-tag>
        </span>
      </el-col>
      <el-col :span="21">
        <el-progress
          v-bind:percentage="bar_percentage"
          v-bind:color="bar_colour"
          :show-text="false"
        ></el-progress>
      </el-col>
    </el-row>

    <br>
  </div>
</template>

<script>
import moment from 'moment'
import { apiRequest } from '../api/auth'

export default {
    props: {
        date: String,
        game_id: Number,
        token: String,
    },
    data() {
        return {
            actualTime: moment().format('X'),
            termination_date: null,
            minutes: 0,
            seconds: 0,
            tag_type: 'success',
            bar_percentage: 100,
            bar_colour: '#67C23A',
            max_sec: 1,
            timer_is_going: false,
        }
    },
    created() {
        this.compute()
        this.incrementTime()
    },
    mounted() {
        this.termination_date = moment(this.date).format('X')
    },
    methods: {
        incrementTime() {
            this.actualTime = moment().format('X')
            setTimeout(() => {
                this.incrementTime()
                if (
                    (this.minutes === 1 && this.seconds < 15) ||
                    (this.minutes === 0 && this.seconds > 32)
                ) {
                    this.tag_type = 'warning'
                    this.bar_colour = '#E6A23C'
                } else if (this.minutes === 0 && this.seconds <= 32) {
                    this.tag_type = 'danger'
                    this.bar_colour = '#F56C6C'
                } else {
                    this.tag_type = 'success'
                    this.bar_colour = '#67C23A'
                }
                let total_secs = this.seconds + this.minutes * 60 - 1
                total_secs = total_secs > 0 ? total_secs : 0
                this.max_sec = total_secs > this.max_sec ? total_secs : this.max_sec
                this.bar_percentage = Math.round((total_secs / this.max_sec) * 100)
            }, 1000)
        },
        getDifference() {
            return this.termination_date - this.actualTime
        },
        async compute() {
            let duration = moment.duration(this.getDifference(), 'seconds')
            this.minutes = duration.minutes() > 0 ? duration.minutes() : 0
            this.seconds = duration.seconds() > 0 ? duration.seconds() : 0
            if (!this.minutes && !this.seconds) {
                if (this.timer_is_going) {
                    const data = {
                        game_id: this.game_id,
                    }
                    const res = await apiRequest('post', 'finishGame', data)
                    this.$router.push({
                        name: 'GameResults',
                        query: { token: this.token },
                    })
                } else {
                    this.timer_is_going = true
                }
            }
        },
    },
    watch: {
        actualTime(val, oldVal) {
            this.compute()
        },
    },
}
</script>