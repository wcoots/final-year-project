<template>
  <div class="container-fluid" style="padding: 0px;">
    <Header v-bind:user="user"/>
    <template v-if="this.isactive === 'goToPage1'">
      <Page1/>
    </template>
    <template v-if="this.isactive === 'goToPage2'">
      <Page2/>
    </template>
    <template v-if="this.isactive === 'goToAccountSettings'">
      <AccountSettings/>
    </template>
    <template v-if="this.isactive === 'goToDeleteAccount'">
      <DeleteAccount/>
    </template>
  </div>
</template>

<script>
import axios from 'axios'
import Header from './Header'
import Page1 from './Page1'
import Page2 from './Page2'
import AccountSettings from './AccountSettings'
import DeleteAccount from './DeleteAccount'
export default {
    name: 'Dashboard',
    components: {
        Header,
        Page1,
        Page2,
        AccountSettings,
        DeleteAccount,
    },
    data() {
        return {
            isactive: 'goToPage1',
            title: 'App',
            user: this.$route.params.user ? this.$route.params.user : null,
        }
    },
    created() {
        if (localStorage.getItem('token') === 'null') {
            const formData = new FormData()
            axios.post('http://localhost:3128/logout', formData).then(res => {
                localStorage.setItem('token', JSON.stringify(null))
                localStorage.setItem('user', JSON.stringify(null))

                this.$router.push({
                    name: 'SignUp',
                })
            })
        }
    },
    mounted() {
        this.user = JSON.parse(localStorage.getItem('user')) // conflicts with data() ???
    },
}
</script>
