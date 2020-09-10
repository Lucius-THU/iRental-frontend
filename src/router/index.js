import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Signup from '../views/Signup.vue'
import MyEquipment from '../views/MyEquipment.vue'
import Users from '../views/Users.vue'
import Rental from '../views/Rental.vue'

Vue.use(VueRouter)

    const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/about',
        name: 'About',
        component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/signup',
        name: 'Signup',
        component: Signup
    },
    {
        path: '/my-equipment',
        name: 'MyEquipment',
        component: MyEquipment
    },
    {
        path: '/users',
        name: 'Users',
        component: Users
    },
    {
        path: '/rental',
        name: 'Rental',
        component: Rental
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
