/*

This validateAccountNumber function implements a simple checksum algorithm:

1. It first checks if the account number is exactly 8 digits long and consists of only digits.
2. Then it converts the account number to an array of digits.
3. It applies the checksum algorithm by doubling every other digit and subtracting 9 if the result is greater than 9.
4. It sums up all the digits after applying the algorithm.
5. Finally, it checks if the sum is divisible by 10. If it is, the account number is considered valid.

*/

function validateAccountNumber(accountNumber) {
  // Check if the account number is 8 digits long
  if (accountNumber.length !== 8 || !/^\d+$/.test(accountNumber)) {
    return false // Invalid format
  }

  // Convert the account number to an array of digits
  const digits = accountNumber.split('').map(Number)

  // Apply the checksum algorithm
  const checksum = digits.reduce((accumulator, currentValue, index) => {
    if (index % 2 === 0) {
      currentValue *= 2
      if (currentValue > 9) {
        currentValue -= 9
      }
    }
    return accumulator + currentValue
  }, 0)

  // If the checksum is divisible by 10, the account number is valid
  return checksum % 10 === 0
}

// Example usage:
const accountNumber = '12345678'
if (validateAccountNumber(accountNumber)) {
  console.log('Account number is valid.')
} else {
  console.log('Account number is invalid.')
}
