<template lang="pug">
  .login.align-center.mx-10
    v-btn(
      :class="{cta: ctaState}"
      @click="showForm = !showForm"
      v-if="!loggedInState"
      type="submit"
      color="primary"
    ) {{ ctaText }}
    h3(
      v-if="loggedInState"
    ) Account connected- {{whoopEmail}}

    v-dialog(
      width="500"
      v-model="showForm"
      light
    )
      v-form.login__form(
        v-model="valid" 
        @submit.prevent="handleSubmit" 
        v-if="formState"
      )
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
  props: {
    ctaText: String
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
      whoopID: (state) => state.whoopID,
      whoopCreatedAt: (state) => state.whoopCreatedAt
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
      try {
        const authResponse = await this.authenticate()
        const whoopData = {
          whoopEmail: this.username,
          whoopID: authResponse.user.id,
          whoopCreatedAt: authResponse.user.profile.createdAt,
          whoopAuthToken: authResponse.access_token
        }
        this.showForm = false
        this.$store.commit('setWhoopAuthData', whoopData)
      } catch (e) {
        // force error messages upon failure
        this.usernameRules = ['']
        this.passwordRules = ['Login failed. Double check your info?']
        // reset to normal validation
        setTimeout(() => {
          this.usernameRules = [(v) => !!v || 'Email is required']
          this.passwordRules = [(v) => !!v || 'Password is required']
        }, 5000)
        console.log('handleSubmit fail', e)
      }
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

      const authResponse = await axios.post(
        'https://api-7.whoop.com/oauth/token',
        authRequestData
      )
      console.log('authResponse', authResponse)
      return authResponse.data
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

  &__form {
    background-color: #fff;
    padding: 20px;
  }

  .error-text {
    color: $error;
  }

  h1 {
    margin-bottom: 16px;

    &.cta {
      text-decoration: underline;
      cursor: pointer;
    }
  }
}
</style>
