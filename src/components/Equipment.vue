<template>
    <div class="equipment">
        <b-modal id="equip-info" ref="equip-info" title="设备详情" hide-footer>
            <p>设备编号：{{ equip_info.equip_id }}</p>
            <p>设备名：{{ equip_info.name }}</p>
            <p>设备地址：{{ equip_info.address }}</p>
            <p>提供者：{{ equip_info.provider_name === '' ? equip_info.email: equip_info.provider_name }}</p>
            <p v-if="equip_info.provider_name !== ''">提供者邮箱：{{ equip_info.email }}</p>
            <p>联系电话：{{ equip_info.contact }}</p>
            <p>上架状态：{{ equip_info.launched ? '已上架': '未上架'}}</p>
            <p v-if="equip_info.launched">借出状态：{{ equip_info.used ? '已借出': '未借出' }}</p>
            <p v-if="equip_info.used">预计归还时间：{{ equip_info.rent_until }}</p>
            <p v-if="!equip_info.launched">申请情况：{{ equip_info.requesting ? '正在申请上架': '未申请上架' }}</p>
            <p>计划下架时间：{{ equip_info.expire_at }}</p>
            <b-button v-if="$store.state.group === 'admin' && !equip_info.launched" class="mt-3" block variant="success" @click="launch">{{ equip_info.requesting ? '同意上架': '上架' }}</b-button>
            <b-button v-if="(equip_info.provider_id === $store.state.user_id && $store.state.group !== 'admin') && !equip_info.launched && !equip_info.requesting" class="mt-3" block variant="success" @click="request">申请上架</b-button>
            <b-button v-if="(equip_info.provider_id === $store.state.user_id || $store.state.group === 'admin') && equip_info.returning" class="mt-3" block variant="success" @click="terminate">确认归还</b-button>
            <b-button v-if="(equip_info.provider_id === $store.state.user_id || $store.state.group === 'admin') && equip_info.launched && !equip_info.used" class="mt-3" block variant="warning" @click="discontinue">下架</b-button>
            <b-button v-if="(equip_info.provider_id === $store.state.user_id || $store.state.group === 'admin') && equip_info.requesting" class="mt-3" block variant="warning" @click="discontinue">{{ $store.state.group === 'admin' ? '拒绝上架': '取消上架申请' }}</b-button>
            <b-button v-if="equip_info.provider_id === $store.state.user_id || $store.state.group === 'admin'" class="mt-3" block variant="primary" @click="update">修改</b-button>
            <b-button v-if="equip_info.provider_id !== $store.state.user_id && equip_info.launched && !equip_info.used" class="mt-3" block variant="primary" @click="requests">申请租借</b-button>
            <b-button v-if="$store.state.group === 'admin' || equip_info.provider_id === $store.state.user_id" class="mt-3" block variant="danger" @click="del">删除</b-button>
            <b-button class="mt-3" block @click="$bvModal.hide('equip-info')">关闭</b-button>
        </b-modal>
        <b-modal ref="update-equipment" title="修改设备" @ok='handleSubmit'>
            <b-form ref="form" @submit.stop.prevent="handleSubmit">
                <b-form-group label="设备名" label-for="name-input">
                    <b-input-group>
                        <b-input-group-prepend is-text>
                            <b-icon icon="grid3x3-gap-fill"></b-icon>
                        </b-input-group-prepend>
                        <b-form-input id="name-input" v-model="equip_name"></b-form-input>
                    </b-input-group>
                </b-form-group>
                <b-form-group label="设备地址" label-for="address-input">
                    <b-input-group>
                        <b-input-group-prepend is-text>
                            <b-icon icon="house-door-fill"></b-icon>
                        </b-input-group-prepend>
                        <b-form-input id="address-input" v-model="equip_addr"></b-form-input>
                    </b-input-group>
                </b-form-group>
                <b-form-group label="结束出租时间" label-for="email-input">
                    <b-form-datepicker v-model="equip_date" class="mb-3" placeholder="请选择日期"></b-form-datepicker>
                    <b-form-timepicker v-model="equip_time" show-seconds :hour12="false" locale="de" placeholder="请选择时间"></b-form-timepicker>
                </b-form-group>
                <b-form-text v-if="seen" style="color: red !important;">请完整填写归还时间！</b-form-text>
                <b-form-text v-if="timeflag" style="color: red !important;">结束出租时间不得早于当前时间！</b-form-text>
            </b-form>
        </b-modal>
        <b-modal ref="request-info" title="申请租借" @ok='handle2Submit'>
            <b-form ref="form" @submit.stop.prevent="handle2Submit">
                <b-form-group label="申请理由" label-for="purpose-input">
                    <b-form-textarea id="purpose-input" v-model="purpose" rows="3" max-rows="6" placeholder="请输入申请理由"></b-form-textarea>
                </b-form-group>
                <b-form-group label="归还时间" label-for="email-input">
                    <b-form-datepicker v-model="expire_date" class="mb-3" placeholder="请选择日期"></b-form-datepicker>
                    <b-form-timepicker v-model="expire_time" show-seconds :hour12="false" locale="de" placeholder="请选择时间"></b-form-timepicker>
                </b-form-group>
                <b-form-text v-if="seen" style="color: red !important;">请完整填写归还时间！</b-form-text>
                <b-form-text v-if="timeflag" style="color: red !important;">结束出租时间不得早于当前时间！</b-form-text>
            </b-form>
        </b-modal>
        <b-modal ref="reminder" ok-only>
            <p>该预计下架时间<strong>早于当前时间</strong>，不得上架！</p>
            <br>
            <p>请修改预计下架时间后再上架！</p>
        </b-modal>
    </div>
