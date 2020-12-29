<template lang="pug">
.inputs
  h3 Add Data
  .inputs__drawer
    .inputs__options
      a Paste from a spreadsheet, csv, or tsv
      a Upload a file (tsv/csv)
    .inputs__inputs
      input.text-input(
        type='text'
        @paste="onPaste"
      )
      input.file-input(
        type='file'
        @change="selectedFile"
      )

    v-btn.my-10(color='primary' @click='toggleDrawer')  
      span(v-if="drawerOpen") >
      span(v-else) <
</template>

<script>
import { mapState } from 'vuex'
import Papa from 'papaparse'

export default {
  name: 'InputMenu',
  components: {},
  props: {},
  data() {
    return {
      showOptions: false,
      showInputs: false,
      drawerOpen: false
    }
  },
  mounted() {},
  computed: {
    ...mapState({
      inputData: (state) => state.inputData
    })
  },
  methods: {
    selectedFile(e) {
      this.tableLoading = true
      let file = e.target.files[0]
      if (!file) return

      let reader = new FileReader()
      reader.readAsText(file, 'UTF-8')
      reader.onload = (evt) => {
        this.parseInput(evt.target.result)
      }
      reader.onerror = (evt) => {
        console.error(evt)
      }
    },
    onPaste(e) {
      this.tableLoading = true
      if (!e.clipboardData || !e.clipboardData.items) return
      const { items } = e.clipboardData
      const data = Array.from(items).find((itm) => itm.type === 'text/plain')
      if (!data) return
      data.getAsString(this.parseInput)
    },
    parseInput(input) {
      const results = Papa.parse(input)
      this.$store.commit('setInputData', results.data)
    },
    toggleDrawer(){
      this.drawerOpen = !this.drawerOpen
    },
    emitEntry(event, type){
        this.$store.commit('setRawData', {type, event})
    }
  }
}
</script>

<style lang="scss" scoped>
.inputs {
  &__instructions,
  &__inputs {
    display: flex;
    align-items: center;
  }

  &__inputs {
    justify-content: space-between;
  }

  &__instructions {
    justify-content: space-around;
    p {
      max-width: 240px;
      width: 33%;
    }
  }
}

.text-input {
  border: 1px solid white;
  margin: 20px;
}
</style>
