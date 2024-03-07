const { expect } = require('chai')
const request = require('supertest')
const app = require('./app') // Assuming your Express app file is named 'app.js'
const accounts = require('./accounts') // Import accounts data

describe('Login endpoint', () => {
  it('should return account details and token on valid login', (done) => {
    request(app)
      .get('/login')
      .query({ username: accounts[0].username, pin: accounts[0].pin })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        // Add assertions for response body
        expect(res.body).to.have.property('account')
        expect(res.body).to.have.property('token')
        // Add more assertions if necessary
        done()
      })
  })

  it('should return error on invalid credentials', (done) => {
    request(app)
      .get('/login')
      .query({ username: 'invalid_username', pin: 'invalid_pin' })
      .expect(404)
      .end((err, res) => {
        if (err) return done(err)
        // Add assertions for response body
        expect(res.body.message).to.equal(
          'Account not found or invalid credentials'
        )
        // Add more assertions if necessary
        done()
      })
  })
})

describe('GET /user', () => {
  let validToken // Store valid token
  let invalidToken = 'invalid_token' // Invalid token

  before((done) => {
    // Perform login to obtain valid token
    request(app)
      .get('/login')
      .query({ username: accounts[0].username, pin: accounts[0].pin }) // Use the first account for testing
      .end((err, res) => {
        if (err) return done(err)
        validToken = res.body.token
        done()
      })
  })

  it('should return user data with a valid token', (done) => {
    request(app)
      .get('/user')
      .query({ token: validToken })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).to.have.property('account')
        // Add more assertions if necessary
        done()
      })
  })

  it('should handle unauthorized access with an invalid token', (done) => {
    request(app)
      .get('/user')
      .query({ token: invalidToken })
      .expect(401)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body.message).to.equal('Unauthorized')
        done()
      })
  })

  it('should handle invalid token format', (done) => {
    request(app)
      .get('/user')
      .query({ token: 'invalidFormat' }) // Invalid token format
      .expect(401)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body.message).to.equal('Unauthorized')
        done()
      })
  })

  it('should handle missing token', (done) => {
    request(app)
      .get('/user')
      .expect(401)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body.message).to.equal('Unauthorized')
        done()
      })
  })
})

describe('Transfer endpoint', () => {
  let token // Store token for authenticated requests
  let sourceAccount // Store source account for transfer

  before((done) => {
    // Perform login to obtain token
    request(app)
      .get('/login')
      .query({ username: accounts[0].username, pin: accounts[0].pin }) // Use the first account for testing
      .end((err, res) => {
        if (err) return done(err)
        token = res.body.token
        sourceAccount = accounts[0]
        done()
      })
  })

  it('should transfer money between accounts', (done) => {
    request(app)
      .post('/transfer')
      .query({ token })
      .send({ destinationAccount: accounts[1].numberAccount, amount: 100 }) // Use the second account as the destination account for testing
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body.message).to.equal('Transfer successful')
        done()
      })
  })

  it('should handle insufficient balance error', (done) => {
    request(app)
      .post('/transfer')
      .query({ token })
      .send({ destinationAccount: accounts[1].numberAccount, amount: 9999999 }) // An amount greater than the balance
      .expect(400)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body.message).to.equal('Insufficient balance')
        done()
      })
  })

  it('should handle destination account not found', (done) => {
    request(app)
      .post('/transfer')
      .query({ token })
      .send({ destinationAccount: 'non_existing_account', amount: 100 }) // Use a non-existing account for testing
      .expect(404)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body.message).to.equal('Destination account not found')
        done()
      })
  })

  it('should handle unauthorized access', (done) => {
    request(app).post('/transfer').expect(401).end(done)
  })
})

describe('Movements endpoint', () => {
  let token // Store token for authenticated requests

  before((done) => {
    // Perform login to obtain token
    request(app)
      .get('/login')
      .query({ username: accounts[0].username, pin: accounts[0].pin }) // Use the first account for testing
      .end((err, res) => {
        if (err) return done(err)
        token = res.body.token
        done()
      })
  })

  it('should update movements successfully', (done) => {
    const movement = { amount: 100, date: new Date().toISOString() }
    request(app)
      .post('/movements')
      .query({ token })
      .send(movement)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body.message).to.equal('Movements updated')
        done()
      })
  })

  it('should handle insufficient balance when taking money out', (done) => {
    const invalidMovement = { amount: 9999999, date: new Date().toISOString() }
    // An amount greater than the balance
    request(app)
      .post('/movements')
      .query({ token })
      .send(invalidMovement)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body.message).to.equal('Insufficient balance')
        done()
      })
  })

  it('should handle missing or invalid movement object', (done) => {
    request(app)
      .post('/movements')
      .query({ token })
      .expect(400)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body.message).to.equal('Invalid movement object')
        done()
      })
  })

  it('should handle invalid amount field', (done) => {
    const invalidAmountMovement = {
      amount: 'invalid_amount',
      date: new Date().toISOString(),
    }
    request(app)
      .post('/movements')
      .query({ token })
      .send(invalidAmountMovement)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body.message).to.equal('Invalid amount')
        done()
      })
  })

  it('should handle invalid date field format', (done) => {
    const invalidDateFormatMovement = {
      amount: 100,
      date: 'invalid_date_format',
    }
    request(app)
      .post('/movements')
      .query({ token })
      .send(invalidDateFormatMovement)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body.message).to.equal('Invalid date format')
        done()
      })
  })

  it('should handle unauthorized access', (done) => {
    request(app).post('/movements').expect(401).end(done)
  })
})
