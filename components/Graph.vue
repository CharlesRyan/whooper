<template lang="pug">
  v-app
    .graph
      v-expansion-panels.my-10
        v-expansion-panel
          v-expansion-panel-header(
            @click="panelToggle"
          ) Show/Hide Nodes
          v-expansion-panel-content
            v-row.flex-row.graph__node-toggle-buttons()
              v-btn(
                @click='showAllNodes'
                :disabled='allNodes.length === currentNodes.length'
                depressed
                :color="accentColor"
              ) Show All
              v-btn(
                @click='hideAllNodes'
                :disabled='!currentNodes.length'
                depressed        
                :color="accentColor"
              ) Hide All
            v-row.flex-row.flex-wrap.graph__node-toggles(
              justify="space-around"
              align="center"
            )
              v-col(
                v-for="node in allNodes"
                :key="node.name"
              )
                v-switch(
                  :label="node.name"
                  v-model="node.active"
                  :color="accentColor"
                  inset
                )
        //- Options
        v-expansion-panel
          v-expansion-panel-header Options
          v-expansion-panel-content.graph__options
            v-row.flex-row.flex-wrap(
              justify="space-around"
              align="center"
            )
              v-col.col-12
                .graph__options__slider-label
                  p Connection Threshold
                  div
                    p Weak
                    p Strong
                v-slider(
                  v-model="minSignificance"
                  :color="accentColor"
                  :track-color="accentColorDark"
                  max="90"
                  ticks
                )
            v-divider
            v-row.flex-row.flex-wrap.graph__options__direction(
              justify="space-around"
              align="center"
            )
              v-col.col-12
                .graph__options__direction__label
                  p Filter Connections
                  v-switch(
                    label="Positive"
                    v-model="showPositiveLinks"
                    :color="accentColor"
                    inset
                  )
                  v-switch(
                    label="Negative"
                    v-model="showNegativeLinks"
                    :color="accentColor"
                    inset
                  )
            v-divider
            v-row.flex-row.flex-wrap.graph__options__node-picker(
              justify="space-around"
              align="center"
            )
              v-col.col-12
                .graph__options__direction__label
                  p Node Picker Mode
                  p When selected, clicking a node will hide all other connections
                  v-switch(
                    label=""
                    v-model="nodePickerActive"
                    :color="accentColor"
                    inset
                  )
      d3-network(
        v-if='showGraph'
        :class="['graph__network', {active: showGraph}]"
        :net-nodes='currentNodes'
        :net-links='currentLinks'
        :options='graphOptions'
        @node-click='handleNodeClick'
      )
      v-progress-circular(
        v-else
        :value="0"
        size="100"
        class="ml-2"
        :indeterminate="true"
        :color="accentColor"
        class='graph__loader'
      )
    
    Footer

</template>

<script>
import Vuetify from 'vuetify'
import axios from 'axios'
import D3Network from 'vue-d3-network'
import { mapState } from 'vuex'

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
      panelOpen: false,
      minSignificance: 10,
      accentColor: 'red darken-3',
      accentColorDark: 'red darken-10',
      showPositiveLinks: true,
      showNegativeLinks: true,
      nodePickerActive: false,
      pickedNode: ''
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
      const sigLimit = this.minSignificance / 100
      return this.allLinks.filter((link) => {
        if (link.source && link.target) {
          const nodesActive = link.source.active && link.target.active
          const isSignificant = link.absoluteSignificance >= sigLimit
          const matchesDirection =
            (this.showPositiveLinks && link.significance > 0) ||
            (this.showNegativeLinks && link.significance < 0)
          // if picker mode active, check if link should be shown
          const hasBeenPicked = !this.nodePickerActive || this.isPicked(link)

          return nodesActive && isSignificant && matchesDirection && hasBeenPicked
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
    isPicked(link) {
      if (!this.pickedNode.length) return true
      return link.tid === this.pickedNode || link.sid === this.pickedNode
    },
    showAllNodes() {
      this.allNodes.forEach((node) => {
        node.active = true
      })
    },
    hideAllNodes() {
      this.allNodes.forEach((node) => {
        node.active = false
      })
    },
    handleNodeClick(evt, node) {
      if (!this.nodePickerActive) return
      this.pickedNode = node.id
    },
    buildLinks() {
      const significanceLimit = 0.1
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

          const hasData = !!corr.data[key]
          const notSameItem = corr.name !== key

          if (hasData && notSameItem && !tableHasKey) {
            const color = corr.data[key] > 0 ? 'green' : 'red'
            const significance = corr.data[key]
            const absoluteSignificance = Math.abs(corr.data[key])
            const strokeWidth = significance * maxStrokeWidth

            const link = {
              _color: color,
              sid: corr.name,
              tid: key,
              significance,
              absoluteSignificance,
              _svgAttrs: {
                'stroke-width': strokeWidth,
                opacity: absoluteSignificance
              }
            }

            allLinks.push(link)

            linkTable[corr.name][key] = true
            this.nodesWithLinks.push(key)
          }

          // ensure all useful nodes get rendered
          if (!hasLoggedCorrName && hasData && notSameItem) {
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
      this.$store.commit('setCorrelationData', this.correlations)
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

  &__loader {
    position: fixed;
    top: calc(50% - 50px);
    left: calc(50% - 50px);
  }

  &__options {
    &__slider-label {
      font-size: 0.9rem;

      div {
        font-size: 0.7rem;
        display: flex;
        justify-content: space-between;
        padding: 0 5px;
      }
    }
  }

  &__node-toggles {
  }
}

.v-expansion-panels {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  transition: all ease 0.3s;
  max-width: 400px;
}

.v-expansion-panel-content {
  max-height: 75vh;
  overflow-y: auto;
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