<template>
  <div>
    <Header v-bind:user="user"/>
    <div>
      <div class="container">
        <div class="card mt-3">
          <div class="card-body">
            <div class="card-title">
              <h3>Chat Group</h3>
              <hr>
            </div>
            <div class="card-body">
              <div class="messages">{{messages}}</div>
            </div>
          </div>
          <div class="card-footer">
            <form @submit.prevent="sendMessage">
              <div class="gorm-group">
                <label for="input_user">User:</label>
                <input type="text" v-model="input_user" class="form-control">
              </div>
              <div class="gorm-group pb-3">
                <label for="message">Message:</label>
                <input type="text" v-model="message" class="form-control">
              </div>
              <button type="submit" class="btn btn-success">Send</button>
            </form>
          </div>
          <div class="card-footer">
            <form @submit.prevent="recieveMessage">
              <div class="gorm-group">
                <label for="input_user">User:</label>
                <input type="text" v-model="input_user" class="form-control">
              </div>
              <div class="gorm-group pb-3">
                <label for="message">Message:</label>
                <input type="text" v-model="message" class="form-control">
              </div>
              <button type="submit" class="btn btn-success">Recieve</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import Header from './Header'
import { apiRequest } from '../api/auth'
import _ from 'lodash'
import io from 'socket.io-client'

export default {
    name: 'Test',
    components: {
        Header,
    },
    data() {
        return {
            user: null,
            input_user: '',
            message: '',
            messages: [],
            socket:
                process.env.NODE_ENV === 'development'
                    ? io.connect('localhost:8080')
                    : io.connect('api.werdz.fun'),
        }
    },
    async created() {
        if (localStorage.getItem('token') === 'null' || localStorage.getItem('token') === null) {
            localStorage.setItem('token', JSON.stringify(null))
            localStorage.setItem('user', JSON.stringify(null))
            this.$router.push({ name: 'SignUp' })
        }
        this.user = JSON.parse(localStorage.getItem('user'))
    },
    async mounted() {
        this.socket.on('MESSAGE', data => {
            this.messages.push(data.message)
        })
    },
    methods: {
        sendMessage(e) {
            e.preventDefault()

            this.socket.emit('SEND_MESSAGE', {
                input_user: this.input_user,
                message: this.message,
                type: 'message sent',
            })
            this.message = ''
        },
        recieveMessage(e) {
            e.preventDefault()

            this.socket.emit('RECIEVE_MESSAGE', {
                input_user: this.input_user,
                message: this.message,
                type: 'message recieved',
            })
            this.message = ''
        },
    },
}
</script>