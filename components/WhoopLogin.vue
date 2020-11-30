<template lang="pug">
  .login.align-center.mx-10
    h3(
      :class="{cta: ctaState}"
      @click="showForm = !showForm"
      v-if="!loggedInState"
    ) Log in with Whoop
    h3(
      v-if="loggedInState"
    ) Using data from Whoop account- {{whoopEmail}}
    v-form(v-model="valid" @submit.prevent="handleSubmit" v-if="formState")
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
            ) Log In

</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'

import Footer from './Footer'

export default {
  components: {
    Footer
  },
  data() {
    return {
      username: '',
      password: '',
      valid: false,
      showForm: false,
      usernameRules: [(v) => !!v || 'Email is required'],
      passwordRules: [(v) => !!v || 'Password is required']
    }
  },
  mounted() {},
  computed: {
    ...mapState({
      whoopEmail: (state) => state.whoopEmail,
      whoopAuthToken: (state) => state.whoopAuthToken,
      whoopID: (state) => state.whoopID
    }),
    ctaState() {
      return !this.whoopAuthToken && !this.showForm
    },
    formState() {
      return !this.whoopAuthToken && this.showForm
    },
    loggedInState() {
      return this.whoopAuthToken && this.whoopEmail
    }
  },
  methods: {
    async handleSubmit() {
      const authResponse = await this.authenticate()
      const whoopData = {
        whoopEmail: this.username,
        whoopID: authResponse.user.id,
        whoopAuthToken: authResponse.access_token
      }
      this.$store.commit('setWhoopData', whoopData)
    },
    async fetchUserData() {
      const authResponse = await this.authenticate()
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

  h1, h3 {
    margin-bottom: 16px;

    &.cta {
      text-decoration: underline;
      cursor: pointer;
    }
  }
}
</style>
