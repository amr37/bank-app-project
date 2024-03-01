const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')

const accounts = require('./accounts')

const app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(cors())
const port = 4000

// Custom debug logging function
const debugLog = (message) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('[DEBUG]', message)
  }
}

// Define your endpoints

// login
app.get('/login', (req, res) => {
  debugLog('Received a login request.')
  const username = req.query.username
  const pin = req.query.pin
  const account = accounts.find((account) => account.username === username)

  if (account && account.pin === Number(pin)) {
    const token = jwt.sign({ username: account.username }, 'secret_key', {
      expiresIn: '1h',
    }) // Change 'secret_key' to your actual secret key
    debugLog(`Login successful for user: ${username}`)
    res.json({ account, token })
  } else {
    debugLog('Login failed: invalid credentials')
    res
      .status(404)
      .json({ message: 'Account not found or invalid credentials' })
  }
})

// User data retrieval endpoint
app.get('/user', (req, res) => {
  const token = req.query.token

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      debugLog('Unauthorized request.')
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const account = accounts.find((acc) => acc.username === decoded.username)
    if (!account) {
      debugLog('Account not found.')
      return res.status(404).json({ message: 'Account not found' })
    }

    debugLog(`User data retrieved successfully for user: ${decoded.username}`)
    res.json({ account })
  })
})

app.post('/movements', (req, res) => {
  debugLog('Received a movement request.')
  const token = req.query.token
  const movement = req.body

  debugLog(`Token: ${token}`)
  debugLog(`Movement: ${JSON.stringify(movement)}`)

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      debugLog('Unauthorized request.')
      return res.status(401).json({ message: 'Unauthorized' })
    }
    debugLog(`Authorized movement request for user: ${decoded.username}`)

    // Validate the movement object
    if (
      !movement ||
      typeof movement !== 'object' ||
      !movement.amount ||
      !movement.date
    ) {
      debugLog(
        'Invalid movement object it should be an object with properties amount and date'
      )
      return res.status(400).json({
        message: 'Invalid movement object',
      })
    }

    // Validate the amount field
    const amount = parseFloat(movement.amount)
    if (isNaN(amount)) {
      debugLog('Invalid amount it should be a number.')
      return res.status(400).json({ message: 'Invalid amount' })
    }

    // Validate the date field format
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
    if (
      typeof movement.date !== 'string' ||
      !dateFormatRegex.test(movement.date)
    ) {
      debugLog('Invalid date format.')
      return res.status(400).json({ message: 'Invalid date format' })
    }

    // Perform movement update logic here
    const accountIndex = accounts.findIndex(
      (acc) => acc.username === decoded.username
    )

    if (accountIndex !== -1) {
      // Check if the requested amount is greater than the account balance
      if (
        amount >
        accounts[accountIndex].movements.reduce(
          (acc, movement) => acc + movement.amount,
          0
        )
      ) {
        debugLog('Insufficient balance.')
        return res.status(400).json({ message: 'Insufficient balance' })
      }
      accounts[accountIndex].movements.push({
        amount,
        date: new Date().toISOString(),
      })
      debugLog('Movements updated successfully.')
      res.json({ message: 'Movements updated' })
    } else {
      debugLog('Account not found.')
      res.status(404).json({ message: 'Account not found' })
    }
  })
})

app.post('/transfer', (req, res) => {
  debugLog('Received a transfer request.')
  const token = req.query.token
  const { destinationAccount, amount } = req.body

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      debugLog('Unauthorized request.')
      return res.status(401).json({ message: 'Unauthorized' })
    }

    debugLog(`Authorized transfer request for user: ${decoded.username}`)
    // Find source account based on the username in the token
    const sourceIndex = accounts.findIndex(
      (acc) => acc.username === decoded.username
    )
    if (sourceIndex === -1) {
      debugLog('Source account not found.')
      return res.status(404).json({ message: 'Source account not found' })
    }

    const sourceAccountObj = accounts[sourceIndex]

    // Check if the source account has sufficient balance
    if (
      sourceAccountObj.movements.reduce(
        (acc, movement) => acc + movement.amount,
        0
      ) < amount
    ) {
      debugLog('Insufficient balance.')
      return res.status(400).json({ message: 'Insufficient balance' })
    }

    // Find destination account
    const destinationIndex = accounts.findIndex(
      (acc) => acc.numberAccount === destinationAccount
    )
    if (destinationIndex === -1) {
      debugLog('Destination account not found.')
      return res.status(404).json({ message: 'Destination account not found' })
    }

    // Deduct amount from the source account
    sourceAccountObj.movements.push({
      amount: -amount,
      date: new Date().toISOString(),
    })

    // Add amount to the destination account
    accounts[destinationIndex].movements.push({
      amount,
      date: new Date().toISOString(),
    })

    debugLog('Transfer successful.')
    res.json({ message: 'Transfer successful' })
  })
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

module.exports = app
