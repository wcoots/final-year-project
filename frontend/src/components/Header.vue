<template>
  <nav class="navbar navbar-light bg-light">
    <template v-if="user != null">
      <SideNav v-bind:first_name="user.first_name"/>
    </template>
    <span class="navbar-brand mb-0 h1">{{title}}</span>
  </nav>
</template>

<script>
import SideNav from './SideNav'

export default {
    name: 'Header',
    props: ['user'],
    components: {
        SideNav,
    },
    data() {
        return {
            title: 'App',
        }
    },
}
</script>
