import { loginUser, registerUser } from './mod'
import './style.css'

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
  console.log("Logged in successfully");
  
})