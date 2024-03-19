import { loginUser, registerUser } from './mod'
import './style.css'

document.getElementById("form")!.addEventListener("submit", (e)=>e.preventDefault())
document.getElementById("register")!.addEventListener("click", async (e)=> {
  e.preventDefault()
  const userName = (document.getElementById("username")! as HTMLInputElement).value
  await registerUser(userName, new URL("ws://localhost:5180/register"))
})
document.getElementById("login")!.addEventListener("click", async (e)=> {
  e.preventDefault()
  const userName = (document.getElementById("username")! as HTMLInputElement).value
  await loginUser(userName, new URL("ws://localhost:5180/login"))
})