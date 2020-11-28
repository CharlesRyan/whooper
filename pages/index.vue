<template lang="pug">
  v-app
    .whooper
      Navbar
      InputTable(
        v-if="page === Pages.INPUT_TABLE"
      )
      Graph(
        v-if="page === Pages.GRAPH"
      )
      DataTable(
        v-if="showDataTable"
        :userData="userData"
      )
      WhoopLogin(
        v-if="showWhoopLogin"
        @setData="setData"
      )
    
    Footer
</template>

<script>
import { mapState } from 'vuex'

import DataTable from '../components/DataTable'
import InputTable from '../components/InputTable'
import WhoopLogin from '../components/WhoopLogin'
import Chart from '../components/Chart'
import Graph from '../components/Graph'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Pages from "../pages"

export default {
  components: {
    DataTable,
    InputTable,
    WhoopLogin,
    Chart,
    Graph,
    Navbar,
    Footer
  },
  data() {
    return {
      username: '',
      password: '',
      accessToken: '',
      userId: '',
      userData: [],
      showDataTable: false,
      showWhoopLogin: false,
      Pages
    }
  },
  mounted() {
    this.$store.commit('setTest', 'test heah')
  },
  computed: {
    ...mapState({
      page: (state) => state.page
    })
  },
  methods: {
    setData(data) {
      this.userData = data
    }
  }
}
</script>

<style lang="scss">
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

.theme--light,
.theme--dark {
  &.v-application {
    // background-color: $bg;
  }
}
</style>
