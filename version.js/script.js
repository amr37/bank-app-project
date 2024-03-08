// Elementos del DOM
const labelWelcome = document.querySelector(".welcome");
const labelcuenta = document.querySelector(".names");
const labelerror = document.querySelector(".alert-warning");
const labelID = document.querySelector(".idnumber");
const labeladdres = document.querySelector(".address");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");


const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

// Constantes para las URL del servidor
const SERVER_URL = "http://localhost:4000/login?";
let token

// Event listener para el botón de inicio de sesión
btnLogin.addEventListener("click", async function validarDatos(e) {
  // Evitar que el formulario se envíe
  e.preventDefault();
  // Obtener los valores ingresados en los campos de usuario y PIN
  const username = inputLoginUsername.value;
  const pin = inputLoginPin.value;
  // Construir la URL para iniciar sesion
  const url = `${SERVER_URL}username=${username}&pin=${pin}`;

  const loginData = await fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((data) => data);

  const { account,  message } = loginData;
  token = loginData.token;
  //mostrar la aplicación y los datos de la cuenta
  if (!message) {
    console.log("Login correcto");
    containerApp.style.opacity = 1;
    labelWelcome.textContent = `Bienvenido, ${account.owner}`;
    labelcuenta.textContent = `Número de cuenta: ${account.numberAccount}`;
    labeladdres.textContent = `Dirección: ${account.address} `;
    labelID.textContent = `DNI: ${account.nationalIdNumber}`;
    labelWelcome.style.opacity = 1;
    labelcuenta.style.opacity = 1;
    labeladdres.style.opacity = 1;
    labelID.style.opacity = 1;
    labelerror.style.opacity = 0;
    inputLoginUsername.style.opacity = 0; // Ocultar el campo de usuario
    inputLoginPin.style.opacity = 0; // Ocultar el campo de PIN
    btnLogin.style.opacity = 0; // Ocultar la flecha de login
    inputLoginPin.blur(); // Quitar el campo de PIN
    const { movements } = account;
    updateUI(movements);
  } else {
    console.log("Usuario o contraseña incorrectos");
    labelerror.style.opacity = 1;
  }
});
function updateUI(movements) {
  displayMovements(movements);
  displayBalance(movements);
  displaySummary(movements);
}



function displayMovements(movements) {
  containerMovements.innerHTML = "";
  console.log(movements);
  movements.forEach(function (mov, i) {
    const type = mov.amount > 0 ? "deposit" : "withdraw";
    const html = `
        <div class="movements__row">
        <div class="movements__date"> ${mov.date}</div>
        <div class="movements__type movements__type--${type} €">${
          i + 1
        } ${type}</div>          
          <div class="movements__value">${mov.amount} €</div>
        </div>
      `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
}

const displayBalance = function (movements) {
  const balance = movements.reduce((acc, mov) => acc + mov.amount, 0);
  labelBalance.textContent = `${balance.toFixed(2)}€`;
};

const displaySummary = function (movements) {
  const sumIn = movements
    .filter((mov) => mov.amount > 0)
    .reduce((acc, mov) => acc + mov.amount, 0);
  labelSumIn.textContent = `${sumIn.toFixed(2)}€`;

  const sumOut = movements
    .filter((mov) => mov.amount < 0)
    .reduce((acc, mov) => acc + mov.amount, 0);
  labelSumOut.textContent = `${Math.abs(sumOut).toFixed(2)}€`;
};


// Incluir la función postData
async function postData(url = "", data = {}, token) {
  try {
    // Incluir el token en la URL
    const response = await fetch(`${url}?token=${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    throw new Error(`Error al realizar la solicitud POST: ${error.message}`);
  }
}

// función depositdinero


  
async function depositMoney(amount, token) {
  try {
    const response = await postData(
      `http://localhost:4000/movements?token=${token}`,
      {
        amount: amount,
        date: new Date().toISOString(),
      },
    );
    console.log(response); // Ver la respuesta del servidor
  } catch (error) {
    console.error("Error al realizar el ingreso:", error);
  }
}

// Función para transferir dinero
async function transferMoney(accountNumber, amount, token) {
  try {
    const response = await postData(
      `http://localhost:4000/transfer`,
      {
        toAccount: accountNumber,
        amount: amount,
        date: new Date().toISOString(),
      },token
    );
    console.log(response); // Ver la respuesta del servidor
    updateUI(response.movements); // Actualizar la interfaz con los nuevos movimientos
  } catch (error) {
    console.error("Error al realizar la transferencia:", error);
  }
}
// Event listener para el botón de transferencia
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const transferAccount = inputTransferTo.value;
  const transferAmount = parseFloat(inputTransferAmount.value);

  if (transferAccount && !isNaN(transferAmount) && transferAmount > 0) {
    transferMoney(transferAccount, transferAmount, token);
  } else {
    alert('Invalid transfer details');
  }
});

// ...

// Función para depositar dinero
async function depositMoney(amount, token) {
  try {
    const response = await postData(
      `http://localhost:4000/movements`,
      {
        amount: amount,
        date: new Date().toISOString(),
      },
      token
    );
    console.log(response); // Ver la respuesta del servidor
    updateUI(response.movements); // Actualizar la interfaz con los nuevos movimientos
  } catch (error) {
    console.error("Error al realizar el depósito:", error);
  }
}
// Event listener para el botón de depósito
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const loanAmount = parseFloat(inputLoanAmount.value);

  if (!isNaN(loanAmount) && loanAmount > 0) {
    depositMoney(loanAmount, token);
  } else {
    alert('Invalid loan amount');
  }
});
// ...

// Actualizar la interfaz con los movimientos y saldo actualizado
function updateUI(movements) {
  displayMovements(movements);
  displayBalance(movements);
  displaySummary(movements);
}


// funcion para de salir del programa
function logout() {
  currentUser = null
  document.getElementById('login-container').style.display = 'block'
  document.getElementById('user-container').style.display = 'none'
}
