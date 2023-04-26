<script setup lang="ts">
import { Piece } from '../utils/ShowPossibleMoves'
const game = reactive({ game: false, white: true } as GameOptions)
const position = reactive(initialPosition())
savePositionToHistory(position)
position.pinned = searchForPinned(position)
position.check = checkCheck(position)
// const loading = ref(false)

const socket = useSocket()
onMounted(() => {
  socket.emit('board')
  // socket.on('connect', () => {
  // })

  socket.on('game move', (move: string) => {
    if (game.game) {
      serverMoveDecoder(position, move)
      console.log('Client heared from server: ', move)
    }
  })

  socket.on('class move', (move: string) => {
    if (!game.game) {
      serverMoveDecoder(position, move)
      console.log('Client heared from server: ', move)
    }
  })

  socket.on('game', (white: boolean) => {
    game.game = true
    game.white = white
    console.log('Client heared from server: ', white)
  })

  // socket.on('disconnect', () => {
  // })
})

onUnmounted(() => {
  socket.off('game move')
  socket.off('class move')
  socket.off('game')
})

watch(game, () => {
  const initial = initialPosition()
  Object.assign(position, initial)
  savePositionToHistory(position)
})

watch(position.table, () => {
  savePositionToHistory(position)
  position.pinned = searchForPinned(position)
  position.check = checkCheck(position)
  mateChecks(position)
  drawChecks(position)
  // console.log('watch')
})

function serverMoveDecoder(position: PositionState, move: string) {
  position.pawnJumped = false

  if (move.includes('O')) {
    //castling
    if (move === 'O-O-O') {
      if (position.whiteMove) {
        position.table.wk[0] = 'c1'
        const index = position.table.wr.indexOf('a1')
        position.table.wr[index] = 'd1'
      } else {
        position.table.bk[0] = 'c8'
        const index = position.table.br.indexOf('a8')
        position.table.br[index] = 'd8'
      }
    } else {
      if (position.whiteMove) {
        position.table.wk[0] = 'g1'
        const index = position.table.wr.indexOf('h1')
        position.table.wr[index] = 'f1'
      } else {
        position.table.bk[0] = 'g8'
        const index = position.table.br.indexOf('h8')
        position.table.br[index] = 'f8'
      }
    }
  } else {
    let pieceDestination: string
    let pawnPromotionCode = ''
    if (move.includes('=')) {
      pieceDestination =
        move[move.length - 1] === '+' ? move.slice(-5, -3) : move.slice(-4, -2)
      pawnPromotionCode = position.whiteMove ? 'w' : 'b'
      pawnPromotionCode +=
        move[move.length - 1] === '+'
          ? move[move.length - 2].toLowerCase()
          : move[move.length - 1].toLowerCase()
    } else {
      pieceDestination =
        move[move.length - 1] === '+' ? move.slice(-3, -1) : move.slice(-2)
    }
    const columnsArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const firstLetter = move[0]
    let pieceCode = position.whiteMove ? 'w' : 'b'
    if (columnsArray.includes(firstLetter)) {
      pieceCode += 'p'
    } else {
      pieceCode += firstLetter.toLowerCase()
    }
    const isCapture = move.includes('x') ? true : false
    const moveFirstPart = isCapture
      ? move.split('x')[0]
      : move.split(pieceDestination)[0]
    let piecePositionInfo = ''
    if (moveFirstPart) {
      if (pieceCode[1] === 'p' || moveFirstPart.length > 1) {
        piecePositionInfo = moveFirstPart[moveFirstPart.length - 1]
      }
    }

    let enPassant = isCapture ? true : false
    for (const [key, value] of Object.entries(position.table)) {
      if (key === pieceCode) {
        for (const loopPiecePosition of value) {
          const piece = convertLetterToPiece(key[1]) as Piece
          const moves = showPossibleMoves({
            position,
            row: loopPiecePosition[1],
            column: loopPiecePosition[0],
            isWhite: position.whiteMove,
            piece,
          })
          if (
            pawnPromotionCode &&
            (!piecePositionInfo ||
              loopPiecePosition.includes(piecePositionInfo))
          ) {
            const requiredRow = position.whiteMove ? '7' : '2'
            if (loopPiecePosition[1] === requiredRow) {
              const index = value.indexOf(loopPiecePosition)
              value.splice(index, 1)
              break
            }
          } else if (
            (!isCapture && moves.possibleMoves.includes(pieceDestination)) ||
            (isCapture &&
              (moves.possibleCaptures.includes(pieceDestination) ||
                moves.target.includes(pieceDestination)))
          ) {
            if (
              !piecePositionInfo ||
              loopPiecePosition.includes(piecePositionInfo)
            ) {
              const index = value.indexOf(loopPiecePosition)
              value[index] = pieceDestination
              if (
                key[1] === 'p' &&
                Math.abs(+loopPiecePosition[1] - +pieceDestination[1]) === 2
              ) {
                position.pawnJumped = true
                break
              }
            }
          }
        }
      }
      if (isCapture && value.includes(pieceDestination) && key !== pieceCode) {
        const index = value.indexOf(pieceDestination)
        value.splice(index, 1)
        enPassant = false
      }
      if (pawnPromotionCode && key === pawnPromotionCode) {
        value.push(pieceDestination)
      }
    }
    if (enPassant) {
      if (position.whiteMove) {
        const index = position.table.bp.indexOf(pieceDestination[0] + '5')
        position.table.bp.splice(index, 1)
      } else {
        const index = position.table.wp.indexOf(pieceDestination[0] + '4')
        position.table.bp.splice(index, 1)
      }
    }
  }

  const history = position.history
  if (position.whiteMove) {
    history.push([move])
  } else {
    const lastMove = history[history.length - 1]
    if (lastMove) {
      lastMove.push(move)
    } else {
      history.push(['', move])
    }
  }
  position.whiteMove = !position.whiteMove
}
</script>

<template>
  <v-container class="d-flex flex-row justify-center">
    <ChessTable :position="position" :game="game" />
    <MovesHistory :position="position" />
    <!-- <DragTemplate /> -->
    <!-- <Loader :loading="loading" /> -->
  </v-container>
</template>
