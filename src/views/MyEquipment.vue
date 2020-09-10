<template>
    <div class="my-equipment">
        <Nav></Nav>
        <div class="overflow-auto">
            <b-table id="my-table" :items="items" :per-page="perPage" :current-page="currentPage" small></b-table>
            <b-pagination v-model="currentPage" :total-rows="rows" :per-page="perPage" aria-controls="my-table"></b-pagination>
        </div>
    </div>
</template>

<script>
import Nav from '../components/Nav.vue'
export default {
    name: 'MyEquipment',
    components: {
        Nav
    },
    data(){
        return {
            currentPage: 1,
            rows: 0,
            perPage: 10,
            items: []
        }
    },
    mounted(){
        this.axios.get('/api/equipment/', {
            params: {
                provider_id: this.$store.state.user_id
            }
        }).then(response => {
            this.rows = response.data.total
            this.items = response.data.list
        })
    }
}
</script>