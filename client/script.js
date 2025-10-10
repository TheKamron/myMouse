const socket = io()
const pad = document.getElementById("touchpad")
let lastX, lastY

pad.addEventListener("touchstart", (e) => {
  const t = e.touches[0]
  lastX = t.clientX
  lastY = t.clientY
})

pad.addEventListener("touchmove", (e) => {
  e.preventDefault()
  const t = e.touches[0]
  const dx = t.clientX - lastX
  const dy = t.clientY - lastY
  socket.emit("move", { dx, dy })
  lastX = t.clientX
  lastY = t.clientY
})

document.getElementById("clickBtn").addEventListener("click", () => {
  socket.emit("click")
})
