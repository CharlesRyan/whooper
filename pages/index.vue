<template lang="pug">
  .container
    DataTable(
      v-if="userData.length"
      :userData="userData"
    )
    Login(
      v-else 
      @setData="setData"
    )
</template>

<script>
import Vuetify from 'vuetify'

import DataTable from '../components/DataTable'
import Login from '../components/Login'
import Chart from '../components/Chart'

export default {
  components: {
    DataTable,
    Login,
    Chart
  },
  vuetify: new Vuetify(),
  data() {
    return {
      username: '',
      password: '',
      accessToken: '',
      userId: '',
      userData: [],
    }
  },
  mounted() {
  },
  computed: {
  },
  methods: {
    setData(data){
      this.userData = data
    }
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  max-width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
