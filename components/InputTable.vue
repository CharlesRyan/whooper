<template lang="pug">
  v-app
    .input-table
      input.main-input(
        type='text'
        @paste='onPaste'
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
        
    
    Footer

</template>

<script>
import axios from 'axios'

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
      // sample data
      dialog: false,
      dialogDelete: false,
      tableRows: [],
      editedIndex: -1,
      editedItem: {}
    }
  },
  mounted() {
    this.initialize()
    this.loading = false
    // this.hitAPI()
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
    onPaste(e) {
      this.loading = true
      if (!e.clipboardData || !e.clipboardData.items) return
      const { items } = e.clipboardData
      const data = Array.from(items).find((itm) => itm.type === 'text/plain')
      if (!data) return

      data.getAsString((text) => {
        text = text.replace(/\r/g, '').trim('\n')
        const rowsOfText = text.split('\n')
        let header = []
        const rows = []

        rowsOfText.forEach((rowAsText) => {
          // Remove wrapping double quotes
          const row = rowAsText.split('\t').map((colAsText) => {
            return colAsText.trim().replace(/^"(.*)"$/, '$1')
          })
          // The first row containing data is assumed to be the header
          if (header.length == 0) {
            // Remove empty columns
            while (row.length && !row[row.length - 1].trim()) row.pop()
            if (row.length == 0) return
            header = row
          } else {
            rows.push(row.slice(0, header.length))
          }
        })
        this.buildTableRows(header, rows)
        this.loading = true
      })
    },
    buildTableRows(header, rows) {
      // TODO: refactor for efficiency
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
}

.main-input {
  border: 1px solid black;
  margin: 20px;
}
</style>
