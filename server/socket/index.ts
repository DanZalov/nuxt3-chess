import { defineIOHandler } from '../../modules/socket'

export default defineIOHandler((io) => {
  io.on('connection', (socket) => {
    console.log('Connected ', socket.id)
    socket.on('message', (message) => {
      console.log(`Server heard from ${socket.id}: `, message)
      socket.emit('message', message)
    })
    socket.on('move', (message) => {
      console.log(`Server heard from ${socket.id}: `, message)
      socket.broadcast.emit('move', message)
    })
  })
})
