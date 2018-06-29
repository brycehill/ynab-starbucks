const ynab = require('ynab')
const R = require('ramda')
const accessToken = ''
const api = new ynab.API(accessToken)
const budgetId = '305cce10-2f51-45f2-b40f-f087cfac00b7'

const totalStarbuxSpend = () =>
  api.transactions
    .getTransactions(budgetId)
    .then(R.path(['data', 'transactions']))
    .then(ts => {
      return R.sum(
        ts
          .filter(t => sbux.includes(t.payee_id))
          .map(({ amount }) =>
            ynab.utils.convertMilliUnitsToCurrencyAmount(amount, 2)
          )
      )
    })

const groceryCategories = () =>
  api.categories
    .getCategories(budgetId)
    .then(R.path(['data', 'category_groups']))
    .then(cgs => {
      const categories = R.flatten(cgs.map(cg => cg.categories))
      return categories.filter(c => {
        // console.log(c)
        return /groceries/i.test(c.name)
      })
    })

api.payees
  .getPayees(budgetId)
  .catch(err => console.error(err))
  .then(R.path(['data', 'payees']))
  .then(ps => {
    const sbux = ps
      .filter(({ name }) => /starbucks/i.test(name))
      .map(({ id }) => id)

    return Promise.all([
      // totalStarbuxSpend(),
      // groceryCategories()
      // api.months
      //   .getBudgetMonths(budgetId)
      //   .then(R.path(['data', 'months']))
      //   .then(ms => {
      //     console.log(ms)
      //     return Promise.all(
      //       ms.map(m =>
      //         api.months.getBudgetMonth(budgetId, m).then(R.prop('data'))
      //       )
      //     )
      //   })
      //   .catch(err => console.error(err))
    ])
      .then(([sbuxAmount, months]) => {
        console.log(sbuxAmount, months)
        // Then find the average amount of groceries spent and divide sbux into it
        // to determine the number of months
      })
      .catch(err => console.error(err))
  })
