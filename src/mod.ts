import { startAuthentication, startRegistration } from "@simplewebauthn/browser";

/**Register a new user.
 * @param userName Specifies the unique user name that a new user wants. Can be an email for example
 * @param path a url to the register endpoint of your socketauthn api
 * @throws Throws an error when the registration fails
 * 
 * @example
 * ```ts
 * document.getElementById("register")!.addEventListener("click", async (e)=> {
 *   e.preventDefault()
 *   const userName = (document.getElementById("username")! as HTMLInputElement).value
 *   await registerUser(userName, new URL("ws://localhost:5180/register"))
 * })
 * ```
 */
export async function registerUser(userName: string, path: URL | string): Promise<void> {
  return new Promise<void>((res, _rej) => {
    const server = new URL(path)
    if (!server.protocol.startsWith("ws")) throw new Error(`Invalid protocol for url: ${server}`)

    server.searchParams.append("username", userName)
    const socket = new WebSocket(server)
    socket.onmessage = async (ev) => {
      const serverConfig = JSON.parse(ev.data)
      let attResp;
      try {
        // Pass the options to the authenticator and wait for a response
        attResp = await startRegistration(serverConfig);
      } catch (error: any) {
        //TODO: error handling
        throw error;
      }
      socket.send(JSON.stringify(attResp))
    }
    socket.onerror = (ev) => {
      console.log("Ws onerror: ", ev);
    }
    socket.onclose = (ev) => {
      res()
      console.info("Socket closed: ", ev.reason)
    }
  })
}

/**Login  an existing user.
 * @param userName Specifies the unique user name that is assigned to a user
 * @param path a url to the login endpoint of your socketauthn api
 * @throws Throws an error when the login fails
 * 
 * @example
```ts
 * document.getElementById("login")!.addEventListener("click", async (e)=> {
 *   e.preventDefault()
 *   const userName = (document.getElementById("username")! as HTMLInputElement).value
 *   await loginUser(userName, new URL("ws://localhost:5180/login"))
 * })
 * ```
 */
export async function loginUser(userName: string, path: URL | string): Promise<void> {
  return new Promise<void>((res, _rej) => {
    const server = new URL(path)
    if (!server.protocol.startsWith("ws")) throw new Error(`Invalid protocol for url: ${server}`)

    server.searchParams.append("username", userName)
    const socket = new WebSocket(server)

    socket.onmessage = async (ev) => {
      const serverConfig = JSON.parse(ev.data)
      let attResp;
      try {
        // Pass the options to the authenticator and wait for a response
        attResp = await startAuthentication(serverConfig);
      } catch (error: any) {
        //TODO: error handling
        throw error;
      }
      socket.send(JSON.stringify(attResp))
    }
    socket.onerror = (ev) => {
      console.log("Ws onerror: ", ev);
    }
    socket.onclose = (ev) => {
      res()
      console.info("Socket closed: ", ev.reason)
    }
  })
}