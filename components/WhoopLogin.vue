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
      await this.fetchAuthData()
      const rawData = await this.getWhoopData(this.whoopID, this.whoopAuthToken)
      const parsedData = this.parseWhoopData(rawData)
      this.$store.commit('setWhoopRawData', parsedData)
    },
    async fetchAuthData() {
      try {
        const authResponse = await this.authenticate(
          this.username,
          this.password
        )
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
    parseWhoopData(rawData) {
      // returns same format as buildTableRows in InputTable
      return rawData.map((item) => {
        // declare column titles
        const day = 'day'
        const sleepQualityDuration = 'Sleep- Quality Duration'
        const sleepinBedDuration = 'Sleep- In Bed Duration'
        const sleepScore = 'Sleep- Score'
        const averageHeartRate = 'Average Heart Rate'
        const strainScore = 'Strain Score'
        const activityCount = 'Activity Count'
        const HRV = 'HRV'
        const restingHeartRate = 'Resting Heart Rate'
        const recoveryScore = 'Recovery Score'

        const parsedItem = {}
        const { days, sleep, strain, recovery } = item

        const nightSleep = sleep.sleeps.length
          ? sleep.sleeps.filter((s) => !s.isNap)[0]
          : null
        const noData = 'No Data'

        parsedItem[day] = days[0]
        parsedItem[sleepQualityDuration] = nightSleep
          ? this.parseMs(nightSleep.qualityDuration)
          : noData
        parsedItem[sleepinBedDuration] = nightSleep
          ? this.parseMs(nightSleep.inBedDuration)
          : noData
        parsedItem[sleepScore] = sleep.score || noData
        parsedItem[averageHeartRate] = strain.averageHeartRate || noData
        parsedItem[strainScore] = strain.score
          ? strain.score.toFixed(1)
          : noData
        parsedItem[activityCount] = strain.workouts.length
        parsedItem[HRV] =
          recovery && recovery.heartRateVariabilityRmssd
            ? Math.round(recovery.heartRateVariabilityRmssd * 1000)
            : noData
        parsedItem[restingHeartRate] =
          recovery && recovery.restingHeartRate
            ? recovery.restingHeartRate
            : noData
        parsedItem[recoveryScore] =
          recovery && recovery.score ? recovery.score : noData

        return parsedItem
      })
    },
    parseMs(ms) {
      // 1- Convert to seconds:
      let seconds = ms / 1000
      // 2- Extract hours:
      const hours = parseInt(seconds / 3600) // 3,600 seconds in 1 hour
      seconds = seconds % 3600 // seconds remaining after extracting hours
      // 3- Extract minutes:
      const minutes = parseInt(seconds / 60) // 60 seconds in 1 minute
      // 4- Keep only seconds not extracted to minutes:
      seconds = seconds % 60
      return `${hours}:${minutes}`
    },
    async getWhoopData(id, token) {
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
    async authenticate(username, password) {
      const authRequestData = {
        grant_type: 'password',
        issueRefresh: false,
        password,
        username
      }

      const authResponse = await axios.post(
        'https://api-7.whoop.com/oauth/token',
        authRequestData
      )
      // console.log('authResponse', authResponse)
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
