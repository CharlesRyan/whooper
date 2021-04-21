const getDateIdx = (headers) => {
  const lowercaseHeaders = headers.map((h) => h.toLowerCase())
  const dateIdx = lowercaseHeaders.indexOf('date')
  const dayIdx = lowercaseHeaders.indexOf('day')
  if (dateIdx !== -1) return dateIdx
  if (dayIdx !== -1) return dayIdx
  return -1
}

const convertDates = (data, dateIdx) => {
  return data.map((row, i) => {
    row[dateIdx] = new Date(row[dateIdx])
    row[dateIdx].setHours(0, 0, 0, 0)
    return row
  })
}

const mergeData = (data1, data2) => {
  console.log('data1', data1)
  console.log('data2', data2)
  // concat headers
  let joinedData = []
  if (data1[0] && data1[0].length) joinedData.push(...data1[0])
  if (data2[0] && data2[0].length) joinedData.push(...data2[0])

  const data1DateIdx = getDateIdx(data1[0])
  const data2DateIdx = getDateIdx(data2[0])
  const data1EmptyRow = data1[0].map((_) => null)
  const data2EmptyRow = data2[0].map((_) => null)
  const count = data1.length + data2.length

  if (data1DateIdx !== -1 && data2DateIdx !== -1) {
    // both have dates, align arrays
    // set all items at the indexes to date objects for comparison
    // and drop the headers since they're already joined above
    const newData1 = convertDates(data1.slice(1), data1DateIdx)
    const newData2 = convertDates(data2.slice(1), data2DateIdx)

    for (let i = 0; i < count; i++) {
      if (!newData2[i] && !newData1[i]) break // count is gonna be longer than both
      // populate the two arrays with their missing pieces
      if (!newData1[i]) {
        // fill all nulls for the shorter one
        newData1[i] = [...data1EmptyRow]
      } else if (!newData2[i]) {
        // fill all nulls for the shorter one
        newData2[i] = [...data2EmptyRow]
      } else if (newData1[i][data1DateIdx] < newData2[i][data2DateIdx]) {
        // add array of nulls at beginning to shift back the later starting array
        newData2.unshift([...data2EmptyRow])
      } else if (newData1[i][data1DateIdx] > newData2[i][data2DateIdx]) {
        // add array of nulls at beginning to shift back the later starting array
        newData1.unshift([...data1EmptyRow])
      }
    }
    // zip together
    newData1.forEach((row, i) => joinedData.push([...row, ...newData2[i]]))

    // combine date columns
    const newDateIdx1 = getDateIdx(joinedData[0])
    const secondDateArray = [...joinedData[0]]
    secondDateArray[newDateIdx1] = 'different string'
    const newDateIdx2 = getDateIdx(secondDateArray)

    joinedData = joinedData.map((row, i) => {
      let newRow = [...row]

      // debugging
      if (i > 0) {
        // console.log('newRow[newDateIdx1]', newRow[newDateIdx1])
        const rowDate1 = !!newRow[newDateIdx1]
          ? newRow[newDateIdx1].toLocaleDateString &&
            newRow[newDateIdx1].toLocaleDateString('en-US')
          : newRow[newDateIdx1]
        // console.log('newRow[newDateIdx2]', newRow[newDateIdx2])
        const rowDate2 = !!newRow[newDateIdx2]
          ? newRow[newDateIdx2].toLocaleDateString &&
            newRow[newDateIdx2].toLocaleDateString('en-US')
          : newRow[newDateIdx2]
        if (rowDate1 !== null && rowDate2 !== null && rowDate1 !== rowDate2) {
          console.log('mismatched dates at row', i)
          console.log('offending row: ', newRow)
        }
      }
      // debugging

      if (
        (newRow[newDateIdx1] === null ||
          newRow[newDateIdx1] === 'Invalid Date') &&
        newRow[newDateIdx2] !== null
      ) {
        newRow[newDateIdx1] = newRow[newDateIdx2]
      }

      newRow.splice(newDateIdx2, 1)

      return newRow
    })

    console.log('joinedData', joinedData)

    // convert to friendly date
    const joinedDateIdx = getDateIdx(joinedData[0])
    console.log('newDateIdx', joinedDateIdx)
    joinedData.forEach((row, i) => {
      // skip headers
      if (i > 0 && row[joinedDateIdx]) {
        // console.log(
        //   'converting',
        //   row[joinedDateIdx].toLocaleDateString('en-US')
        // )
        row[joinedDateIdx] = row[joinedDateIdx].toLocaleDateString('en-US')
      }
    })
  } else {
    // simple merge without date considerations
    for (let i = 1; i < count; i++) {
      if (!data2[i] && !data1[i]) break // count is gonna be longer than both
      // populate the two arrays with their missing pieces
      if (!data1[i]) {
        // fill all nulls for the shorter one
        data1[i] = [...data1EmptyRow]
      } else if (!data2[i]) {
        // fill all nulls for the shorter one
        data2[i] = [...data2EmptyRow]
      }
    }
    console.log('should match(dateless)', data1.length, data2.length)
    // zip together
    data1.forEach((row, i) => {
      // skip headers
      if (i > 0) joinedData.push([...row, ...data2[i]])
    })
  }

  return joinedData
}

export default mergeData
