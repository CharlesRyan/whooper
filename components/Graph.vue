<template lang="pug">
  v-app
    .graph
      v-expansion-panels.my-10(
          inset
          :class="{active: panelOpen}"
        )
        v-expansion-panel
          v-expansion-panel-header(
            @click="panelToggle"
          ) Show/Hide Nodes
          v-expansion-panel-content
            v-row.flex-row.flex-wrap.graph__node-toggles(
              justify="space-around"
              align="center"
            )
              //- v-col.col-12(
              v-col.col-12.col-xs-12.col-sm-12.col-md-4.col-lg-2(
                v-for="node in allNodes"
                :key="node.name"
              )
                v-switch(
                  :label="node.name"
                  v-model="node.active"
                )
      .graph__network-wrap(

      )
        d3-network(
          v-if='showGraph'
          :class="['graph__network', {active: showGraph}]"
          :net-nodes='currentNodes'
          :net-links='currentLinks'
          :options='graphOptions'
          @node-click='handleNodeClick'
        )
      
    
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
      nodesWithLinks: [],
      panelOpen: false
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
      // return this.allLinks
      return this.allLinks.filter((link) => {
        if (link.source && link.target) {
          return link.source.active && link.target.active
        } else {
          return true
        }
      })
    },
    currentNodes() {
      // return this.allNodes
      return this.allNodes.filter((node) => node.active)
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
    handleNodeClick(evt, node) {
      console.log('clicked', node)
    },
    buildLinks() {
      const significanceLimit = 0.2
      const maxStrokeWidth = 10
      // lookup table reduces duplicate links  fed into graph component
      const linkTable = {}
      const allLinks = []

      this.correlations.forEach((corr) => {
        linkTable[corr.name] = {}
        const corrData = Object.keys(corr.data)
        let hasLoggedCorrName = false

        corrData.forEach((key) => {
          const tableHasKey =
            linkTable.hasOwnProperty(key) &&
            linkTable[key].hasOwnProperty(corr.name)
          const isSignificant = Math.abs(corr.data[key]) > significanceLimit
          const notNull = !!corr.data[key]
          const notSameItem = corr.name !== key

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

            allLinks.push(link)

            linkTable[corr.name][key] = true
            this.nodesWithLinks.push(key)
          }

          // ensure all useful nodes get rendered
          if (!hasLoggedCorrName && notNull && notSameItem && isSignificant) {
            this.nodesWithLinks.push(corr.name)
            hasLoggedCorrName = true
          }
        })
      })

      this.allLinks = allLinks
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
    panelToggle() {
      this.panelOpen = !this.panelOpen
      // this was firing too early, but could be handy to keep data in sync with component state
      // const activePanel = document.querySelector('.v-expansion-panel--active')
      // this.panelOpen = !!activePanel
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
      transition: all ease 10s;
      opacity: 1;
    }
  }
}

.v-expansion-panels {
  position: absolute;
  top: 20px;
  left: 0px;
  z-index: 10;
  transition: all ease 0.3s;

  &:not(.active) {
    left: 20px;
    max-width: 400px;
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
