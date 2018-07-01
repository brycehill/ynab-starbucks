const { filter } = require('ramda')
const { avg } = require('./utils')
const { allGroceryBudgets, totalStarbuxSpend } = require('./api')
const filterZero = filter(([amt]) => amt !== 0)

Promise.all([totalStarbuxSpend(), allGroceryBudgets()]).then(
  ([totalSpentAtSbux, months]) => {
    const monthsOfGroceries = totalSpentAtSbux / avg(filterZero(months))
    console.log(
      `You have spent ${monthsOfGroceries.toFixed()} months worth of grocery budget on Starbucks`
    )
  }
)
