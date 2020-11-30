import Pages from '../pages'
import Colors from '../colors'

export const state = () => ({
  correlationData: [],
  test: '',
  page: Pages.INPUT_TABLE,
  ...Colors,
  whoopEmail: '',
  whoopAuthToken: '',
  whoopID: ''
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
  setWhoopData(state, data) {
    const { whoopEmail, whoopAuthToken, whoopID } = data
    state.whoopEmail = whoopEmail
    state.whoopAuthToken = whoopAuthToken
    state.whoopID = whoopID
  }
}
