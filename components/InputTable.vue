<template lang="pug">
  v-app
    .input-table
      input.main-input(
        type='text'
        @paste='onPaste'
      )
      v-data-table.elevation-1(:headers='headers' :items='tableRows' sort-by='calories')
        template(v-slot:top)
          v-toolbar(flat)
            v-toolbar-title My CRUD
            v-divider.mx-4(inset vertical)
            v-spacer
            v-dialog(v-model='dialog' max-width='500px')
              template(v-slot:activator='{ on, attrs }')
                v-btn.mb-2(color='primary' dark v-bind='attrs' v-on='on') New Row
              v-card
                v-card-title
                  span.headline {{ formTitle }}
                v-card-text
                  v-container
                    v-row
                      v-col(cols='12' sm='6' md='4' v-for="key in Object.keys(editedItem)" :key='key')
                        v-text-field(v-model='editedItem[key]' :label='key | capitalize')
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
    
    
    .footer.mb-2
      p Built with 
      img(src="https://nuxtjs.org/logos/nuxt-icon.png")
      p by
      a(href="https://charlesryan.dev") Charles

</template>

<script>
import Vuetify from 'vuetify'

export default {
  name: 'InputTable',
  components: {},
  vuetify: new Vuetify(),
  props: {
    userData: Array
  },
  data() {
    return {
      singleSelect: false,
      loading: false,
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
    }
  },
  methods: {
    onPaste(e) {
      this.loading = true
      console.log(e)
      if (!e.clipboardData || !e.clipboardData.items) return
      const items = e.clipboardData.items
      let data
      for (let i = 0; i < items.length; i++) {
        if (items[i].type == 'text/plain') {
          data = items[i]
          break
        }
      }
      if (!data) return
      data.getAsString((text) => {
        text = text.replace(/\r/g, '').trim('\n')
        const rowsOfText = text.split('\n')
        let header = []
        const rows = []
        console.log(rowsOfText)
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
      })
    },
    buildTableRows(header, rows) {
      // TODO: refactor for efficiency
      const newRows = rows.map((row, rowIdx) => {
        const rowObj = {}
        header.forEach((headItm, headIdx) => {
          rowObj[headItm] = row[headIdx]
        })
        return rowObj
      })

      this.tableRows = newRows
    },
    initialize() {
      this.tableRows = [
        {
          name: 'Frozen Yogurt',
          calories: 159,
          fat: 6.0,
          carbs: 24,
          protein: 4.0
        },
        {
          name: 'Ice cream sandwich',
          calories: 237,
          fat: 9.0,
          carbs: 37,
          protein: 4.3
        },
        {
          name: 'Eclair',
          calories: 262,
          fat: 16.0,
          carbs: 23,
          protein: 6.0
        },
        {
          name: 'Cupcake',
          calories: 305,
          fat: 3.7,
          carbs: 67,
          protein: 4.3
        },
        {
          name: 'Gingerbread',
          calories: 356,
          fat: 16.0,
          carbs: 49,
          protein: 3.9
        },
        {
          name: 'Jelly bean',
          calories: 375,
          fat: 0.0,
          carbs: 94,
          protein: 0.0
        },
        {
          name: 'Lollipop',
          calories: 392,
          fat: 0.2,
          carbs: 98,
          protein: 0
        },
        {
          name: 'Honeycomb',
          calories: 408,
          fat: 3.2,
          carbs: 87,
          protein: 6.5
        },
        {
          name: 'Donut',
          calories: 452,
          fat: 25.0,
          carbs: 51,
          protein: 4.9
        },
        {
          name: 'KitKat',
          calories: 518,
          fat: 26.0,
          carbs: 65,
          protein: 7
        }
      ]
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

<style lang="scss">
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
