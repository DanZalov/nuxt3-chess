<script setup lang="ts">
import { Piece } from './utils/ShowPossibleMoves'

const initialPosition: PositionState = {
  table: {
    bk: ['e8'],
    wk: ['e1'],
    bq: ['d8'],
    wq: ['d1'],
    br: ['a8', 'h8'],
    wr: ['a1', 'h1'],
    bb: ['c8', 'f8'],
    wb: ['c1', 'f1'],
    bn: ['b8', 'g8'],
    wn: ['b1', 'g1'],
    bp: ['a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7'],
    wp: ['a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'],
  },
  pinned: [],
  whiteMove: true,
  check: [],
  move: {
    piecePosition: '',
    pieceCode: '',
    possibleMoves: [],
    possibleCaptures: [],
  },
  history: [],
  pawnJumped: false,
  tableHistory: [],
  pawnPromotion: false,
}
// const initialPosition: PositionState = {
//   table: {
//     bk: ['g8'],
//     wk: ['h6'],
//     bq: ['d8'],
//     wq: ['c3'],
//     br: ['a8', 'h3'],
//     wr: ['a1', 'g5'],
//     bb: ['c6', 'f4'],
//     wb: ['c1', 'f5'],
//     bn: ['b8', 'h4'],
//     wn: ['b1', 'g1'],
//     bp: ['a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'e6', 'h7'],
//     wp: ['a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'],
//   },
//   pinned: [],
//   whiteMove: false,
//   check: [],
//   move: {
//     piecePosition: '',
//     pieceCode: '',
//     possibleMoves: [],
//     possibleCaptures: [],
//   },
//   history: [
//     ['e3', 'e6'],
//     ['e4', 'e5'],
//     ['d3', 'd6'],
//     ['d4', 'd5'],
//     ['c3', 'c6'],
//     ['c4', 'c5'],
//     ['b3', 'b6'],
//     ['b4', 'b5'],
//     ['a3', 'a6'],
//     ['a4', 'a5'],
//     ['f3', 'f6'],
//     ['f4', 'f5'],
//     ['g3', 'g6'],
//     ['g4', 'g5'],
//     ['h3', 'h6'],
//     ['h4', 'h5'],
//     ['Ra2', 'Ra7'],
//     ['Ra3', 'Ra6'],
//     ['Rh2', 'Rh7'],
//     ['Rhh3', 'Rhh6'],
//     ['e3', 'e6'],
//     ['e4', 'e5'],
//     ['e3', 'e6'],
//     ['e4', 'e5'],
//     ['e3', 'e6'],
//     ['e4', 'e5'],
//   ],
//   pawnJumped: false,
//   tableHistory: [],
//   pawnPromotion: false,
// }
const position = reactive(initialPosition)
savePositionToHistory(position)
position.pinned = searchForPinned(position)
position.check = checkCheck(position)

const socket = useSocket()
onMounted(() => {
  // socket.on('connect', () => {
  // })

  socket.on('move', (message: string) => {
    serverMoveDecoder(position, message)
    console.log('Client heared from server: ', message)
  })

  // socket.on('disconnect', () => {
  // })
})

watch(position.table, () => {
  // const history = position.history
  // const lastMove = history[history.length - 1]
  // socket.emit('move', lastMove[lastMove.length - 1])
  savePositionToHistory(position)
  position.pinned = searchForPinned(position)
  position.check = checkCheck(position)
  mateChecks(position)
  drawChecks(position)
  // const objDiv = document.getElementById('movesHistoryTable') as HTMLElement
  // if (objDiv) {
  //   objDiv.scrollTop = objDiv.scrollHeight
  //   console.log('scrolltry')
  // }
  // console.log('watch')
})

function serverMoveDecoder(position: PositionState, move: string) {
  console.log('move:', move)
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
    console.log('pieceDestination:', pieceDestination)
    const columnsArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const firstLetter = move[0]
    let pieceCode = position.whiteMove ? 'w' : 'b'
    if (columnsArray.includes(firstLetter)) {
      pieceCode += 'p'
    } else {
      pieceCode += firstLetter.toLowerCase()
    }
    console.log('pieceCode:', pieceCode)
    const isCapture = move.includes('x') ? true : false
    console.log('isCapture:', isCapture)
    const moveFirstPart = isCapture
      ? move.split('x')[0]
      : move.split(pieceDestination)[0]
    let piecePositionInfo = ''
    if (moveFirstPart) {
      if (pieceCode[1] === 'p' || moveFirstPart.length > 1) {
        piecePositionInfo = moveFirstPart[moveFirstPart.length - 1]
      }
    }
    console.log('piecePositionInfo:', piecePositionInfo)

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
              console.log(
                key +
                  "'s got promoted to " +
                  convertLetterToPiece(pawnPromotionCode[1])
              )
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
              console.log(key + "'s new position is " + pieceDestination)
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
        console.log(key + ' is been captured on ' + pieceDestination)
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
    <ChessTable :position="position" />
    <MovesHistory :position="position" />
    <!-- <DragTemplate /> -->
  </v-container>
</template>
