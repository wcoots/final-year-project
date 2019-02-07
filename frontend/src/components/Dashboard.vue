<template>
  <div class="container-fluid" style="padding: 0px;">
    <Header v-bind:user="user"/>
    <template v-if="this.isactive == 'goToPage1'">
      <Page1/>
    </template>
    <template v-else>
      <Page2/>
    </template>
  </div>
</template>

<script>
import Header from './Header'
import Page1 from './Page1'
import Page2 from './Page2'
export default {
    name: 'Dashboard',
    components: {
        Header,
        Page1,
        Page2,
    },
    data() {
        return {
            isactive: 'goToPage1',
            title: 'App',
            user: this.$route.params.user ? this.$route.params.user : null,
        }
    },
    mounted() {
        this.user = JSON.parse(localStorage.getItem('user'))
    },
}
</script>