</template>

<script>
export default {
    name: 'Equipment',
    props: ['equip_info'],
    data(){
        return {
            timeflag: false,
            equip_name: '',
            equip_addr: '',
            equip_date: '',
            equip_time: '',
            purpose: '',
            expire_date: '',
            expire_time: '',
            seen: false,
        }
    },
    methods: {
        update(){
            this.seen = false
            this.timeflag = false
            this.equip_name = this.equip_info.name
            this.equip_addr = this.equip_info.address
            let time = this.equip_info.expire_at.split(' ')
            this.equip_date = time[0]
            this.equip_time = time[1]
            this.$refs['update-equipment'].show()
        },
        handleSubmit(event){
            event.preventDefault()
            if(this.equip_name !== '' && this.equip_addr !== '' && this.equip_date !== '' && this.equip_time !== ''){
                this.seen = false
                let t = new Date(this.equip_date + 'T' + this.equip_time + '+08:00')
                let now = new Date()
                if(t < now){
                    this.timeflag = true
                } else {
                    this.axios.post('/api/equipment/' + this.equip_info.equip_id + '/update', {
                        name: this.equip_name,
                        address: this.equip_addr,
                        expire_at: this.equip_date + 'T' + this.equip_time + '+08:00'
                    }).then(() => {
                        this.$refs['equip-info'].hide()
                        this.$refs['update-equipment'].hide()
                        this.$emit('reload', this.$store.state.user_id)
                    })
                }
            } else {
                this.seen = true
                this.timeflag = false
            }
        },
        del(){
            this.axios.post('/api/equipment/' + this.equip_info.equip_id + '/delete').then(() => {
                this.$refs['equip-info'].hide()
                this.$emit('reload', this.$store.state.user_id)
            })
        },
        launch(){
            let t = new Date(this.equip_info.expire_at)
            let now = new Date()
            if(t < now){
                this.$refs['reminder'].show()
            } else {
                this.axios.post('/api/equipment/' + this.equip_info.equip_id + '/launch', {
                    notification: '您的设备（' + this.equip_info.name + '，设备编号：' + this.equip_info.equip_id + '）已由管理员' + (this.equip_info.requesting ? '同意上架！': '直接上架！')
                }).then(() => {
                    this.$refs['equip-info'].hide()
                    this.$emit('reload', this.$store.state.user_id)
                })
            }
        },
        discontinue(){
            this.axios.post('/api/equipment/' + this.equip_info.equip_id + '/discontinue').then(() => {
                this.$refs['equip-info'].hide()
                this.$emit('reload', this.$store.state.user_id)
            })
        },
        request(){
            let t = new Date(this.equip_info.expire_at)
            let now = new Date()
            if(t < now){
                this.$refs['reminder'].show()
            } else {
                this.axios.post('/api/equipment/' + this.equip_info.equip_id + '/request').then(() => {
                    this.$refs['equip-info'].hide()
                    this.$emit('reload', this.$store.state.user_id)
                })
            }
        },
        requests(){
            this.expire_date = ''
            this.expire_time = ''
            this.purpose = ''
            this.seen = false
            this.timeflag = false
            this.$refs['request-info'].show()
        },
        handle2Submit(event){
            event.preventDefault()
            if(this.expire_date !== '' && this.expire_date !== ''){
                this.seen = false
                let t = new Date(this.expire_date + 'T' + this.expire_time + '+08:00')
                let now = new Date()
                if(t < now){
                    this.timeflag = true
                } else {
                    this.axios.post('/api/requests/rental/create', {
                        equipment_id: this.equip_info.equip_id,
                        purpose: this.purpose,
                        rent_until: this.expire_date + 'T' + this.expire_time + '+08:00'
                    }).then(() => {
                        this.$refs['request-info'].hide()
                        this.$refs['equip-info'].hide()
                    })
                }
            } else {
                this.seen = true
                this.timeflag = false
            }
        },
        terminate(){
            this.axios.post('/api/equipment/' + this.equip_info.equip_id + '/terminate').then(() => {
                this.$refs['equip-info'].hide()
                this.$emit('reload', this.$store.state.user_id)
            })
        }
    }
}
</script>