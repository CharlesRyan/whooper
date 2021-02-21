<template lang="pug">
.inputs(
    :class="compact ? 'compact' : 'efflusive'"
  )
  .inputs__options(
    :class="{compact}"
  )
    h3.inputs__options-label {{ labels.file }}
    label.file 
      input.file-input(
        type='file'
        @change="selectedFile"
      )
      span.file-custom

    hr(v-if="!compact")

    h3.inputs__options-label {{ labels.text }}
    input.text-input(
      type='textarea'
      @paste="onPaste"
      placeholder="Paste here"
    )

    hr(v-if="!compact")

    h3.inputs__options-label Connect your Whoop account
    WhoopLogin(
      ctaText="Log In"
    )

    hr(v-if="!compact")

    .feedback 
      .error(
        v-if="dataError.length"
      )
      .success(
        v-if="rowCount && colCount"
      ) 
        p I parsed out {{rowCount}} rows and {{colCount}} columns
        v-btn(
          @click="showGraph"
        )



</template>

<script>
import { mapState } from 'vuex'
import Papa from 'papaparse'

import WhoopLogin from './WhoopLogin'

import Pages from '../pages'

export default {
  name: 'InputMenu',
  components: {
    WhoopLogin
  },
  props: {
    isModal: Boolean,
    compact: Boolean
  },
  data() {
    return {
      dataError: '',
      rowCount: 0,
      colCount: 0
    }
  },
  mounted() {},
  computed: {
    ...mapState({
      inputData: (state) => state.inputData
    }),
    labels() {
      const file = this.compact ? 'Upload' : 'Upload a file (tsv/csv)'
      const text = this.compact
        ? 'Paste'
        : 'Paste cells from a spreadsheet or tsv/csv formatted text'
      return {
        file,
        text
      }
    }
  },
  methods: {
    showGraph() {},
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
      try {
        const results = Papa.parse(input)
        console.log(results)
        this.$store.commit('setInputData', results.data)
        // display row/col count
        this.colCount = results.data[0].length
        this.rowCount = results.data.length
      } catch (e) {
        console.log(e)
        this.dataError = e
      }
    },
    toggleDrawer() {
      this.drawerOpen = !this.drawerOpen
      if (!this.drawerOpen) this.activeInput = ''
    },
    showInput(name) {
      this.activeInput = name
    }
  }
}
</script>

<style lang="scss" scoped>
$transition: all 0.3s ease-in-out;

.inputs {
  margin: 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;

&.efflusive {
  margin: 0;
}

  hr {
    width: 100%;
    margin: 30px 0;
    opacity: .5;
  }

  &__modal {
    overflow: hidden;
    display: flex;
  }

  &__modal-toggle {
    z-index: 4;

    span {
      transition: $transition;
    }

    &.open {
      span {
        transform: rotate(540deg);
      }
    }
  }

  &__options-label {
    margin-bottom: 8px;
  }

  &__options {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    input {
      width: 275px;

      &.text-input {
        padding: 8px 16px;
        background-color: #fff;
        color: initial;
        border-radius: 4px;
      }
    }
  }

  .drawer-item {
    background-color: #272727;
  }

  // wtf forms file input
  .file {
    position: relative;
    display: inline-block;
    cursor: pointer;
    height: 2.5rem;
  }

  .file input {
    min-width: 14rem;
    margin: 0;
    filter: alpha(opacity=0);
    opacity: 0;
  }

  .file-custom {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 5;
    height: 2.5rem;
    padding: 0.5rem 1rem;
    line-height: 1.5;
    color: #555;
    background-color: #fff;
    border: 0.075rem solid #ddd;
    border-radius: 4px;
    box-shadow: inset 0 0.2rem 0.4rem rgba(0, 0, 0, 0.05);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    text-align: left;
  }

  .file-custom:after {
    content: 'Choose file...';
  }

  .file-custom:before {
    position: absolute;
    top: -0.075rem;
    right: -0.075rem;
    bottom: -0.075rem;
    z-index: 6;
    display: block;
    content: 'Browse';
    height: 2.5rem;
    padding: 0.5rem 1rem;
    line-height: 1.5;
    color: #fff;
    background-color: #2196f3;
    // border: 0.075rem solid #ddd;
    border-radius: 0 4px 4px 0;
  }

  /* Focus */
  .file input:focus ~ .file-custom {
    box-shadow: 0 0 0 0.075rem #fff, 0 0 0 0.2rem #0074d9;
  }
  // end wtf forms file input
}

.text-input {
  border: 1px solid white;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: $transition;
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(-100%);
}

.slide-fade-enter {
  z-index: 2;
}

.slide-fade-leave-to {
  z-index: 1;
}

input.slide-fade-leave-active {
  transition: none;
  opacity: 0;
}
</style>
