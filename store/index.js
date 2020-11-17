export const state = () => ({
  correlationData: {}
})

export const mutations = {
  setCorrelationData(state, data) {
    state.correlationData = data
  }
}