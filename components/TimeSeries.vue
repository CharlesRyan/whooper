<template lang="pug">
  .time-series
    v-sparkline(
      v-for="(item, i) in activeItems"
      :value="item.data"
      :key="item.key"
      :color="item.color"
      padding="24"
      stroke-linecap="round"
      :line-width="lineWidth"
      smooth
    )
      template(v-slot:label="item") {{ item.key }}
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'

import Footer from './Footer'

export default {
  name: 'TimeSeries',
  components: {
    Footer
  },
  props: {},
  data() {
    return {
      lineWidth: 0.5
    }
  },
  mounted() {
    this.addActiveAttribute()
    this.replaceNullValues()
    this.setItemColors()
  },
  computed: {
    ...mapState({
      accentColor: (state) => state.accentColor,
      accentColorDark: (state) => state.accentColorDark,
      accentColorLite: (state) => state.accentColorLite,
      correlationData: (state) => state.correlationData,
      whoopData: (state) => state.whoopData
    }),
    activeItems() {
      return this.whoopData.filter((item) => item.active && item.key !== 'day')
    }
  },
  methods: {
    addActiveAttribute() {
      const newData = this.whoopData.map((item) => {
        return {
          ...item,
          active: true
        }
      })
      this.$store.commit('setWhoopRawData', newData)
    },
    replaceNullValues() {
      const newItems = this.whoopData.map((item) => {
        const data = item.data.map((dataPoint) =>
          dataPoint === null ? 0 : dataPoint
        )
        return {
          ...item,
          data
        }
      })
      this.$store.commit('setWhoopRawData', newItems)
    },
    setItemColors() {
      const newItems = this.whoopData.map((item) => {
        return {
          ...item,
          color: this.getRandomColor()
        }
      })
      this.$store.commit('setWhoopRawData', newItems)
    },
    getRandomColor() {
      const alpha = 1
      let r = Math.max(100, Math.random() * 255)
      let g = Math.max(100, Math.random() * 255)
      let b = Math.max(100, Math.random() * 255)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
  }
}
</script>

<style lang="scss">
.time-series {
  width: 100vw;
  height: 100vw;
  position: relative;

  svg {
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
