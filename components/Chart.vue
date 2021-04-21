<template lang="pug">
  .container.whoop
    .whoop__charts
      .whoop__chart#chart


</template>

<script>
import * as d3 from 'd3'
import * as c3 from 'c3'

import userData from '../assets/js/staticData'

export default {
  components: {},
  data() {
    return {
      username: '',
      password: '',
      accessToken: '',
      userId: '',
      userData: {},
      sums: {
        recovery: {
          restingHeartRate: 0,
          heartRateVariabilityRmssd: 0,
          score: 0
        },
        sleep: {
          score: 0
        },
        strain: {
          averageHeartRate: 0,
          maxHeartRate: 0,
          score: 0,
          rawScore: 0
        }
      },
      sumsWithSleep: {
        recovery: {
          restingHeartRate: 0,
          heartRateVariabilityRmssd: 0,
          score: 0
        },
        sleep: {
          score: 0,
          sleeps: {
            inBedDuration: 0,
            latencyDuration: 0,
            lightSleepDuration: 0,
            qualityDuration: 0,
            remSleepDuration: 0,
            respiratoryRate: 0,
            score: 0,
            sleepConsistency: 0,
            sleepEfficiency: 0,
            slowWaveSleepDuration: 0,
            wakeDuration: 0
          }
        },
        strain: {
          averageHeartRate: 0,
          maxHeartRate: 0,
          score: 0,
          rawScore: 0
        }
      },
      averages: {
        recovery: {
          restingHeartRate: 0,
          heartRateVariabilityRmssd: 0,
          score: 0
        },
        sleep: {
          score: 0
        },
        strain: {
          averageHeartRate: 0,
          maxHeartRate: 0,
          score: 0,
          rawScore: 0
        }
      },
      chart: '',
      interestingMetrics: {
        data: {
          strainScores: [],
          avgHRs: [],
          sleepScores: []
        },
        diffs: {
          strainScores: [],
          avgHRs: [],
          sleepScores: [],
          hrv: []
        },
        averages: {
          strainScoreAvg: [],
          avgHRAvg: [],
          sleepScoreAvg: [],
          hrv: []
        },
        days: []
      }
    }
  },
  mounted() {
    this.userData = userData
    console.log('data', this.userData)
    // populates this.averages
    this.processData(this.userData)
    // this.stackChartSetup()
    // this.multiLineChartSetup()
    this.reduceInterestingMetrics(this.userData)
    this.c3ChartSetup()
  },
  computed: {
    windowWidth() {
      return window.innerWidth * 0.8
    },
    windowHeight() {
      return window.innerHeight * 0.8
    }
  },
  methods: {
    reduceInterestingMetrics(data) {
      let count = 0
      console.log('avgs', this.averages)
      // this.interestingMetrics.averages.strainScore = this.averages.strain.score
      // this.interestingMetrics.averages.avgHR = this.averages.strain.averageHeartRate
      // this.interestingMetrics.averages.sleepScore = this.averages.sleep.score

      data.forEach((item) => {
        if (!item.recovery) return

        const strainScore = item.strain.score
        const avgHR = item.strain.averageHeartRate
        const hrv = Math.round(item.recovery.heartRateVariabilityRmssd * 1000)
        const sleepScore = item.sleep.score
        const day = item.days[0]

        if (strainScore && hrv && sleepScore) {
          const normStrainScore = Math.round((strainScore / 21) * 100)

          const normStrainScoreAvg = Math.round(
            (this.averages.strain.score / 21) * 100
          )
          const averageHeartRateAvg = this.averages.strain.averageHeartRate
          const sleepScoreAvg = this.averages.sleep.score
          const avgHrv = this.averages.recovery.heartRateVariabilityRmssd

          this.interestingMetrics.data.strainScores.push(normStrainScore)
          this.interestingMetrics.data.avgHRs.push(avgHR)
          this.interestingMetrics.data.sleepScores.push(sleepScore)

          this.interestingMetrics.diffs.strainScores.push(
            normStrainScore - normStrainScoreAvg
          )
          // this.interestingMetrics.diffs.avgHRs.push(avgHR - averageHeartRateAvg)
          this.interestingMetrics.diffs.hrv.push(hrv - avgHrv)
          this.interestingMetrics.diffs.sleepScores.push(
            sleepScore - sleepScoreAvg
          )

          this.interestingMetrics.days.push(day)
          count++
        }
      })

      for (let i = 0; i < count; i++) {
        const normStrainScore = Math.round(
          (this.averages.strain.score / 21) * 100
        )

        this.interestingMetrics.averages.strainScoreAvg.push(normStrainScore)
        this.interestingMetrics.averages.avgHRAvg.push(
          this.averages.strain.averageHeartRate
        )
        this.interestingMetrics.averages.sleepScoreAvg.push(
          this.averages.sleep.score
        )
      }
    },
    processData(data) {
      let length = 0

      data.forEach((item) => {
        let isValid = true

        // check there are values for this day
        Object.keys(this.sums).forEach((key1) => {
          const data1 = item[key1]
          const type1 = typeof data1

          if (data1 === null) {
            isValid = false
          } else {
            Object.keys(this.sums[key1]).forEach((key2) => {
              const data2 = item[key1][key2]
              if (data2 === null) {
                isValid = false
              }
            })
          }
        })

        if (isValid) {
          length++

          // sum up values
          Object.keys(this.sums).forEach((key1) => {
            const isValid = true

            let data1 = item[key1]
            if (key1 === 'heartRateVariabilityRmssd')
              Math.round((data1 = data1 * 1000))
            const type1 = typeof data1

            if (type1 === 'number') {
              this.sums[key1] += data1
              // console.log('averages[key1]', this.averages[key1])
            } else if (data1) {
              Object.keys(this.sums[key1]).forEach((key2) => {
                let data2 = item[key1][key2]
                if (key2 === 'heartRateVariabilityRmssd')
                  Math.round((data2 = data2 * 1000))
                this.sums[key1][key2] += data2
                // console.log('averages[key1]', this.averages[key1])
              })
            }
          })
        }
      })

      // divide to get averages
      Object.keys(this.sums).forEach((key1) => {
        const data1 = this.sums[key1]
        const type1 = typeof data1

        if (type1 === 'number') {
          this.averages[key1] = Math.round(data1 / length)
          // console.log('averages[key1]', this.averages[key1])
        } else {
          Object.keys(data1).forEach((key2) => {
            const data2 = this.sums[key1][key2]
            this.averages[key1][key2] = Math.round(data2 / length)
            // console.log('averages[key1]', this.averages[key1])
          })
        }
      })
    },
    stackChartSetup() {
      const color = ['red', 'green']
      // Create SVG and padding for the chart
      const svg = d3
        .select('#chart')
        .append('svg')
        .attr('height', 450)
        .attr('width', 900)

      const strokeWidth = 1.5
      const margin = { top: 0, bottom: 20, left: 30, right: 20 }
      const chart = svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)

      const width =
        +svg.attr('width') - margin.left - margin.right - strokeWidth * 2
      const height = +svg.attr('height') - margin.top - margin.bottom
      const grp = chart
        .append('g')
        .attr(
          'transform',
          `translate(-${margin.left - strokeWidth},-${margin.top})`
        )
      // Create stack
      const stack = d3.stack().keys(['strainScore', 'sleepScore'])
      const stackedValues = stack(this.userData)
      // console.log({stackedValues});
      const stackedData = []
      // Copy the stack offsets back into the data.
      stackedValues.forEach((layer, index) => {
        const currentStack = []
        layer.forEach((d, i) => {
          // console.log('d', d)
          // console.log('date', this.userData[i].days[0])
          currentStack.push({
            values: d,
            days: this.userData[i].days
          })
        })
        stackedData.push(currentStack)
      })
      // console.log({stackedData});

      // Create scales
      const yScale = d3
        .scaleLinear()
        .range([height, 0])
        .domain([
          0,
          d3.max(stackedValues[stackedValues.length - 1], (dp) => dp[1])
        ])
      const xScale = d3
        .scaleLinear()
        .range([0, width])
        .domain(d3.extent(this.userData, (dataPoint) => dataPoint.days))

      // todo
      const area = d3
        .area()
        .x((dataPoint) => {
          console.log('dataPoint.days', dataPoint.days)
          return xScale(dataPoint.days)
        })
        .y0((dataPoint) => {
          console.log('dp', dataPoint.values)
          return yScale(dataPoint.values[0])
        })
        .y1((dataPoint) => {
          console.log('dataPoint.values[1]', dataPoint.values[1])
          return yScale(dataPoint.values[1])
        })

      console.log('area', area)

      const series = grp
        .selectAll('.series')
        .data(stackedData)
        .enter()
        .append('g')
        .attr('class', 'series')

      console.log('series1', series)

      series
        .append('path')
        .attr('transform', `translate(${margin.left},0)`)
        .style('fill', (d, i) => color[i])
        .attr('stroke', 'steelblue')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', strokeWidth)
        .attr('d', (d) => area(d))

      console.log('series2', series)

      // Add the X Axis
      chart
        .append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(this.userData.length))

      console.log('chart1', chart)

      // Add the Y Axis
      chart
        .append('g')
        .attr('transform', `translate(0, 0)`)
        .call(d3.axisLeft(yScale))

      console.log('chart2', chart)
    },
    multiLineChartSetup() {
      // set the dimensions and margins of the graph
      let margin = { top: 20, right: 20, bottom: 30, left: 50 },
        width = this.windowWidth - margin.left - margin.right,
        height = this.windowHeight - margin.top - margin.bottom

      // parse the date / time
      let parseTime = d3.timeParse('%d-%b-%y')

      // set the ranges
      let x = d3.scaleTime().range([0, width])
      let y = d3.scaleLinear().range([height, 0])

      // define the 1st line
      let valueline = d3
        .line()
        .x((d) => {
          return x(d.day)
        })
        .y((d) => {
          return y(d[this.keyMap[0].name])
        })

      // define the 2nd line
      let valueline2 = d3
        .line()
        .x((d) => {
          return x(d.day)
        })
        .y((d) => {
          return y(d[this.keyMap[1].name])
        })

      // define the 2nd line
      let valueline3 = d3
        .line()
        .x((d) => {
          return x(d.day)
        })
        .y((d) => {
          return y(d[this.keyMap[2].name])
        })

      // append the svg obgect to the body of the page
      // appends a 'group' element to 'svg'
      // moves the 'group' element to the top left margin
      let svg = d3
        .select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

      // // Get the data
      // d3.csv('data2.csv', function(error, data) {
      //   if (error) throw error

      // format the data
      this.userData.forEach((d) => {
        // d.day = parseTime(d.day)
        Object.keys(d).forEach((key) => {
          if (typeof d[key] === 'string') return (d[key] = +d[key])
        })
      })

      // Scale the range of the data
      x.domain(
        d3.extent(this.userData, (d) => {
          return d.day
        })
      )
      y.domain([
        0,
        d3.max(this.userData, (d) => {
          return Math.max(
            d[this.keyMap[0].name],
            d[this.keyMap[1].name],
            d[this.keyMap[2].name]
          )
        })
      ])

      // Add the valueline path.
      svg
        .append('path')
        .data([this.userData])
        .attr('class', 'line')
        .style('stroke', this.keyMap[0].color)
        .attr('d', valueline)

      // Add the valueline2 path.
      svg
        .append('path')
        .data([this.userData])
        .attr('class', 'line')
        .style('stroke', this.keyMap[1].color)
        .attr('d', valueline2)

      // Add the valueline2 path.
      svg
        .append('path')
        .data([this.userData])
        .attr('class', 'line')
        .style('stroke', this.keyMap[2].color)
        .attr('d', valueline3)

      // Add the X Axis
      svg
        .append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x))

      // Add the Y Axis
      svg.append('g').call(d3.axisLeft(y))
      // })
    },
    c3ChartSetup() {
      const columns = []
      const types = {}

      // diff arrays
      Object.keys(this.interestingMetrics.diffs).forEach((key) => {
        if (this.interestingMetrics.diffs[key].length) {
          columns.push([key, ...this.interestingMetrics.diffs[key]])
        }
      })

      // // raw data arrays
      // Object.keys(this.interestingMetrics.data).forEach((key) => {
      //   columns.push([key, ...this.interestingMetrics.data[key]])
      // })

      // average arrays
      // Object.keys(this.interestingMetrics.averages).forEach((key) => {
      //   columns.push([key, ...this.interestingMetrics.averages[key]])
      //   types[key] = 'line'
      // })

      const testColumns = [
        ['data1', 30, 200, 100, 400, 150, 250],
        ['data2', 50, 20, 10, 40, 15, 25]
      ]

      const chart = c3.generate({
        bindto: '#chart',
        data: {
          columns: columns,
          type: 'bar',
          types: types,
          labels: true
        }
      })
    }
  }
}
</script>

<style scoped>
.container {
  margin: 0 auto;
  min-height: 100vh;
  max-width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.whoop__charts {
  max-width: 100vw;
}
.whoop__charts .c3-chart-line {
  /* fill: none; */
}
</style>
