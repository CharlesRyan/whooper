<template lang="pug">
  .intro
    p Turn data into insightful graphs

</template>

<script>
import { mapState } from 'vuex'

import InputMenu from './InputMenu'

export default {
  name: 'Intro',
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
