<template lang="pug">
  .intro
    h1 Whooper
    h2 Explore relationships in large data sets with an interactive graph
    InputMenu(:shortLabels="false")
    v-btn(
      @click="() => handleClick('INPUT_TABLE')"
    ) Use sample data
</template>

<script>
import { mapState } from 'vuex'

import Pages from '../pages'

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
      page: (state) => state.page
    }),
  },
  methods: {
    handleClick(key) {
      this.$store.commit('setPage', Pages[key])
    }
  }
}
</script>

<style lang="scss" scoped>
.intro {

}
</style>
