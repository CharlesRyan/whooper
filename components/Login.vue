<template lang="pug">
  v-app.login
    v-form(v-model="valid" @submit.prevent="fetchUserData")
      v-container
        v-row
          v-col()
            v-text-field(
              v-model="username"
              label="Whoop Account Email"
              :rules="usernameRules"
              type="email"
              required
            )
            v-text-field(
              v-model="password"
              label="Password"
              :rules="passwordRules"
              type="password"
              required
            )
            v-row.mb-4(
              justify="center"
            )
              v-btn(
                :disabled="!valid"
                type="submit"
              ) Fetch Whoop Data
            v-row(
              justify="center"
            )
              v-btn(
                @click="useSampleData"
              ) Use Sample Data


</template>

<script>
import Vuetify from 'vuetify'
import axios from 'axios'

import sampleData from '../assets/staticData'

export default {
  components: {},
  vuetify: new Vuetify(),
  data() {
    return {
      username: '',
      password: '',
      accessToken: '',
      userId: '',
      valid: false,
      usernameRules: [(v) => !!v || 'Email is required'],
      passwordRules: [(v) => !!v || 'Password is required']
    }
  },
  mounted() {},
  computed: {},
  methods: {
    useSampleData() {
      this.$emit('setData', sampleData)
    },
    async fetchUserData() {
      const authResponse = await this.authenticate()
      console.log('fud', authResponse)
      const userData = await this.getData(authResponse.user.id, authResponse.access_token)
      console.log('fud', userData)
      this.$emit('setData', userData)
    },
    async getData(id, token) {
      const url = `https://api-7.whoop.com/users/${id}/cycles`

      const params = {
        start: '2000-01-01T00:00:00.000Z',
        end: '2030-01-01T00:00:00.000Z'
      }

      const headers = {
        Authorization: `bearer ${token}`
      }

      try {
        const response = await axios.get(url, { params, headers })
        console.log('response', response)
        return response.data
      } catch (e) {
        console.log('data error', e)
        return null
      }
    },
    async authenticate() {
      const authRequestData = {
        grant_type: 'password',
        issueRefresh: false,
        password: this.password,
        username: this.username
      }

      try {
        const authResponse = await axios.post(
          'https://api-7.whoop.com/oauth/token',
          authRequestData
        )
        console.log('authResponse', authResponse)
        return authResponse.data
      } catch (e) {
        console.log('auth error', e)
        return null
      }
    }
  }
}
</script>

<style></style>
