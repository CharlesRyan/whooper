<template lang="pug">
  .container.whoop
    //- .whoop__login(v-if="!user.id")
    //-   input(type='text')
    //-   input(type='password')
    .whoop__charts
      .whoop__chart#chart


</template>

<script>
import * as d3 from 'd3'

import userData from '../assets/staticData'

export default {
  components: {},
  data() {
    return {
      username: '',
      password: '',
      accessToken: '',
      userId: '',
      userData: {},
      chart: '',
      keyMap: [
        { name: 'strainScore', color: 'red' },
        { name: 'avgHR', color: 'green' },
        { name: 'sleepScore', color: 'blue' }
      ]
    }
  },
  mounted() {
    this.userData = this.processData(userData)

    console.log(this.userData)
    // this.stackChartSetup()
    this.multiLineChartSetup()
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
    processData(data) {
      const averages = {}

      //  make this next part recursive
      // but create an object thats identically nested

      Object.keys(data).forEach((key) => {
        if (!Object.keys.length(data[key])) {
          if (averages[key] && averages[key].sum) {
            averages[key].sum += parseInt(data[key])
          } else {
            averages[key].sum = parseInt(data[key])
          }
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
    }
  }
}
</script>

<style>
.axis path,
.axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}

.x.axis path {
  display: none;
}

.line {
  fill: none;
  stroke: steelblue;
  stroke-width: 1.5px;
}

.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
