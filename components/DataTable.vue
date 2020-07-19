<template lang="pug">
  v-app
    .data-table
      v-expansion-panels.my-10
        v-expansion-panel
          v-expansion-panel-header Show/Hide Categories
          v-expansion-panel-content
            v-row.flex-row.flex-wrap.data-table__options(
              justify="space-around"
              align="center"
            )
              //- v-col.col-12(
              v-col.col-12.col-xs-12.col-sm-12.col-md-4.col-lg-2(
                v-for="header in rawHeaders"
                :key="header.value"
                v-if="header.text !== 'Date'"
              )
                v-switch(
                  :label="header.text"
                  v-model="header.show"
                )
      v-data-table(
        v-model="selected"
        :headers="headers"
        :items="tableData"
        :single-select="singleSelect"
        multi-sort
        item-key="date"
        class="elevation-1"
        :loading="loading"
      )
    
    .footer.mb-2
      p Built with 
      img(src="https://nuxtjs.org/logos/nuxt-icon.png")
      p by
      a(href="https://charlesryan.dev") Charles

</template>

<script>
import Vuetify from 'vuetify'

export default {
  name: 'DataTable',
  components: {},
  vuetify: new Vuetify(),
  props: {
    userData: Array
  },
  data() {
    return {
      singleSelect: false,
      loading: true,
      selected: [],
      rawHeaders: [
        { text: 'Date', value: 'date', show: true },
        { text: 'HRV', value: 'hrv', show: true },
        { text: 'Resting Heart Rate', value: 'rhr', show: true },
        { text: 'Recovery Score', value: 'recovery', show: true },
        { text: 'Sleep Score', value: 'sleep', show: true },
        { text: 'Strain Score', value: 'strain', show: true },
        { text: 'Respiratory Rate', value: 'respiratoryRate', show: false },
        {
          text: 'Light Sleep Total',
          value: 'lightSleepDuration',
          show: false
        },
        { text: 'REM Sleep Total', value: 'remDuration', show: false },
        { text: 'Deep Sleep Total', value: 'swsDuration', show: false }
      ]
    }
  },
  mounted() {
    this.loading = false
  },
  computed: {
    headers() {
      return this.rawHeaders.filter((header) => header.show)
    },
    tableData() {
      return this.userData.map((item) => {
        const hrv = item.recovery
          ? Math.round(item.recovery.heartRateVariabilityRmssd * 1000)
          : 'no data'
        const rhr = item.recovery ? item.recovery.restingHeartRate : 'no data'
        const recovery = item.recovery ? item.recovery.score : 'no data'
        const sleep = item.sleep ? item.sleep.score : 'no data'
        const strain = item.strain ? Math.round(item.strain.score) : 'no data'

        const respiratoryRate =
          item.sleep && item.sleep.sleeps[0]
            ? Math.round(item.sleep.sleeps[0].respiratoryRate)
            : 'no data'
        const remDuration =
          item.sleep && item.sleep.sleeps[0]
            ? this.msToTime(item.sleep.sleeps[0].remSleepDuration)
            : 'no data'
        const lightSleepDuration =
          item.sleep && item.sleep.sleeps[0]
            ? this.msToTime(item.sleep.sleeps[0].lightSleepDuration)
            : 'no data'
        const swsDuration =
          item.sleep && item.sleep.sleeps[0]
            ? this.msToTime(item.sleep.sleeps[0].slowWaveSleepDuration)
            : 'no data'

        return {
          date: item.days[0],
          hrv: hrv,
          rhr: rhr,
          recovery: recovery,
          sleep: sleep,
          strain: strain,
          respiratoryRate: respiratoryRate,
          remDuration: remDuration,
          lightSleepDuration: lightSleepDuration,
          swsDuration: swsDuration
        }
      })
    }
  },
  methods: {
    msToTime(duration) {
      let minutes = Math.floor((duration / (1000 * 60)) % 60)
      let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

      hours = hours < 10 ? '0' + hours : hours
      minutes = minutes < 10 ? '0' + minutes : minutes

      return hours + ':' + minutes
    }
  }
}
</script>

<style lang="scss">
.v-application {
  width: 100%;

  &--wrap {
    justify-content: space-between;
  }
}

.container {
  margin: 0 auto;
  min-height: 100vh;
  max-width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  th {
    text-align: center !important;
  }
}

.data-table {
  width: 90%;
  max-width: 1150px;
  margin: 0 auto 100px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;

  &__options {
    // max-height: 200px;
  }
}
</style>
