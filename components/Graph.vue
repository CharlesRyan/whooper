<template lang="pug">
  .graph
    v-expansion-panels.my-10
      //- Options
      v-expansion-panel
        v-expansion-panel-header Options
        v-expansion-panel-content.graph__options
          v-divider
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
          v-row.flex-row.flex-wrap.graph__options__picker(
            justify="space-around"
            align="center"
          )
            v-col.col-12
              .graph__options__picker__label
                p Node Picker Mode
                p When selected, clicking a node will hide all other connections
              v-switch(
                label=""
                v-model="nodePickerActive"
                :color="accentColor"
                inset
              )
              .graph__options__picker__list(
                v-if="pickedNodes.length"
              )
                v-chip.ma-1(
                  v-for='node in pickedNodes'
                  :key='node'
                  @click="removePickedNode(node)"
                  close
                  outlined
                ) {{ node }}
      v-expansion-panel
        v-expansion-panel-header Show/Hide Nodes
        v-expansion-panel-content
          v-divider
          v-row.flex-row.graph__node-toggle-buttons.py-5
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
    d3-network(
      v-if='showGraph'
      :class="['graph__network', {active: showGraph},  {'picker-mode': nodePickerActive}]"
      :net-nodes='currentNodes'
      :net-links='currentLinks'
      :options='graphOptions'
      @node-click='handleNodeClick'
    )

</template>

<script>
import D3Network from 'vue-d3-network'
import { mapState } from 'vuex'

import Footer from './Footer'

export default {
  name: 'Graph',
  components: {
    Footer,
    D3Network
  },
  props: {},
  data() {
    return {
      correlations: [],
      allLinks: [],
      allNodes: [],
      nodesWithLinks: [],
      minSignificance: 10,
      showPositiveLinks: true,
      showNegativeLinks: true,
      nodePickerActive: false,
      pickedNodes: []
    }
  },
  async mounted() {
    this.buildLinks()
    this.buildNodes()
    this.loading = false
  },
  computed: {
    ...mapState({
      accentColor: (state) => state.accentColor,
      accentColorDark: (state) => state.accentColorDark,
      accentColorLite: (state) => state.accentColorLite,
      correlationData: (state) => state.correlationData,
      whoopData: (state) => state.whoopData
    }),
    showGraph() {
      return !!(
        this.correlationData.length &&
        this.allNodes.length &&
        this.allLinks.length
      )
    },
    currentLinks() {
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

          return (
            nodesActive && isSignificant && matchesDirection && hasBeenPicked
          )
        } else {
          return true
        }
      })
    },
    currentNodes() {
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
    removePickedNode(node) {
      this.pickedNodes.splice(this.pickedNodes.indexOf(node), 1)
    },
    isPicked(link) {
      if (!this.pickedNodes.length) return false
      return (
        this.pickedNodes.includes(link.tid) ||
        this.pickedNodes.includes(link.sid)
      )
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
      if (this.pickedNodes.includes(node.id)) {
        this.removePickedNode(node.id)
      } else {
        this.pickedNodes.push(node.id)
      }
    },
    buildLinks() {
      const significanceLimit = 0.1
      const maxStrokeWidth = 10
      const opacityFloor = 0.3
      // lookup table reduces duplicate links fed into graph component
      const linkTable = {}
      const allLinks = []

      this.correlationData.forEach((corr) => {
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
            const opacity =
              absoluteSignificance > opacityFloor
                ? absoluteSignificance
                : opacityFloor
            const strokeWidth = significance * maxStrokeWidth

            const link = {
              _color: color,
              sid: corr.name,
              tid: key,
              significance,
              absoluteSignificance,
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
    }
  },
  watch: {
    nodePickerActive: function(newVal, oldVal) {
      if (!newVal) this.pickedNodes = []
    }
  }
}
</script>

<style lang="scss">
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

    &.picker-mode {
      .node {
        cursor: pointer;
      }
    }
  }

  .node-label {
    font-size: 0.9rem;
    letter-spacing: 0.4px;
    fill: #fff;
  }

  .node {
    fill: #cccccc;
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

  &__node-toggle-buttons {
    display: flex;
    justify-content: space-around;
  }

  .v-expansion-panels {
    position: absolute;
    top: 84px;
    left: 20px;
    z-index: 10;
    transition: all ease 0.3s;
    max-width: 400px;
  }

  .v-expansion-panel-content {
    max-height: 75vh;
    overflow-y: auto;
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
