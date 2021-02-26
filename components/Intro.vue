<template lang="pug">
  .intro
    .header-wrapper
      h1 Whooper
      h2 A tool for exploring relationships in large data sets 
      p Generate an interactive graph out of a spreadsheet, CSV file, and/or Whoop fitness tracker data. You can use any combination of the below options.
    .menu-wrapper
      InputMenu(:compact="false")
      v-btn(
        color='primary'
        @click="setSampleData"
      ) Just use sample data
    v-btn.intro__table-cta(
      color='primary'
      v-if="showTableCTA"
      @click="showTable"
      large
    ) Continue to Data Table >

</template>

<script>
import { mapState } from 'vuex'

import Pages from '../pages'
import sampleTableData from '../assets/js/sampleTableData'

import InputMenu from './InputMenu'

export default {
  name: 'Intro',
  components: {
    InputMenu
  },
  data() {
    return {}
  },
  computed: {
    ...mapState({
      accentColor: (state) => state.accentColor,
      accentColorDark: (state) => state.accentColorDark,
      page: (state) => state.page,
      inputData: (state) => state.inputData,
      whoopEmail: (state) => state.whoopEmail
    }),
    showTableCTA() {
      return (
        (this.inputData && this.inputData.length) ||
        (this.whoopEmail && this.whoopEmail.length)
      )
    }
  },
  methods: {
    setSampleData() {
      // format the user-friendly sample data into the way actual input gets formatted
      // sort of a csv array of arrays, where arr[0] contains the headers and the preceeding arrays have data at corresponding indexes
      // so that the sample data is easy to edit and doesn't require special cases in the logic
      const headerFormatHeaders = Object.keys(sampleTableData[0])
      const headerFormatData = sampleTableData.map((itm) => Object.values(itm))
      console.log('sample', [headerFormatHeaders, ...headerFormatData])
      this.$store.commit('setInputData', [
        headerFormatHeaders,
        ...headerFormatData
      ])
    },
    showTable() {
      this.$store.commit('setPage', Pages.INPUT_TABLE)
    }
  }
}
</script>

<style lang="scss" scoped>
.intro {
  &__table-cta {
    margin-top: 30px;
  }

  .header-wrapper {
    margin: 40px 0 60px;
    max-width: 600px;
  }

  .menu-wrapper {
    background: $bg-secondary;
    padding: 30px;
  }
}
</style>
