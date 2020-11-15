<template lang="pug">
  .whooper
    Graph
    //- InputTable
    DataTable(
      v-if="showDataTable"
      :userData="userData"
    )
    WhoopLogin(
      v-if="showWhoopLogin"
      @setData="setData"
    )
</template>

<script>
import Vuetify from 'vuetify'

import DataTable from '../components/DataTable'
import InputTable from '../components/InputTable'
import WhoopLogin from '../components/WhoopLogin'
import Chart from '../components/Chart'
import Graph from '../components/Graph'

export default {
  components: {
    DataTable,
    InputTable,
    WhoopLogin,
    Chart,
    Graph
  },
  vuetify: new Vuetify(),
  data() {
    return {
      username: '',
      password: '',
      accessToken: '',
      userId: '',
      userData: [],
      showDataTable: false,
      showWhoopLogin: false
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

<style lang='scss'>
.whooper {
  margin: 0 auto;
  // min-height: 100vh;
  max-width: 100vw;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.teal-bg {
  background-color: #708a8c;
}

</style>
