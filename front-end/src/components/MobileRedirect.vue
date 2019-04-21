<template>
    <div>
        <Header />
        <div class="container" style="text-align: center;">
            <br />
            <br />
            <h3>Uh oh!</h3>
            <br />
            <div>
                <h4>It looks like you tried to view this page on a mobile device.</h4>
            </div>
            <br />
            <div>
                <h4>
                    Unfortunatly we don't support werdz on a mobile platform, so you'll have to come
                    back on a laptop/computer.
                </h4>
            </div>
            <br />

            <br />
        </div>
    </div>
</template>

<script>
import Header from './Header'

export default {
    name: 'MobileRedirect',
    components: {
        Header,
    },
    data() {
        return {}
    },
    created() {
        if (
            typeof window.orientation === 'undefined' &&
            navigator.userAgent.indexOf('IEMobile') === -1
        ) {
            this.$router.push({ name: 'SignUp' })
        }
    },
}
</script>
