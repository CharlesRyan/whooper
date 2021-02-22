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
    return {
    }
  },
  computed: {
    ...mapState({
      accentColor: (state) => state.accentColor,
      accentColorDark: (state) => state.accentColorDark,
      page: (state) => state.page,
      inputData: (state) => state.inputData,
      whoopEmail: (state) => state.whoopEmail,
    }),
    showTableCTA(){
      return (this.inputData && this.inputData.length) || (this.whoopEmail && this.whoopEmail.length)
    }
  },
  methods: {
    setSampleData() {
        this.$store.commit('setInputData', sampleTableData)
    },
    showTable(){
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
