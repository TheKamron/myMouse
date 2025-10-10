import app from "express"
import http from "http"
import { Server } from "socket.io"
import robot from "robotjs"

const app = express()
const server = http.createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
    console.log('user connected')

    socket.on('move', ({x, y}) => {
        const mouse = robot.getMousePos()
        robot.moveMouse(mouse.x + x, mouse.y + y)
    })

    socket.on("left_click", () => {
        robot.mouseClick("left")
    })

    socket.on("right_click", () => {
        robot.mouseClick("right")
    })

    socket.on("disconnect", () => {
        console.log('user disconnected')
    })
})

server.listen(3000, () => {console.log('Server is running on port')})