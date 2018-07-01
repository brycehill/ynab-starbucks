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
  // tap,
  test
} = require('ramda')

const avg = converge(divide, [sum, length])

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

module.exports = {
  avg,
  filterName,
  getGroceryCategory,
  getSbuxPayeeIds,
  sumSbuxTransactions
}
