<template lang="pug">
  .intro
    .header-wrapper
      h1 Whooper
      h2 Explore relationships in large data sets with an interactive graph
    .menu-wrapper
      InputMenu(:compact="false")
      v-btn(
        color='primary'
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

  .header-wrapper {
      margin: 40px 0 60px;
  }

  .menu-wrapper {
    background: $bg-secondary;
    padding: 1px 20px 25px 20px;
  }
}
</style>
