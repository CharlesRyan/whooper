<template lang="pug">
  v-app
    .input-table
      .input-table__input-wrap
        .input-table__instructions
          p Simply copy and paste values from a spreadsheet/csv file
          p OR
          p Upload the file itself
        .input-table__inputs
          input.text-input(
            type='text'
            @paste='onPaste'
          )
          input.file-input(
            type='file'
            @change="selectedFile"
          )
      v-data-table.elevation-1(:headers='headers' :items='tableRows' :loading='loading')
        template(v-slot:top)
          v-toolbar(flat)
            v-toolbar-title Data Input
            v-divider.mx-4(inset vertical)
            v-spacer
            v-dialog(v-model='dialog' max-width='500px')
              template(v-slot:activator='{ on, attrs }')
                v-btn.mb-2(color='primary' v-bind='attrs' v-on='on') New Row
              v-card
                v-card-title
                  span.headline {{ formTitle }}
                v-card-text
                  v-container
                    v-row
                      v-col(cols='12' sm='6' md='4' v-for="key in Object.keys(editedItem)" :key='key')
                        v-checkbox(v-if="isBool(editedItem[key])" v-model='editedItem[key]' :label='key | capitalize')
                        v-text-field(v-else v-model='editedItem[key]' :label='key | capitalize')
                v-card-actions
                  v-spacer
                  v-btn(color='blue darken-1' text='' @click='close') Cancel
                  v-btn(color='blue darken-1' text='' @click='save') Save
            v-dialog(v-model='dialogDelete' max-width='500px')
              v-card
                v-card-title.headline Are you sure you want to delete this item?
                v-card-actions
                  v-spacer
                  v-btn(color='blue darken-1' text='' @click='closeDelete') Cancel
                  v-btn(color='blue darken-1' text='' @click='deleteItemConfirm') OK
                  v-spacer
        template(v-slot:item.actions='{ item }')
          v-icon.mr-2(small @click='editItem(item)') mdi-pencil
          v-icon(small='' @click='deleteItem(item)') mdi-delete
        template(v-slot:no-data)
          v-btn(color='primary' @click='initialize') Reset
      v-btn(color='primary' @click='analyze') Run Analysis
        
    v-snackbar(
      v-model="colSnackbar"
      timeout="-1"
      :class="{'stacked-snack': rowSnackbar}"
    ) Columns are limited to a maximum of {{ dataLimit }}
      template(
        v-slot:action="{ attrs }"
      )
        v-btn(
          color="primary"
          text
          v-bind="attrs"
          @click="colSnackbar = false"
        ) Close
    v-snackbar(
      v-model="rowSnackbar"
      timeout="-1"
    ) Rows are limited to a maximum of {{ dataLimit }}
      template(
        v-slot:action="{ attrs }"
      )
        v-btn(
          color="primary"
          text
          v-bind="attrs"
          @click="rowSnackbar = false"
        ) Close
    
    Footer

</template>

<script>
import axios from 'axios'
import Papa from 'papaparse'

import sampleTableData from '../assets/js/sampleTableData'
import Footer from './Footer'

