const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const robot = require("robotjs");
const os = require("os");
const readline = require("readline");
const path = require("path");
const fs = require("fs");
const util = require("util");
const { execPath } = process;

const isPkg = typeof process.pkg !== "undefined";
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ---------- Helper: copy embedded asset to real tmp dir ----------
function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyAssetToTemp(relPath, destRoot) {
  const src = path.join(__dirname, relPath);
  const dest = path.join(destRoot, relPath);

  ensureDirSync(path.dirname(dest));

  try {
    const data = fs.readFileSync(src);
    fs.writeFileSync(dest, data);
  } catch (err) {
    console.error("Failed to copy asset", relPath, err.message);
  }
}

let servedRoot = null;
if (isPkg) {
  const tmpRoot = path.join(os.tmpdir(), "mymouse-assets-" + (process.pid || "0"));
  servedRoot = tmpRoot;

  const assetsToCopy = [
    "index.html",
    "public/style.css",
    "public/script.js",
    path.join("node_modules", "socket.io", "client-dist", "socket.io.js")
  ];

  ensureDirSync(tmpRoot);

  assetsToCopy.forEach((rel) => {
    const relNormalized = rel.split(path.posix.sep).join(path.sep);
    copyAssetToTemp(relNormalized, tmpRoot);
  });

  app.use("/public", express.static(path.join(servedRoot, "public")));
  app.use("/socket.io", express.static(path.join(servedRoot, "node_modules", "socket.io", "client-dist")));
  
  app.get("/", (req, res) => {
    res.sendFile(path.join(servedRoot, "index.html"));
  });

  // console.log("⚙️ Running inside pkg - assets copied to:", servedRoot);
} else {
  const baseDir = __dirname;
  app.use("/public", express.static(path.join(baseDir, "public")));
  app.use("/socket.io", express.static(path.join(baseDir, "node_modules", "socket.io", "client-dist")));
  app.get("/", (req, res) => res.sendFile(path.join(baseDir, "index.html")));
}


app.get("/__ip__", (req, res) => {
  const nets = os.networkInterfaces();
  let ip = "127.0.0.1";
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) ip = net.address;
    }
  }
  res.send(ip);
});

// === socket ===
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("move", ({ dx, dy }) => {
    const mouse = robot.getMousePos();
    const speed = 2.5;
    robot.moveMouse(mouse.x + dx * speed, mouse.y + dy * speed);
  });

  socket.on("scroll", ({ dy }) => {
    const scrollSpeed = 2;
    robot.scrollMouse(0, Math.round(dy * scrollSpeed));
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
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) ips.push(net.address);
    }
  }
  console.log("\n🌐 Server running on:");
  ips.forEach((ip) => console.log(`  👉 http://${ip}:${PORT}`));
  console.log("\n📱 Telefoningizdagi brauzerda shu manzillardan birini oching.");
  console.log("\n O'chirish uchun ENTER tugmasini bosing...");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.on("line", () => process.exit(0));
});
