// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false
Vue.use(ElementUI, { locale })

// new Vue({
//     el: '#app',
//     router,
//     components: { App },
//     template: '<App/>',
// })

new Vue({
    router,
    render: h => h(App),
}).$mount('#app')
