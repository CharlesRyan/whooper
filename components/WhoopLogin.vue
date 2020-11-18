<template lang="pug">
  v-app.align-center
    .login.mx-10
      h1 Whooper
      p Visualization of raw data straight from Whoop's API
      v-form(v-model="valid" @submit.prevent="fetchUserData")
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
            v-row.mt-6.justify-space-around

              v-btn.mb-4(
                :disabled="!valid"
                type="submit"
                color="primary"
                large
              ) Fetch Whoop Data

              v-btn.mb-4(
                @click="useSampleData"
                large
              ) Use Sample Data

      p.mt-8 Your credentials are never saved by this app. They are only used to request data from Whoop's servers.
      p You can check out the source code 
        a( 
          href="https://github.com/CharlesRyan/whooper" 
          target="_blank"
        ) here

    
    Footer

</template>

<script>
import axios from 'axios'

import Footer from './Footer'

import sampleData from '../assets/js/staticData'

export default {
  components: {
    Footer
  },
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
      const userData = await this.getData(
        authResponse.user.id,
        authResponse.access_token
      )
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

<style lang="scss">
.v-application--wrap {
  justify-content: center;
  align-items: center;
}

.login {
  margin: auto;
  max-width: 500px;

  h1 {
    margin-bottom: 16px;
  }
}
</style>
