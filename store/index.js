import Pages from "../pages"

export const state = () => ({
  correlationData: {},
  test: '',
  accentColor: 'red darken-3',
  accentColorDark: 'red darken-10',
  accentColorLite: 'red lighten-4',
  page: Pages.INPUT_TABLE
})

export const mutations = {
  setCorrelationData(state, data) {
    state.correlationData = data
  },
  setTest(state, data) {
    state.test = data
  },
  setPage(state, data) {
    state.page = data
  },

}