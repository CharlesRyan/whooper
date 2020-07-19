<template lang="pug">
  .whooper
    DataTable(
      v-if="userData.length"
      :userData="userData"
    )
    Login(
      v-else 
      @setData="setData"
    )
    .footer 
      p 
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
.whooper {
  margin: 0 auto;
  min-height: 100vh;
  max-width: 100vw;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
</style>
