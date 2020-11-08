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
      rawHeaders: []
    }
  },
  mounted() {
    this.loading = false
  },
  computed: {
  },
  methods: {
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
