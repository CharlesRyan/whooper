<template lang="pug">
  v-app
    .graph
      d3-network(
        v-if='showGraph'
        :class="['graph__network', {active: showGraph}]"
        :net-nodes='usefulNodes'
        :net-links='links'
        :options='graphOptions'
      )
      p(
        v-else
      ) Loading...
      
    
    Footer

</template>

<script>
import Vuetify from 'vuetify'
import axios from 'axios'
import D3Network from 'vue-d3-network'

const rawCorrelations = require('../backend/output/correlations.json')

import Footer from './Footer'

export default {
  name: 'Graph',
  components: {
    Footer,
    D3Network
  },
  vuetify: new Vuetify(),
  props: {
    userData: Array
  },
  data() {
    return {
      correlations: [],
      toggles: [],
      nodesWithLinks: []
    }
  },
  mounted() {
    this.loading = false
    this.getSampleData()
  },
  computed: {
    showGraph() {
      return !!(
        this.correlations.length &&
        this.nodes.length &&
        this.links.length
      )
    },
    nodes() {
      return this.correlations.map((corr) => {
        return {
          id: corr.name,
          name: corr.name
        }
      })
    },
    usefulNodes() {
      return Array.from(new Set(this.nodesWithLinks)).map((node) => {
        return {
          id: node,
          name: node
        }
      })
    },
    links() {
      const allLinks = []
      const significanceLimit = 0.1
      const maxStrokeWidth = 10

      const linkTable = {}

      this.correlations.forEach((corr) => {
        linkTable[corr.name] = {}
        const corrData = Object.keys(corr.data)

        corrData.forEach((key) => {
          const tableHasKey =
            linkTable.hasOwnProperty(key) &&
            linkTable[key].hasOwnProperty(corr.name)
          const isSignificant = Math.abs(corr.data[key]) > significanceLimit
          const notNull = !!corr.data[key]

          if (notNull && isSignificant && !tableHasKey) {
            const color = corr.data[key] > 0 ? 'green' : 'red'
            const strokeWidth = Math.abs(corr.data[key]) * maxStrokeWidth
            const opacity = Math.abs(corr.data[key])

            const link = {
              _color: color,
              sid: corr.name,
              tid: key,
              _svgAttrs: {
                'stroke-width': strokeWidth,
                opacity
              }
            }

            allLinks.push(link)

            linkTable[corr.name][key] = true
            this.nodesWithLinks.push(key)
          }
        })
      })

      return allLinks
    },

    graphOptions() {
      // example had 3000
      const nodeMultiple = this.nodes.length * 200
      const windowMultiple = window.innerWidth * 2
      const force =
        nodeMultiple > windowMultiple ? windowMultiple : nodeMultiple

      return {
        force,
        size: { w: window.innerWidth, h: window.innerHeight - 50 },
        nodeSize: 20,
        nodeLabels: true,
        linkLabels: true,
        canvas: false
      }
    }
  },
  methods: {
    getSampleData() {
      //  parse correlations into an array of objects
      // {name: '', data: {} }
      this.correlations = Object.keys(rawCorrelations).map((key) => {
        this.toggles.push({
          name: key,
          active: true
        })

        return {
          name: key,
          data: rawCorrelations[key]
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.v-application {
  width: 100%;

  &--wrap {
    justify-content: space-between;
  }
}

.graph {
  width: 100%;
  height: 100%;

  &__network {
    opacity: 0;

    &.active {
      transition-delay: 10s;
      transition: all ease 3s;
      opacity: 1;
    }
  }
}

.container {
  margin: 0 auto;
  // min-height: 100vh;
  max-width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  th {
    text-align: center !important;
  }
}
</style>
