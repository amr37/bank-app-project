// Example POST method implementation:

async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST', // GET por defecto
    body: JSON.stringify(data), // body data type must match "Content-Type" header
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.json() // parses JSON response into native JavaScript objects
}

// TODO: Replace 'token' with a valid token
const token = 'adfadfadadfadfadsf'

postData(`http://localhost:4000/movements?token=${token}`, {
  amount: 100,
  date: new Date().toISOString(),
}).then((data) => {
  console.log(data) // JSON data parsed by `data.json()` call
})
