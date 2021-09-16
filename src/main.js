import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/axios'
import './plugins/bootstrap-vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

// import boostrap vue and icon 
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

//import vuetify
import vuetify from '@/plugins/vuetify'

//import axios
import VueAxios from 'axios'
window.axios = VueAxios;

// import vue confirm
import VueConfirmDialog from 'vue-confirm-dialog'

Vue.use(VueConfirmDialog)
Vue.component('vue-confirm-dialog', VueConfirmDialog.default)



new Vue({
    router,
    vuetify,
    render: h => h(App)
}).$mount('#app')