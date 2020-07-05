<template lang="pug">
  v-app.data-table
    v-expansion-panels
      v-expansion-panel
        v-expansion-panel-header Options
        v-expansion-panel-content
          v-row.flex-row.flex-wrap.data-table__options(
            justify="space-around"
            align="center"
          )
            v-col.col-xs-12.col-sm-6.col-md-4.col-lg-2(
              v-for="header in rawHeaders"
              :key="header.value"
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
    br
    hr
    br
    v-data-table(
      :headers="impactHeaders"
      :items="impactData"
      multi-sort
      item-key="activity"
      class="elevation-1"
    )

</template>

<script>
import Vuetify from 'vuetify'

import staticData from '../assets/staticData'
import habitData from '../assets/habitData'

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
      ],
      rawImpactHeaders: [
        { text: 'Activity', value: 'activity', show: true },
        { text: 'HRV', value: 'hrv', show: true },
        { text: 'Resting Heart Rate', value: 'rhr', show: true },
        { text: 'Recovery Score', value: 'recovery', show: true },
        { text: 'Sleep Score', value: 'sleep', show: true },
        { text: 'Strain Score', value: 'strain', show: true },
        { text: 'Respiratory Rate', value: 'respiratoryRate', show: true },
        {
          text: 'Light Sleep Total',
          value: 'lightSleepDuration',
          show: true
        },
        { text: 'REM Sleep Total', value: 'remDuration', show: true },
        { text: 'Deep Sleep Total', value: 'swsDuration', show: true }
      ],
      tableData: [],
      tableDataAvgs: {},
      impactData: [],
      habitData: habitData
    }
  },
  mounted() {
    // console.log('userData', this.userData)
    console.log('habitData', this.habitData)
    this.loading = false
    this.parseTableData()
    console.log('tableData', this.tableData)
    this.getTableDataAvgs()
    this.getImpactData()
  },
  computed: {
    headers() {
      return this.rawHeaders.filter((header) => header.show)
    },
    impactHeaders() {
      return this.rawImpactHeaders.filter((header) => header.show)
    }
  },
  methods: {
    getImpactData() {
      const impactSums = {}

      this.habitData.forEach((el) => {
        const date = el.Date
        // get corresponding day's raw data
        const dayData = this.tableData.find((day) => day.date === date)
        if (dayData) {
          Object.keys(el).forEach((activity) => {
            // if the activity took place, add the variation to the activity's variation total and increment count
            if (el[activity] !== 0) {
              if (impactSums.hasOwnProperty(activity)) {
                // increment
                Object.keys(dayData).forEach((metric) => {
                  if (dayData[metric] !== 'no data') {
                    impactSums[activity][metric]['total'] += dayData[metric]
                    impactSums[activity][metric]['count']++
                  }
                })
              } else {
                // initialize
                Object.keys(dayData).forEach((metric) => {
                  if (dayData[metric] !== 'no data') {
                    if (!impactSums.hasOwnProperty(activity)) {
                      impactSums[activity] = {}
                    }

                    impactSums[activity][metric] = {
                      total: dayData[metric],
                      count: 1
                    }
                  }
                })
              }
            }
          })
        }
      })

      // calculate averages for each activity
      Object.keys(impactSums).forEach((key1) => {
        Object.keys(impactSums[key1]).forEach((key2) => {
          impactSums[key1][key2]['average'] = Math.round(
            impactSums[key1][key2]['total'] / impactSums[key1][key2]['count']
          )
        })
      })

      // compare activity averages to overall averages
      Object.keys(impactSums).forEach((activity) => {
        if (activity !== 'Date' && activity !== 'FIELD21') {
          const impactItem = {
            activity: activity
          }
          Object.keys(impactSums[activity]).map((metric) => {
            if (this.tableDataAvgs[metric]) {
              impactItem[metric] =
                impactSums[activity][metric]['average'] -
                this.tableDataAvgs[metric]['average']
            }
          })

          this.impactData.push(impactItem)
        }
      })
    },
    getTableDataAvgs() {
      this.tableData.forEach((el) => {
        Object.keys(el).forEach((key) => {
          if (el[key] !== 'no data' && key !== 'date') {
            if (this.tableDataAvgs.hasOwnProperty(key)) {
              this.tableDataAvgs[key]['total'] += el[key]
              this.tableDataAvgs[key]['count']++
            } else {
              this.tableDataAvgs[key] = {
                total: el[key],
                count: 1
              }
            }
          }
        })
      })

      Object.keys(this.tableDataAvgs).forEach((key) => {
        this.tableDataAvgs[key]['average'] = Math.round(
          this.tableDataAvgs[key]['total'] / this.tableDataAvgs[key]['count']
        )
      })

      console.log('sums', this.tableDataAvgs)
    },
    parseTableData() {
      this.tableData = this.userData.map((item) => {
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
            ? this.msToMinutes(item.sleep.sleeps[0].remSleepDuration)
            : 'no data'
        const lightSleepDuration =
          item.sleep && item.sleep.sleeps[0]
            ? this.msToMinutes(item.sleep.sleeps[0].lightSleepDuration)
            : 'no data'
        const swsDuration =
          item.sleep && item.sleep.sleeps[0]
            ? this.msToMinutes(item.sleep.sleeps[0].slowWaveSleepDuration)
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
    },
    msToTime(duration) {
      let minutes = Math.floor((duration / (1000 * 60)) % 60)
      let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

      hours = hours < 10 ? '0' + hours : hours
      minutes = minutes < 10 ? '0' + minutes : minutes

      return hours + ':' + minutes
    },
    msToMinutes(duration) {
      return Math.round(duration / (1000 * 60))
    }
  }
}
</script>

<style lang="scss">
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
  width: 100%;

  &__options {
    // max-height: 200px;
  }
}
</style>
