<template lang="pug">
.inputs(
    :class="isModal ? 'is-modal' : 'embedded'"
  )
  .inputs__options
    //- .inputs__overwrite-wrap(v-if="isModal" mandatory)
    //-   v-radio-group(v-model="shouldOverwrite" light)
    //-     v-radio(label="Add new data to current data" :value='false')
    //-     v-radio(label="Replace current data with new data" :value='true')

    //- hr(v-if="isModal")

    h3.inputs__options-label {{ labels.file }}
    p(v-if="isModal") (Will replace all non-Whoop data)*
    label.file 
      input.file-input(
        type='file'
        @change="selectedFile"
      )
      span.file-custom

    hr

    h3.inputs__options-label {{ labels.text }}
    input.text-input(
      type='textarea'
      @paste="onPaste"
      placeholder="Paste here"
    )

    hr

    h3.inputs__options-label Connect your Whoop account
    WhoopLogin(
      :ctaText="whoopLabel"
    )

    hr(v-if="!isModal")

    .feedback 
      .error(
        v-if="dataError.length"
      )
      .success(
        v-if="rowCount && colCount"
      ) 
        p {{rowCount}} rows and {{colCount}} columns processed



</template>

<script>
import { mapState } from 'vuex'
import Papa from 'papaparse'

import mergeData from '../helpers/mergeData'

import WhoopLogin from './WhoopLogin'

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
      colCount: 0,
      shouldOverwrite: false
    }
  },
  mounted() {},
  computed: {
    ...mapState({
      inputData: (state) => state.inputData
    }),
    labels() {
      const file = 'Upload a file (tsv/csv)'
      const text = 'Paste cells from a spreadsheet or tsv/csv formatted text'

      return {
        file,
        text
      }
    },
    whoopLabel() {
      return 'Log In'
    }
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
      try {
        const results = Papa.parse(input)
        console.log('parseInput results', results)
        const newInputData = this.shouldOverwrite
          ? results.data
          : mergeData(this.inputData, results.data)

        this.$store.commit('setInputData', newInputData)
        // display row/col count
        this.colCount = results.data[0].length
        this.rowCount = results.data.length
      } catch (e) {
        console.log(e)
        this.dataError = e
      }
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
  position: relative;

  // input table modal
  &.is-modal {
    background-color: #fff;
    color: $bg;
    padding: 40px 20px 50px;

    input.text-input {
      border: 0.075rem solid #ddd;
    }
  }

  &.embedded {
    margin: 0;
  }

  &__overwrite-wrap {
    display: flex;
    align-items: center;

    ::v-deep .v-label {
      color: $bg !important;
    }
  }

  hr {
    width: 100%;
    margin: 30px 0;
    opacity: 0.5;
  }

  .disclaimer {
    position: absolute;
    bottom: 12px;
    left: 0;
    padding: 0 10px;
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