export default {
  name: 'InputTable',
  components: {
    Footer
  },
  props: {
    userData: Array
  },
  data() {
    return {
      singleSelect: false,
      loading: true,
      selected: [],
      rawHeaders: [],
      inputHeaders: [],
      inputRows: [],
      dialog: false,
      dialogDelete: false,
      tableRows: [],
      editedIndex: -1,
      editedItem: {},
      dataLimit: 10000,
      colSnackbar: false,
      rowSnackbar: false
    }
  },
  mounted() {
    this.initialize()
    this.loading = false
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
    },
    headers() {
      if (!this.tableRows.length) return []
      const headerItems = Object.keys(this.tableRows[0]).map((key) => {
        return {
          text: this.$options.filters.capitalize(key),
          value: key
        }
      })

      headerItems.push({ text: 'Actions', value: 'actions', sortable: false })
      return headerItems
    },
    formattedData() {
      const headers = Object.keys(this.tableRows[0])
      const values = this.tableRows.map((row) => Object.values(row))
      return [headers, ...values]
    }
  },
  methods: {
    isBool(item) {
      return typeof item === 'boolean'
    },
    async hitAPI() {
      const url =
        'https://mjlck5n8ke.execute-api.us-west-1.amazonaws.com/whooper'
      try {
        const response = await axios.get(url)
        console.log('response', response)
      } catch (e) {
        console.log('data error', e)
      }
    },
    analyze() {},
    selectedFile(e) {
      this.loading = true
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
      this.loading = true
      if (!e.clipboardData || !e.clipboardData.items) return
      const { items } = e.clipboardData
      const data = Array.from(items).find((itm) => itm.type === 'text/plain')
      if (!data) return
      data.getAsString(this.parseInput)

      // const {header, rows} = this.parseTSVInput(data)
    },
    parseInput(input) {
      const results = Papa.parse(input)
      this.buildTableRows(results.data[0], results.data.slice(1))
    },
    buildTableRows(header, rows) {
      // size limiting
      if (header.length > this.dataLimit) {
        header = header.slice(0, this.dataLimit)
        rows = rows.map((row) => row.slice(0, this.dataLimit))
        this.colSnackbar = true
      }

      if (rows.length > this.dataLimit) {
        rows = rows.slice(0, this.dataLimit)
        this.rowSnackbar = true
      }

      const newRows = rows.map((row, rowIdx) => {
        const rowObj = {}
        header.forEach((headItm, headIdx) => {
          rowObj[headItm] = row[headIdx]
        })

        Object.keys(rowObj).forEach((key) => {
          if (rowObj[key] === 'TRUE') rowObj[key] = true
          if (rowObj[key] === 'FALSE') rowObj[key] = false
        })

        return rowObj
      })

      this.tableRows = newRows
      this.loading = false
    },
    initialize() {
      this.tableRows = sampleTableData
      this.setEditedItem({})
    },

    editItem(item) {
      this.editedIndex = this.tableRows.indexOf(item)
      this.setEditedItem(item)
      this.dialog = true
    },

    deleteItem(item) {
      this.editedIndex = this.tableRows.indexOf(item)
      this.setEditedItem(item)
      this.dialogDelete = true
    },

    deleteItemConfirm() {
      this.tableRows.splice(this.editedIndex, 1)
      this.closeDelete()
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.setEditedItem({})
        this.editedIndex = -1
      })
    },

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.setEditedItem({})
        this.editedIndex = -1
      })
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.tableRows[this.editedIndex], this.editedItem)
      } else {
        this.tableRows.push(this.editedItem)
      }
      this.close()
    },

    setEditedItem(item) {
      const itemKeys = Object.keys(item)
      if (itemKeys.length === 0) {
        // initialize item to default values of the keys present on table data
        const defaultKeys = this.tableRows[0]
          ? Object.keys(this.tableRows[0])
          : []
        defaultKeys.forEach((key) => {
          this.$set(this.editedItem, key, '')
        })
      } else {
        // set it to the values passed in
        itemKeys.forEach((key) => {
          this.$set(this.editedItem, key, item[key])
        })
      }
    }
  },
  watch: {
    dialog(val) {
      val || this.close()
    },
    dialogDelete(val) {
      val || this.closeDelete()
    }
  },
  filters: {
    capitalize: function(value) {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
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

.input-table {
  max-width: 95vw;
  overflow-x: scroll;

  .v-data-table__wrapper {
    overflow-x: scroll;
  }

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

.v-snack {
  top: -50px;

  &.stacked-snack {
    top: -100px;
    bottom: auto;
  }
}

.text-input {
  border: 1px solid white;
  margin: 20px;
}
</style>
