import { defineIOHandler } from '../../modules/socket'

export default defineIOHandler((io) => {
  let moveHistory: string[] = []
  io.on('connection', (socket) => {
    console.log('Connected ', socket.id)
    moveHistory.forEach((move) => {
      socket.emit('move', move)
    })

    socket.on('message', (message) => {
      console.log(`Server heard from ${socket.id}: `, message)
      socket.emit('message', message)
    })

    socket.on('move', (message) => {
      moveHistory.push(message)
      console.log(`Server heard from ${socket.id}: `, message)
      socket.broadcast.emit('move', message)
    })
    socket.on('disconnect', () => {
      console.log(`${socket.id} disconnected`)
      if (!io.of('/').sockets.size) {
        moveHistory = []
      }
    })
  })
})
