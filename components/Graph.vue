<template lang="pug">
  v-app
    .graph
      d3-network(
        v-if='showGraph'
        :net-nodes='nodes'
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
      graphOptions: {
        force: 3000,
        size: { w: window.innerWidth, h: window.innerHeight - 50 },
        nodeSize: 20,
        nodeLabels: true,
        linkLabels: true,
        canvas: false
      }
    }
  },
  mounted() {
    this.loading = false
    this.getSampleData()
  },
  computed: {
    showGraph(){
      return this.correlations.length && this.nodes.length && this.links.length
    },
    nodes() {
      return this.correlations.map((corr) => {
        return {
          id: corr.name,
          name: corr.name
        }
      })
    },
    links() {
      const allLinks = []
      const significanceLimit = 0.1
      const maxStrokeWidth = 10

      this.correlations.forEach((corr) => {
        Object.keys(corr.data).forEach((key) => {
          if (corr.data[key] && Math.abs(corr.data[key]) > significanceLimit) {
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
          }
        })
      })
      return allLinks
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
