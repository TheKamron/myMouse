const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const robot = require("robotjs");
const os = require("os");
const readline = require("readline");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));


// const hbs = exphbs.create({
//   defaultLayout: "main",
//   extname: "hbs",
//   runtimeOptions: {
//     allowProtoPropertiesByDefault: true,
//     allowProtoMethodsByDefault: true,
//   },
// });

// app.engine("hbs", hbs.engine);
// app.set("view engine", "hbs");
// app.set("views", "./views");

function getLocalIPv4s() {
  const ifs = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(ifs)) {
    for (const iface of ifs[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html")); // <-- HBS o‘rniga HTML
});

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("move", ({ dx, dy }) => {
    const mouse = robot.getMousePos();
    const speed = 2.5; // sezgirlik
    robot.moveMouse(mouse.x + dx * speed, mouse.y + dy * speed);
  });

  socket.on("scroll", ({ dy }) => {
  const amount = Math.round(dy * 2);
  const direction = dy > 0 ? -1 : 1; // Mac/Win scroll yo‘nalishi farq qiladi
  robot.scrollMouse(0, direction * Math.abs(amount));
  console.log("scroll:", direction * Math.abs(amount));
});

  socket.on("click", (btn) => {
    robot.mouseClick(btn);
  });


  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, "0.0.0.0", () => {
  const ips = getLocalIPv4s();
  console.log("\n🌐 Server running on:");
  ips.forEach((ip) => console.log(`  👉 http://${ip}:${PORT}`));
  console.log("\n📱 Telefoningizda shu manzillardan birini oching (bir Wi-Fi’da bo‘ling).");
  console.log("\n ------------------------------------------------- \n DIQQAT: Kompyuteringiz va Telefoningiz bir xil \n  Wi-Figa ulanganligiga ishonch hosil qiling! \n ------------------------------------------------- ")
  console.log("\nPress ENTER to exit...");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.on("line", () => process.exit(0));
});