import { Socket } from 'socket.io'
import socket, { defineIOHandler } from '../../modules/socket'
import { countableIntersection } from '../../utils/Utilities'

export default defineIOHandler((io) => {
  const sessions: string[] = []
  const newGameRooms: GameGooms = {}
  const classRooms: ClassRooms = {}
  const waitingUsers: Socket[] = []

  // io.use((socket, next) => {
  //   const sessionID = socket.handshake.auth.sessionID
  //   if (sessionID) {
  //     // find existing session
  //     if (sessions.includes(sessionID)) {
  //       socket.sessionID = sessionID
  //       return next()
  //     }
  //   }
  //   // create new session
  //   socket.sessionID = socket.id
  //   sessions.push(sessionID)
  //   next()
  // })

  io.on('connection', (socket) => {
    socket.on('session', (sessionID) => {
      if (sessionID) {
        // find existing session
        if (sessions.includes(sessionID)) {
          socket.sessionID = sessionID
        }
      } else {
        // create new session
        socket.sessionID = socket.id
        sessions.push(socket.sessionID)
        classRooms[socket.sessionID] = { moves: [], class: false }
      }
      socket.emit('session', socket.sessionID)
      console.log(`Connected ${socket.id}\nSession: `, socket.sessionID)
    })

    socket.on('play', () => {
      console.log(`Server heard from ${socket.sessionID}: play`)
      classRooms[socket.sessionID].class = false
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
      console.log(`Server heard from ${socket.sessionID}: board`)
      if (classRooms[socket.sessionID]?.class) {
        // class board
        if (classRooms[socket.sessionID].moves[0]) {
          for (const move of classRooms[socket.sessionID].moves) {
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
            newGameRooms[room].white === socket.sessionID
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
                  ? (newGameRooms[room].white = socket.sessionID)
                  : (newGameRooms[room].black = socket.sessionID)
              }
            })
          }
        }
      }
    })

    socket.on('game move', (move) => {
      console.log(`Server heard from ${socket.sessionID}: `, move)
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
      console.log(`Server heard from ${socket.sessionID}: class`)
      classRooms[socket.sessionID].class = true
      socket.emit('ready')
    })

    socket.on('class move', (move) => {
      console.log(`Server heard from ${socket.sessionID}: `, move)
      socket.broadcast.to(socket.id).emit('class move', move)
      classRooms[socket.sessionID].moves.push(move)
      console.log(`Class moves: `, classRooms[socket.sessionID].moves)
    })

    socket.on('disconnect', () => {
      console.log(`${socket.id} disconnected\nSession: `, socket.sessionID)
      // if (!io.of('/').sockets.size) {
      //   moveHistory = []
      // }
    })
  })
})
