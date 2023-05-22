import { Socket } from 'socket.io'
import socket, { defineIOHandler } from '../../modules/socket'
import { countableIntersection } from '../../utils/Utilities'

export default defineIOHandler((io) => {
  const sessions: Sessions = {}
  const gameRooms: GameRooms = {}
  const classRooms: ClassRooms = {}
  const waitingUsers: Socket[] = []

  io.on('connection', (socket) => {
    socket.on('session', (sessionID) => {
      if (sessionID && Object.keys(sessions).includes(sessionID)) {
        // find existing session
        socket.sessionID = sessionID
        sessions[socket.sessionID].online = true
        sessions[socket.sessionID].time = Date.now()
      } else {
        // create new session
        socket.sessionID = socket.id
        sessions[socket.sessionID] = { online: true, time: Date.now() }
        classRooms[socket.sessionID] = { moves: [], class: false }
      }
      socket.emit('session', socket.sessionID)
      console.log(`Connected ${socket.id}\nSession: `, socket.sessionID)
      for (const [key, value] of Object.entries(gameRooms)) {
        if (
          socket.sessionID === value.white ||
          socket.sessionID === value.black
        ) {
          socket.join(key)
        }
      }
    })

    socket.on('play', () => {
      console.log(`Server heard from ${socket.sessionID}: play`)
      classRooms[socket.sessionID].class = false
      if (countableIntersection(socket.rooms, Object.keys(gameRooms))[0]) {
        // next calls
        socket.emit('ready')
      } else {
        // first call
        waitingUsers.push(socket)
        if (waitingUsers.length === 2) {
          if (waitingUsers[0] === waitingUsers[1]) {
            // prevent self-gaming
            waitingUsers.pop()
          } else {
            const random = Math.random()
            const roomNumber = random.toString()
            gameRooms[roomNumber] = { moves: [], white: '', black: '' }
            for (const waitingUserSocket of waitingUsers) {
              io.to(waitingUserSocket.id).emit('ready')
              waitingUserSocket.join(roomNumber)
            }
            waitingUsers.pop()
            waitingUsers.pop()
          }
        }
      }
    })

    socket.on('board', () => {
      console.log(`Server heard from ${socket.sessionID}: board`)
      if (
        classRooms[socket.sessionID]?.class ||
        waitingUsers.includes(socket)
      ) {
        // class board
        if (waitingUsers.includes(socket)) {
          const index = waitingUsers.indexOf(socket)
          waitingUsers.splice(index, 1)
        }
        if (classRooms[socket.sessionID].moves[0]) {
          for (const move of classRooms[socket.sessionID].moves) {
            socket.emit('class move', move)
          }
        }
      } else {
        // game board
        const room = countableIntersection(
          socket.rooms,
          Object.keys(gameRooms)
        )[0] as string
        if (room) {
          if (gameRooms[room].moves[0]) {
            // next calls
            gameRooms[room].white === socket.sessionID
              ? socket.emit('game', true)
              : socket.emit('game', false)
            for (const move of gameRooms[room].moves) {
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
                  ? (gameRooms[room].white = socket.sessionID)
                  : (gameRooms[room].black = socket.sessionID)
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
        Object.keys(gameRooms)
      )[0] as string
      if (room) {
        socket.broadcast.to(room).emit('game move', move)
        gameRooms[room].moves.push(move)
        console.log(`Game moves: `, gameRooms[room].moves)
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

    socket.on('restart board', () => {
      console.log(`Server heard from ${socket.sessionID}: restart board`)
      classRooms[socket.sessionID].moves = []
    })

    socket.on('game over', () => {
      console.log(`Server heard from ${socket.sessionID}: game over`)
      const room = countableIntersection(
        socket.rooms,
        Object.keys(gameRooms)
      )[0]
      socket.leave(room)
      gameRooms[room].white === socket.sessionID
        ? (gameRooms[room].white = '')
        : (gameRooms[room].black = '')
    })

    socket.on('player left', () => {
      console.log(`Server heard from ${socket.sessionID}: player left`)
      const room = countableIntersection(
        socket.rooms,
        Object.keys(gameRooms)
      )[0]
      socket.broadcast.to(room).emit('opponent left')
      io.in(room).disconnectSockets(true)
      delete gameRooms[room]
    })

    socket.on('disconnect', () => {
      console.log(`${socket.id} disconnected\nSession: `, socket.sessionID)
      if (waitingUsers.includes(socket)) {
        const index = waitingUsers.indexOf(socket)
        waitingUsers.splice(index, 1)
      }
      sessions[socket.sessionID].online = false
      sessions[socket.sessionID].time = Date.now()
    })

    setInterval(() => {
      // cleaner
      const currentTime = Date.now()
      for (const session of Object.keys(sessions)) {
        if (currentTime - sessions[session].time > 86400000) {
          console.log('Session cleaned:', session)
          delete sessions[session]
          delete classRooms[session]
          for (const room of Object.keys(gameRooms)) {
            if (
              gameRooms[room].white === session ||
              gameRooms[room].black === session
            ) {
              delete gameRooms[room]
            }
          }
        }
      }
    }, 86400000)
  })
})
