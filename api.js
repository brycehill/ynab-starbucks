const { API } = require('ynab')
const { path } = require('ramda')
const isFuture = require('date-fns/is_future')
const { accessToken, budgetId } = require('./.config')
const {
  getSbuxPayeeIds,
  getGroceryCategory,
  sumSbuxTransactions
} = require('./utils')

const api = new API(accessToken)

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

module.exports = {
  allGroceryBudgets,
  totalStarbuxSpend
}
