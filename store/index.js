import Pages from '../pages'
import Colors from '../colors'

export const state = () => ({
  correlationData: [],
  test: '',
  page: Pages.INPUT_TABLE,
  ...Colors,
  whoopEmail: '',
  whoopAuthToken: '',
  whoopID: '',
  whoopCreatedAt: '',
  whoopData: [],
  inputData: []
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
  setWhoopAuthData(state, data) {
    const { whoopEmail, whoopAuthToken, whoopID, whoopCreatedAt } = data
    state.whoopEmail = whoopEmail
    state.whoopAuthToken = whoopAuthToken
    state.whoopID = whoopID
    state.whoopCreatedAt = whoopCreatedAt
  },
  setWhoopRawData(state, data) {
    state.whoopData = data
  },
  setInputData(state, data) {
    state.inputData = data
  }
}
