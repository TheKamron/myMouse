import express from "express";
import http from "http";
import { Server } from "socket.io";
import robot from "robotjs";
import { create } from "express-handlebars";
import os from "os"

const app = express();
const server = http.createServer(app)
const io = new Server(server)

const hbs = create({
  defaultLayout: 'main',
  extname: 'hbs',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  }
});

app.use(express.static('public'))

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', "./views");

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

app.get('/', (req, res) => {
    res.render('index', { title: "MyMouse | CONNECT" });
});

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("move", ({ dx, dy }) => {
   const mouse = robot.getMousePos();
  const speed = 3; // bu yerda tezlikni boshqarasiz (1 = normal, 2+ = tezroq)
  robot.moveMouse(mouse.x + dx * speed, mouse.y + dy * speed);
  });

  socket.on("click", (btn) => {
    robot.mouseClick(btn);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

const PORT = 3000
server.listen(PORT, "0.0.0.0", () => {
  const ips = getLocalIPv4s();
  console.log("Server running on:");
  ips.forEach(ip => console.log(`  http://${ip}:${PORT}`));
  console.log("Open one of these addresses on your phone (same Wi-Fi).");
});