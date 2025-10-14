// // script.js
// const socket = io();
// const pad = document.getElementById("pad");
// const leftBtn = document.getElementById("leftBtn");
// const rightBtn = document.getElementById("rightBtn");
// const calibrateBtn = document.getElementById("calibrate");
// const sensRange = document.getElementById("sensitivity");
// const sensVal = document.getElementById("sensVal");
// const statText = document.getElementById("statText");

// let lastX = null;
// let lastY = null;
// let pointerDown = false;
// let accelX = 0;
// let accelY = 0;
// let sendScheduled = false;
// let queuedDx = 0;
// let queuedDy = 0;

// const sensitivity = () => parseFloat(sensRange.value || 2);

// // show sensitivity
// sensRange.addEventListener("input", () => {
//   sensVal.innerText = parseFloat(sensRange.value).toFixed(1);
// });

// // pointer handling (works for touch & mouse)
// pad.addEventListener("pointerdown", (e) => {
//   pointerDown = true;
//   lastX = e.clientX;
//   lastY = e.clientY;
//   pad.setPointerCapture(e.pointerId);
// });

// pad.addEventListener("pointermove", (e) => {
//   if (!pointerDown) return;
//   const dx = e.clientX - lastX;
//   const dy = e.clientY - lastY;
//   lastX = e.clientX;
//   lastY = e.clientY;

//   // accumulate dx/dy to send latest on rAF
//   queuedDx += dx;
//   queuedDy += dy;

//   if (!sendScheduled) {
//     sendScheduled = true;
//     requestAnimationFrame(sendMove);
//   }
// });

// pad.addEventListener("pointerup", (e) => {
//   pointerDown = false;
//   lastX = null;
//   lastY = null;
//   queuedDx = 0;
//   queuedDy = 0;
// });

// // Fallback: touchstart/touchmove handled by pointer events above in modern browsers

// function sendMove() {
//   sendScheduled = false;
//   // get and reset queued values
//   const dx = queuedDx;
//   const dy = queuedDy;
//   queuedDx = 0;
//   queuedDy = 0;

//   if (dx === 0 && dy === 0) return;

//   // send scaled dx/dy (we invert Y to match screen coords)
//   socket.emit("move", { dx: dx * sensitivity(), dy: dy * sensitivity() });
// }

// // Clicks
// leftBtn.addEventListener("touchstart", (e) => { e.preventDefault(); socket.emit("click", "left"); }, {passive:false});
// leftBtn.addEventListener("click", () => socket.emit("click", "left"));

// rightBtn.addEventListener("touchstart", (e) => { e.preventDefault(); socket.emit("click", "right"); }, {passive:false});
// rightBtn.addEventListener("click", () => socket.emit("click", "right"));

// // Calibrate
// calibrateBtn.addEventListener("click", () => {
//   socket.emit("calibrate");
// });

// // socket status
// socket.on("connect", () => { statText.innerText = "Connected"; });
// socket.on("disconnect", () => { statText.innerText = "Disconnected"; });