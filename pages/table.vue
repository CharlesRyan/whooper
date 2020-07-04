<template lang="pug">
  v-app.container
    v-row(
      justify="space-around"
      align="center"
    )
      v-col(
        v-for="header in rawHeaders"
        :key="header.value"
        cols="2"
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
      item-key="date"
      class="elevation-1"
    )

</template>

<script>
import Vuetify from 'Vuetify'

import userData from '../assets/staticData'

export default {
  components: {},
  vuetify: new Vuetify(),
  data() {
    return {
      userData: userData,
      singleSelect: false,
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
          text: 'Light Sleep Duration',
          value: 'lightSleepDuration',
          show: false
        },
        { text: 'REM Sleep Duration', value: 'remDuration', show: false },
        { text: 'Deep Sleep Duration', value: 'swsDuration', show: false }
      ]
    }
  },
  mounted() {
    console.log(this.userData)
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

th {
  text-align: center !important;
}
</style>
