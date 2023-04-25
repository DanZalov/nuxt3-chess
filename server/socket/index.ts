import { Socket } from 'socket.io'
import { defineIOHandler } from '../../modules/socket'

export default defineIOHandler((io) => {
  let moveHistory: string[] = []
  const gameRooms: string[] = []
  const waitingUsers: Socket[] = []
  io.on('connection', (socket) => {
    console.log('Connected ', socket.id)

    // moveHistory.forEach((move) => {
    //   socket.emit('move', move)
    // })

    socket.on('ready', () => {
      console.log(`Server heard from ${socket.id}: ready`)
      waitingUsers.push(socket)
      if (waitingUsers.length === 2) {
        moveHistory = []
        const random = Math.random()
        const roomNumber = random.toString()
        gameRooms.push(roomNumber)
        for (const waitingUserSocket of waitingUsers) {
          io.to(waitingUserSocket.id).emit('ready')
          waitingUserSocket.join(roomNumber)
        }
        waitingUsers.pop()
        waitingUsers.pop()
      }
    })

    socket.on('board', () => {
      console.log(`Server heard from ${socket.id}: board`)
      for (const room of socket.rooms) {
        if (gameRooms.includes(room)) {
          const users = io.sockets.adapter.rooms.get(room) as Set<string>
          const usersArr: string[] = []
          for (const user of users) {
            usersArr.push(user)
          }
          usersArr.forEach((user, index) => {
            if (socket.id === user) {
              const white = Math.abs(index - +room) > 0.5 ? true : false
              socket.emit('game', white)
            }
          })
          break
        }
      }
    })

    socket.on('message', (message) => {
      console.log(`Server heard from ${socket.id}: `, message)
      socket.emit('message', message)
    })

    socket.on('move', (move) => {
      moveHistory.push(move)
      console.log(`Server heard from ${socket.id}: `, move)
      for (const room of socket.rooms) {
        if (gameRooms.includes(room)) {
          socket.broadcast.to(room).emit('move', move)
          break
        }
      }
    })
    socket.on('disconnect', () => {
      console.log(`${socket.id} disconnected`)
      if (!io.of('/').sockets.size) {
        moveHistory = []
      }
    })
  })
})
