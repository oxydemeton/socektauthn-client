import { startAuthentication, startRegistration } from "@simplewebauthn/browser";

export async function registerUser(userName: string, path: URL | string) {
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
    console.info("Socket closed: ", ev.reason)
  }
}

export async function loginUser(userName: string, path: URL | string) {
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
    console.info("Socket closed: ", ev.reason)
  }
}