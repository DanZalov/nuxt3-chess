import { Socket } from 'socket.io'
import { defineIOHandler } from '../../modules/socket'
import { countableIntersection } from '../../utils/Utilities'

export default defineIOHandler((io) => {
  const newGameRooms: GameGooms = {}
  const classRooms: ClassRooms = {}
  const waitingUsers: Socket[] = []
  io.on('connection', (socket) => {
    console.log('Connected ', socket.id)
    classRooms[socket.id] = { moves: [], class: false }

    socket.on('play', () => {
      console.log(`Server heard from ${socket.id}: play`)
      if (countableIntersection(socket.rooms, Object.keys(newGameRooms))[0]) {
        // next calls
        socket.emit('ready')
      } else {
        // first call
        waitingUsers.push(socket)
        if (waitingUsers.length === 2) {
          const random = Math.random()
          const roomNumber = random.toString()
          newGameRooms[roomNumber] = { moves: [], white: '', black: '' }
          for (const waitingUserSocket of waitingUsers) {
            io.to(waitingUserSocket.id).emit('ready')
            waitingUserSocket.join(roomNumber)
          }
          waitingUsers.pop()
          waitingUsers.pop()
        }
      }
    })

    socket.on('board', () => {
      console.log(`Server heard from ${socket.id}: board`)
      if (classRooms[socket.id].class) {
        // class board
        classRooms[socket.id].class = false
        if (classRooms[socket.id].moves[0]) {
          for (const move of classRooms[socket.id].moves) {
            socket.emit('class move', move)
          }
        }
      } else {
        // game board
        const room = countableIntersection(
          socket.rooms,
          Object.keys(newGameRooms)
        )[0] as string
        if (room) {
          if (newGameRooms[room].moves[0]) {
            // next calls
            newGameRooms[room].white === socket.id
              ? socket.emit('game', true)
              : socket.emit('game', false)
            for (const move of newGameRooms[room].moves) {
              socket.emit('game move', move)
            }
          } else {
            // first call
            const users = io.sockets.adapter.rooms.get(room) as Set<string>
            const usersArr: string[] = []
            for (const user of users) {
              usersArr.push(user)
            }
            usersArr.forEach((user, index) => {
              if (socket.id === user) {
                const white = Math.abs(index - +room) > 0.5 ? true : false
                socket.emit('game', white)
                white
                  ? (newGameRooms[room].white = user)
                  : (newGameRooms[room].black = user)
              }
            })
          }
        }
      }
    })

    socket.on('game move', (move) => {
      console.log(`Server heard from ${socket.id}: `, move)
      const room = countableIntersection(
        socket.rooms,
        Object.keys(newGameRooms)
      )[0] as string
      if (room) {
        socket.broadcast.to(room).emit('game move', move)
        newGameRooms[room].moves.push(move)
        console.log(`Game moves: `, newGameRooms[room].moves)
      }
    })

    socket.on('class', () => {
      console.log(`Server heard from ${socket.id}: class`)
      classRooms[socket.id].class = true
      socket.emit('ready')
    })

    socket.on('class move', (move) => {
      console.log(`Server heard from ${socket.id}: `, move)
      socket.broadcast.to(socket.id).emit('class move', move)
      classRooms[socket.id].moves.push(move)
      console.log(`Class moves: `, classRooms[socket.id].moves)
    })

    socket.on('disconnect', () => {
      console.log(`${socket.id} disconnected`)
      // if (!io.of('/').sockets.size) {
      //   moveHistory = []
      // }
    })
  })
})
