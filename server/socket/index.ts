import { defineIOHandler } from '../../modules/socket'

export default defineIOHandler((io) => {
  let moveHistory: string[] = []
  let game = false
  io.on('connection', (socket) => {
    console.log('Connected ', socket.id)
    socket.join(socket.id)
    if (io.of('/').sockets.size > 1 && !game) {
      moveHistory = []
      game = true
      const random = Math.random()
      let i = 0
      for (let [id, socket] of io.of('/').sockets) {
        const white = Math.abs(i - random) > 0.5 ? true : false
        io.to(id).emit('game', white)
        i++
        console.log(`game ${id}:`, white)
      }
    } else {
      moveHistory.forEach((move) => {
        socket.emit('move', move)
      })
    }

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
