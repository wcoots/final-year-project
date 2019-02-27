<template>
  <div>
    <Header v-bind:user="user"/>
    <div>
      <div class="container">
        <div class="tab-pane fade show active">
          <div class="row">
            <div class="col-md-12">
              <h3>Choose game mode</h3>
              <br>
              <button class="btn btn-success btn-light btn-large">Synonyms</button>
              <button class="btn btn-success btn-light btn-large">Hypernyms</button>
              <button class="btn btn-success btn-light btn-large">Antonyms</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from './Header'

export default {
    name: 'Home',
    components: {
        Header,
    },
    data() {
        return {
            title: 'App',
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
}
</script>