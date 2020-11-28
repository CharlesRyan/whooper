import Pages from "../pages"
import Colors from "../colors"

export const state = () => ({
  correlationData: [],
  test: '',
  page: Pages.INPUT_TABLE,
  ...Colors
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