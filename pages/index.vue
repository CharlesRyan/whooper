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
      user: {},
      chart: ''
    }
  },
  mounted() {
    this.user = userData
    console.log(userData);
    this.chartSetup()
  },
  methods: {
    chartSetup() {
      const data = [
        {
          year: 2000,
          aData: 50,
          bData: 300
        },
        {
          year: 2001,
          aData: 150,
          bData: 50
        },
        {
          year: 2002,
          aData: 200,
          bData: 100
        },
        {
          year: 2003,
          aData: 130,
          bData: 50
        },
        {
          year: 2004,
          aData: 240,
          bData: 80
        },
        {
          year: 2005,
          aData: 380,
          bData: 10
        },
        {
          year: 2006,
          aData: 420,
          bData: 200
        }
      ]
      const color = ['lightgreen', 'lightblue']
      // Create SVG and padding for the chart
      const svg = d3
        .select('#chart')
        .append('svg')
        .attr('height', 300)
        .attr('width', 600)

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
      const stack = d3.stack().keys(['strain.score', 'sleep.score'])
      const stackedValues = stack(this.user)
      const stackedData = []
      // Copy the stack offsets back into the data.
      stackedValues.forEach((layer, index) => {
        const currentStack = []
        layer.forEach((d, i) => {
          currentStack.push({
            values: d,
            date: this.user[i].days
          })
        })
        stackedData.push(currentStack)
      })

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
        .domain(d3.extent(this.user, (dataPoint) => dataPoint.days))

      // todo
      const area = d3
        .area()
        .x((dataPoint) => xScale(dataPoint.days))
        .y0((dataPoint) => yScale(dataPoint.values[0]))
        .y1((dataPoint) => yScale(dataPoint.values[1]))

      const series = grp
        .selectAll('.series')
        .data(stackedData)
        .enter()
        .append('g')
        .attr('class', 'series')

      series
        .append('path')
        .attr('transform', `translate(${margin.left},0)`)
        .style('fill', (d, i) => color[i])
        .attr('stroke', 'steelblue')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', strokeWidth)
        .attr('d', (d) => area(d))

      // Add the X Axis
      chart
        .append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(this.user.length))

      // Add the Y Axis
      chart
        .append('g')
        .attr('transform', `translate(0, 0)`)
        .call(d3.axisLeft(yScale))
    }
  }
}
</script>

<style>
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
