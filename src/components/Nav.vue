<template>
    <b-navbar toggleable="lg" type="dark" variant="info">
        <b-navbar-brand href="#">iRental</b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
            <b-navbar-nav>
                <b-nav-item href="#">我的租借</b-nav-item>
                <b-nav-item href="#" disabled>我的设备</b-nav-item>
            </b-navbar-nav>
            <b-navbar-nav class="ml-auto">
                <b-nav-form>
                    <b-form-input size="sm" class="mr-sm-2" placeholder="Search"></b-form-input>
                    <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
                </b-nav-form>
                <b-nav-item-dropdown right>
                    <template v-slot:button-content>
                        {{ user }}
                    </template>
                    <b-dropdown-item href="#">个人信息</b-dropdown-item>
                    <b-dropdown-item href="#">登出</b-dropdown-item>
                </b-nav-item-dropdown>
            </b-navbar-nav>
        </b-collapse>
    </b-navbar>
</template>

<script>
export default {
    name: 'Nav',
    props: {
        user: String
    }
}
</script>

<style scoped>
nav {
    box-shadow: 0 0.25rem 0.25rem rgba(0,0,0,.25), inset 0 -1px 5px rgba(0,0,0,.25);
}
</style>