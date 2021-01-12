<template lang="pug">
  .navbar
    //- :color="accentColorDark"
    v-app-bar(
        dark
      )
      v-list(
        nav
        dense
        flat
      )
        v-list-item-group(
          v-model="selectedItem"
          active-class="parent-active-class"
        )
          v-list-item(
            v-for="item in pageItems"
            :key="item.name"
            @click.stop="handleClick(item.key)"
          )
            v-list-item-title {{ item.name }}
    //-     v-app-bar-nav-icon( @click.stop="drawer = !drawer")
    //- v-navigation-drawer(
    //-   v-model="drawer"
    //-   absolute
    //-   bottom
    //-   temporary
    //- )


</template>

<script>
import { mapState } from 'vuex'
import Pages from '../pages'

export default {
  name: 'Navbar',
  data() {
    return {
      drawer: false,
      selectedItem: 0
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
    },
    selectPageItem(page) {
      this.pageItems.forEach((pageItem, i) => {
        if (pageItem.key === page) this.selectedItem = i
      })
    }
  },
  mounted() {
    this.selectPageItem(this.page)
  },
  watch: {
    page(newPage) {
      this.selectPageItem(newPage)
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

  .v-list {
    background: $bg-secondary;
  }

  .v-list-item-group {
    display: flex;
  }

  .v-list-item {
    margin: 0 20px !important;

    &--active {
      color: $primary;
    }
  }
}
</style>
