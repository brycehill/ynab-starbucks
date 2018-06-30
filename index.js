const { API } = require('ynab')
const { accessToken, budgetId } = require('./.config')
const isFuture = require('date-fns/is_future')
const {
  chain,
  compose,
  converge,
  divide,
  filter,
  length,
  path,
  prop,
  pluck,
  sum,
  tap,
  test
} = require('ramda')

const api = new API(accessToken)

/**
 * Helpers
 */

const avg = converge(divide, [sum, length])
const filterZero = filter(([amt]) => amt !== 0)
const filterName = regex =>
  filter(
    compose(
      test(regex),
      prop('name')
    )
  )

// Given an API response, find all starbucks related payees and return
// a list of their ids
const getSbuxPayeeIds = compose(
  pluck('id'),
  filterName(/starbucks/i),
  path(['data', 'payees'])
)

//
const sumSbuxTransactions = sbuxIds =>
  compose(
    Math.abs,
    sum,
    pluck('amount'),
    filter(t => sbuxIds.includes(t.payee_id)),
    path(['data', 'transactions'])
  )

const getGroceryCategory = compose(
  chain(prop('budgeted')),
  filterName(/grocer[ie|y]+s?/i),
  path(['data', 'month', 'categories'])
)

const totalStarbuxSpend = () =>
  Promise.all([
    api.payees.getPayees(budgetId),
    api.transactions.getTransactions(budgetId)
  ]).then(([payees, transactions]) =>
    sumSbuxTransactions(getSbuxPayeeIds(payees))(transactions)
  )

const allGroceryBudgets = () =>
  api.months
    .getBudgetMonths(budgetId)
    .then(path(['data', 'months']))
    .then(ms =>
      Promise.all(
        ms
          .filter(({ month }) => !isFuture(month))
          .map(({ month }) =>
            api.months.getBudgetMonth(budgetId, month).then(getGroceryCategory)
          )
      )
    )

Promise.all([totalStarbuxSpend(), allGroceryBudgets()]).then(
  ([totalSpentAtSbux, months]) => {
    const monthsOfGroceries = totalSpentAtSbux / avg(filterZero(months))
    console.log(
      `You have spent ${monthsOfGroceries.toFixed()} months worth of grocery budget on Starbucks`
    )
  }
)
