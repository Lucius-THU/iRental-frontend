<template>
    <b-modal ref="person-info" title="个人信息" @ok="handleSubmit">
        <b-form ref="form" @submit.stop.prevent="handleSubmit">
            <b-form-group label="用户名" label-for="name-input">
                <b-input-group>
                    <b-input-group-prepend is-text>
                        <b-icon icon="person-circle"></b-icon>
                    </b-input-group-prepend>
                    <b-form-input id="name-input" v-model="info.name"></b-form-input>
                </b-input-group>
            </b-form-group>
            <b-form-group label="地址" label-for="address-input">
                <b-input-group>
                    <b-input-group-prepend is-text>
                        <b-icon icon="house-door-fill"></b-icon>
                    </b-input-group-prepend>
                    <b-form-input id="address-input" v-model="info.address"></b-form-input>
                </b-input-group>
            </b-form-group>
            <b-form-group label="邮箱" label-for="email-input">
                <b-input-group>
                    <b-input-group-prepend is-text>
                        <b-icon icon="envelope-fill"></b-icon>
                    </b-input-group-prepend>
                    <b-form-input id="email-input" v-model="info.email" disabled></b-form-input>
                </b-input-group>
            </b-form-group>
            <b-form-group label="联系电话" label-for="contact-input">
                <b-input-group>
                    <b-input-group-prepend is-text>
                        <b-icon icon="phone-fill"></b-icon>
                    </b-input-group-prepend>
                    <b-form-input id="contact-input" v-model="info.contact" type="tel"></b-form-input>
                </b-input-group>
            </b-form-group>
            <b-form-group label="权限" label-for="auth-input">
                <b-input-group>
                    <b-input-group-prepend is-text>
                        <b-icon icon="gear-wide-connected"></b-icon>
                    </b-input-group-prepend>
                    <b-form-select id="auth-input" v-model="info.group" :options="options" :disabled="$store.state.group !== 'admin' || info.group === 'admin'"></b-form-select>
                </b-input-group>
            </b-form-group>
            <b-button v-if="$store.state.group === 'admin' && info.group !== 'admin'" class="mt-3" block variant="danger" @click="del">删除</b-button>
        </b-form>
    </b-modal>
</template>

<script>
export default {
    name: 'UserEdit',
    props: ['info'],
    data(){
        return {
            group: this.$store.state.group,
            name: this.$store.state.username,
            email: this.$store.state.email,
            address: this.$store.state.address,
            contact: this.$store.state.contact,
            options: [
                { value: 'admin', text: '管理员' },
                { value: 'provider', text: '设备提供者' },
                { value: 'user', text: '普通用户' }
            ]
        }
    },
    methods: {
        handleSubmit(){
            this.axios.post('/api/users/' + this.info.id + '/update', {
                name: this.info.name,
                address: this.info.address,
                contact: this.info.contact,
                group: this.info.group
            }).then(() => {
                this.$emit('reload')
            })
        },
        del(){
            this.axios.post('api/users/' + this.info.id + '/delete').then(() => {
                this.$refs['person-info'].hide()
                this.$emit('reload')
            })
        }
    }
}
</script>