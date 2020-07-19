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

.footer {
  display: flex;
  align-items: center;

  img, a {
    margin: 0 3px;
  }

  p {
    margin: 0;
  }

  img {
    width: auto;
    height: 30px;
  }
}
</style>
