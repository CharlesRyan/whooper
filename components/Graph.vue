<template lang="pug">
  v-app
    .graph
      //- v-expansion-panels.my-10
      //-       v-expansion-panel
      //-         v-expansion-panel-header Show/Hide Nodes
      //-         v-expansion-panel-content
      //-           v-row.flex-row.flex-wrap.graph__node-toggles(
      //-             justify="space-around"
      //-             align="center"
      //-           )
      //-             //- v-col.col-12(
      //-             v-col.col-12.col-xs-12.col-sm-12.col-md-4.col-lg-2(
      //-               v-for="node in allNodes"
      //-               :key="node.name"
      //-             )
      //-               v-switch(
      //-                 :label="node.name"
      //-                 v-model="node.active"
      //-               )
      d3-network(
        v-if='showGraph'
        :class="['graph__network', {active: showGraph}]"
        :net-nodes='currentNodes'
        :net-links='currentLinks'
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
  props: {},
  data() {
    return {
      correlations: [],
      allLinks: [],
      allNodes: [],
      nodesWithLinks: []
    }
  },
  async mounted() {
    this.loading = false
    await this.getSampleData()
    this.buildLinks()
    this.buildNodes()
  },
  computed: {
    showGraph() {
      return !!(
        this.correlations.length &&
        this.allNodes.length &&
        this.allLinks.length
      )
    },
    currentLinks() {
      return this.allLinks
    },
    currentNodes() {
      return this.allNodes
    },
    graphOptions() {
      // example had 3000
      const nodeMultiple = this.currentNodes.length * 200
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
    buildLinks() {
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






          const notSameItem = key !== corr.name || true







          if (notNull && notSameItem && isSignificant && !tableHasKey) {
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

            this.allLinks.push(link)

            linkTable[corr.name][key] = true
            this.nodesWithLinks.push(key)
          }
        })
      })
    },
    buildNodes() {
      this.allNodes = Array.from(new Set(this.nodesWithLinks)).map((node) => {
        return {
          id: node,
          name: node,
          active: true
        }
      })
    },
    getSampleData() {
      //  parse correlations into an array of objects
      // {name: '', data: {} }
      this.correlations = Object.keys(rawCorrelations).map((key) => {
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
