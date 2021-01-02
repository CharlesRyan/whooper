import Pages from '../pages'
import Colors from '../colors'

export const state = () => ({
  correlationData: [],
  page: Pages.INTRO,
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
