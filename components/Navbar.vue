<template lang="pug">
  .navbar
    //- :color="accentColorDark"
    v-app-bar(
        dark
      )
        v-app-bar-nav-icon( @click.stop="drawer = !drawer")
    v-navigation-drawer(
      v-model="drawer"
      absolute
      bottom
      temporary
    )
      v-list(
        nav
        dense
      )
        v-list-item-group(
          v-model="group"
          active-class="parent-active-class"
        )
          v-list-item(
            v-for="item in pageItems"
            :key="item.name"
            @click.stop="handleClick(item.key)"
            :class="{'active v-list-item--active': item.name === page}"
          )
            v-list-item-title {{ item.name }}


</template>

<script>
import { mapState } from 'vuex'
import Pages from '../pages'

export default {
  name: 'Loader',
  data() {
    return {
      drawer: false,
      group: false
    }
  },
  computed: {
    ...mapState({
      accentColor: (state) => state.accentColor,
      accentColorDark: (state) => state.accentColorDark,
      page: (state) => state.page
    }),
    pageItems() {
      return Object.keys(Pages).map((k) => {
        return {
          key: k,
          name: Pages[k]
        }
      })
    }
  },
  methods: {
    handleClick(key) {
      this.$store.commit('setPage', Pages[key])
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;

  .v-navigation-drawer--open {
    height: auto !important;
    top: 64px !important;
  }
}
</style>
