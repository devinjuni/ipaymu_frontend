import Vue from 'vue'
import VueRouter from 'vue-router'
import User from '../views/User.vue'

Vue.use(VueRouter)

const routes = [{
        path: '/',
        name: 'User',
        component: User
    },
    {
        path: '/payment',
        name: 'Payment',
        component: () =>
            import ('../views/Payment.vue')
    }
]

const router = new VueRouter({
    routes,
    mode: 'history'
})

export default router