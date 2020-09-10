import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        user_id: 0,
        username: '',
        address: '',
        contact: '',
        group: '',
        email: ''
    },
    mutations: {
        setUserid(state, user_id){
            state.user_id = user_id
        },
        setUsername(state, username){
            state.username = username
        },
        setAddress(state, address){
            state.address = address
        },
        setContact(state, contact){
            state.contact = contact
        },
        setGroup(state, group){
            state.group = group
        },
        setEmail(state, email){
            state.email = email
        }
    },
    actions: {
    },
    modules: {
    }
})
