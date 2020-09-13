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
                    <b-input-group-append v-if="$store.state.group === 'user'">
                        <b-button variant="outline-primary" @click="create">申请成为提供者</b-button>
                    </b-input-group-append>
                </b-input-group>
            </b-form-group>
            <b-button v-if="$store.state.group === 'admin' && info.group !== 'admin'" class="mt-3" block variant="danger" @click="del">删除</b-button>
        </b-form>
        <b-modal ref="request-info" title="申请详情" @ok="handle2Submit">
            <b-form-group label="请填写申请信息" label-for="info-input">
                <b-form-textarea id="info-input" v-model="text" placeholder="请填写申请信息（如您所属的实验室等）……" rows="6" no-resize></b-form-textarea>
            </b-form-group>
        </b-modal>
    </b-modal>
</template>

<script>
export default {
    name: 'UserEdit',
    props: ['info'],
    data(){
        return {
            text: '',
            options: [
                { value: 'admin', text: '管理员', disabled: true },
                { value: 'provider', text: '设备提供者' },
                { value: 'user', text: '普通用户' }
            ]
        }
    },
    methods: {
        handleSubmit(){ // 提交对用户信息的编辑
            this.axios.post('/api/users/' + this.info.id + '/update', {
                name: this.info.name,
                address: this.info.address,
                contact: this.info.contact,
                group: this.info.group
            }).then(() => {
                this.$emit('reload')
            })
        },
        del(){ // 删除用户
            this.axios.post('api/users/' + this.info.id + '/delete').then(() => {
                this.$refs['person-info'].hide()
                this.$emit('reload')
            })
        },
        create(){ // 设备提供者申请窗口
            this.text = ''
            this.$refs['request-info'].show()
        },
        handle2Submit(){ // 提交成为设备提供者的申请
            this.axios.post('/api/requests/provider/create', {
                user_id: this.$store.state.user_id,
                info: this.text
            }).catch(error => {
                if(error.response.status === 403) this.$router.push('/login')
            })
        }
    }
}
</script>