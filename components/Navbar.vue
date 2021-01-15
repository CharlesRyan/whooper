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
            :class="{disabled: item.disabled}"
            @click.stop="handleClick(item)"
          )
            v-list-item-title {{ item.name }}

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
      page: (state) => state.page,
      inputData: (state) => state.inputData,
      correlationData: (state) => state.correlationData,
    }),
    pageItems() {
      return Object.keys(Pages).map((k) => {
        const disabled = Pages[k] === Pages.GRAPH && !(this.inputData.length || this.correlationData.length)

        return {
          key: k,
          name: Pages[k],
          disabled
        }
      })
    }
  },
  methods: {
    handleClick({ disabled, key }) {
      if (!disabled) {
        this.$store.commit('setPage', Pages[key])
      } else {
        setTimeout(() => {
          this.selectPageItem(this.page)
        }, 10)
      }
    },
    selectPageItem(page) {
      this.pageItems.forEach((pageItem, i) => {
        if (pageItem.name === page) {
          this.selectedItem = i
        }
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

    &--active:not(.disabled) {
      color: $primary;
    }

    &.disabled {
      opacity: 0.5;
      cursor: default;
    }
  }
}
</style>
