# Proyecto aplicación de Banco

## Descripción

El objetivo es realizar una pequeña aplicación en React o JavaScript con la siguiente funcionalidad:

- Login de usuario
- Mostrar los movimientos de la cuenta del usuario después de hacer login y sus datos personales:
  - Nombre y apellidos
  - DNI
  - Número de cuenta
  - Dirección
- Poder realizar ingresos o retiradas de dinero.
- Poder realizar transferencias a cuentas de otros usuarios
- Puedes apoyarte en el desarrollo que ya hicimos en https://github.com/juanda99/banco-app y en la documentación de Obsidian relacionada.

La aplicación se puede realizar en parejas. En este caso recomiendo el uso de react para que, al trabajar con varios ficheros (componentes) no os solapéis escribiendo el código.

## Servidor

- Se dispone de una base de datos en formato texto (fichero accounts.js).
- El servidor presenta una API para recibir/enviar datos mediante HTTP (GET & POST)
- El servidor se arranca mediante ```npm run start````
- Para documentación sobre la app de servidor, te recomiendo mires los tests (fichero app.test.js)
- Los endpoints relacionados con alteraciones en las cuentas de los usuarios están autenticados con JWT
  - Ver https://jwt.io/

## Requerimientos

- Realiza un fork del repositorio y trabaja en tu propio repositorio. Deberás hacer un commit por cada funcionalidad o error de código que implementes. En caso de hacer el proyecto con otra persona, deberá haber commits de ambos.
- Se valorará que utilices varias tecnologías o que profundices en el uso de alguna. Ejemplos:
  - Realizar la aplicación tanto en React como en JavaScript
  - Uso de algún framwork de CSS
  - En el caso de ser una aplicación en React, el uso de varias páginas (login, ingresos y gastos, transferencias) utilizando por ejemplo [React Router](https://reactrouter.com/en/main)
- En el caso de transferencias, deberás validar en cliente que la cuenta tenga un formato correcto (usando el evento adecuado). Puedes ayudarte del fichero `validateAccount.js`
- Las llamadas a la API deberán contemplar la posibilidades de errores, tal y como aparecen en los tests:

```
➜  npm run test

> bank-server@1.0.0 test
> NODE_ENV=test mocha app.test.js

Server is running on port 3000


  Login endpoint
    ✔ should return account details and token on valid login
    ✔ should return error on invalid credentials

  GET /user
    ✔ should return user data with a valid token
    ✔ should handle unauthorized access with an invalid token
    ✔ should handle invalid token format
    ✔ should handle missing token

  Transfer endpoint
    ✔ should transfer money between accounts
    ✔ should handle insufficient balance error
    ✔ should handle destination account not found
    ✔ should handle unauthorized access

  Movements endpoint
    ✔ should update movements successfully
    ✔ should handle insufficient balance when taking money out
    ✔ should handle unauthorized access


  13 passing (38ms)
```
