# socektauthn-client
@socektauthn/client is the browser client of the @socketauthn packages

[![JSR](https://jsr.io/badges/@socketauthn/client)](https://jsr.io/@socketauthn/client) [![JSR Score](https://jsr.io/badges/@socketauthn/client/score)](https://jsr.io/@socketauthn/client)

# socketauthn
The [@socketauthn](https://jsr.io/@socketauthn) family of packages is a combination of this client and a websocket api.

## Concept
The client calls the registerUser function in the browser. It creates a websocket connection to the api endpoint for the registration. The Server sends a registration config for [@simplewebauthn/browser](https://simplewebauthn.dev/)'s startRegistration function on open. The client responses when the authentication in finished.

The same applies when logging in.

## How to use
### Add to your project
#### Using a script tag:
As a module
```html
<script type="module">
    import * as socketauthn from "https://cdn.jsdelivr.net/gh/oxydemeton/socketauthn-client/dist/mod.min.js"
</script>
```
Or single functions
```html
<script type="module">
    import { loginUser, registerUser } from "https://cdn.jsdelivr.net/gh/oxydemeton/socketauthn-client/dist/mod.min.js"
</script>
```

#### Using npm
Install using:
```bash
npx jsr add @socketauthn/client
```

Use in for example a vite project:
```js
import { registerUser, loginUser } from "@socketauthn/client";
```

### Use functions
Keep in mind to close the returned socket connections or close them on the server side!
#### With npm:
```js
import { registerUser, loginUser } from "@socketauthn/client";
registerUser("unique username", "wss://serverip/registerpath")
```
#### In Html
```html
<script type="module">
    import * as socketauthn from "https://cdn.jsdelivr.net/gh/oxydemeton/socketauthn-client/dist/mod.min.js"
    loginUser(...,...)
</script>
```
Or 
```html
<script type="module">
    import { loginUser, registerUser } from "https://cdn.jsdelivr.net/gh/oxydemeton/socketauthn-client/dist/mod.min.js"
    loginUser(...,...)
</script>
```

### Example from this project:
```ts
document.getElementById("form")!.addEventListener("submit", (e)=>e.preventDefault())
document.getElementById("register")!.addEventListener("click", async (e)=> {
  e.preventDefault()
  const userName = (document.getElementById("username")! as HTMLInputElement).value
  const socket = await registerUser(userName, new URL("ws://localhost:5180/register"))
  socket.close()
})
document.getElementById("login")!.addEventListener("click", async (e)=> {
  e.preventDefault()
  const userName = (document.getElementById("username")! as HTMLInputElement).value
  const socket = await loginUser(userName, new URL("ws://localhost:5180/login"))
  socket.close()
})
```
In combination with the index.html