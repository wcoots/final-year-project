<template>
    <nav class="navbar navbar-light bg-light">
        <el-button
            class="navbar-brand mb-0 h1"
            style="font-size: 180%;"
            type="text"
            v-on:click="redirect('Home')"
            >Werdz</el-button
        >
        <div v-if="user != null">
            <el-dropdown trigger="click" @command="redirect">
                <el-button type="primary">
                    Menu
                    <i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item index="1" command="Home">
                        <i class="el-icon-menu"></i>
                        Home
                    </el-dropdown-item>
                    <el-dropdown-item index="1" command="SinglePlayer" disabled>
                        <i class="el-icon-star-off"></i>
                        Single player
                    </el-dropdown-item>
                    <el-dropdown-item index="1" command="MultiPlayer">
                        <i class="el-icon-star-on"></i>
                        Multiplayer
                    </el-dropdown-item>
                    <el-dropdown-item index="1" command="AccountSettings">
                        <i class="el-icon-setting"></i>
                        Account Settings
                    </el-dropdown-item>
                    <el-dropdown-item index="1" command="Logout" style="color:#F4907B;">
                        <i class="el-icon-circle-close-outline" color="red"></i>
                        Logout
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </nav>
</template>

<script>
export default {
    name: 'Header',
    props: { user: Object },
    methods: {
        redirect(action) {
            if (action === 'Logout') {
                localStorage.setItem('token', JSON.stringify(null))
                localStorage.setItem('user', JSON.stringify(null))
                this.$router.push({ name: 'SignUp' })
            } else {
                this.$router.push({ name: action })
            }
        },
    },
}
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
}
</style>
