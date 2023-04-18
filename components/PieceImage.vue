<script setup lang="ts">
import { Piece } from '~~/utils/ShowPossibleMoves'
const props = defineProps<{
  position: PositionState
  row: string
  column: string
}>()
const socket = useSocket()
const pieceCode = computed(() => getPieceCode())
const pawnPromotion = ref(false)
const showOnClick = ref(true)

function getPieceCode() {
  for (const [key, value] of Object.entries(props.position.table)) {
    if (value.includes(props.column + props.row)) {
      return key
    }
  }
}

function clickHandler(isWhite: boolean, piece: Piece) {
  let successfulCapture: boolean = false
  if (props.position.move.piecePosition[0]) {
    //cannot capture a king
    piece === Piece.king
      ? clearMove(props.position)
      : (successfulCapture = finalCaptureHandler())
  }
  if (!successfulCapture) {
    showMoves(isWhite, piece)
  }
}

function showMoves(isWhite: boolean, piece: Piece) {
  if (props.position.whiteMove === isWhite) {
    const moves = showLegalMoves({
      position: props.position,
      row: props.row,
      column: props.column,
      isWhite,
      piece,
    })
    if (moves.possibleMoves[0] || moves.possibleCaptures[0]) {
      //don't fill if empty
      fillMove(props.position, props.row, props.column, moves, piece)
    }
    console.log(props.position)
  }
}

function finalMoveHandler() {
  function castlingHandler(
    kingsAim: string,
    rooksAim: string,
    rooksPosition: string,
    record: string
  ) {
    const lastMove = props.position.history[props.position.history.length - 1]
    if (props.position.whiteMove) {
      props.position.table.wk[0] = kingsAim
      const index = props.position.table.wr.indexOf(rooksPosition)
      props.position.table.wr[index] = rooksAim
      props.position.history.push([record])
    } else {
      props.position.table.bk[0] = kingsAim
      const index = props.position.table.br.indexOf(rooksPosition)
      props.position.table.br[index] = rooksAim
      lastMove
        ? lastMove.push(record)
        : props.position.history.push(['', record])
    }
    clearMove(props.position)
    props.position.whiteMove = !props.position.whiteMove
    props.position.pawnJumped = false
    socket.emit('move', record)
  }

  if (pawnPromotionCheck(props.position, props.row)) {
    pawnPromotion.value = true
    props.position.pawnPromotion = true
    return
  }

  let pawnJumped: boolean = false
  for (const value of Object.values(props.position.table)) {
    if (value.includes(props.position.move.piecePosition)) {
      if (props.position.move.pieceCode[1] === 'p') {
        if (
          (props.position.move.piecePosition[1] === '2' && props.row === '4') ||
          (props.position.move.piecePosition[1] === '7' && props.row === '5')
        ) {
          pawnJumped = true
        }
      }

      if (props.position.move.pieceCode[1] === 'k') {
        //castling handler
        if (
          props.position.move.piecePosition === 'e1' &&
          props.position.whiteMove
        ) {
          if (props.column + props.row === 'c1') {
            castlingHandler('c1', 'd1', 'a1', 'O-O-O')
            return
          } else if (props.column + props.row === 'g1') {
            castlingHandler('g1', 'f1', 'h1', 'O-O')
            return
          }
        } else if (
          props.position.move.piecePosition === 'e8' &&
          !props.position.whiteMove
        ) {
          if (props.column + props.row === 'c8') {
            castlingHandler('c8', 'd8', 'a8', 'O-O-O')
            return
          } else if (props.column + props.row === 'g8') {
            castlingHandler('g8', 'f8', 'h8', 'O-O')
            return
          }
        }
      }
      const move = changeTable(
        props.position,
        props.row,
        props.column,
        value,
        false
      )
      socket.emit('move', move)
      props.position.pawnJumped = pawnJumped
      return
    }
  }
}

function finalCaptureHandler() {
  // used changing state
  for (const capture of props.position.move.possibleCaptures) {
    if (capture === props.column + props.row) {
      for (const [key, value] of Object.entries(props.position.table)) {
        if (value.includes(capture) && key !== props.position.move.pieceCode) {
          const index = value.indexOf(capture)
          value.splice(index, 1)
        }
        if (value.includes(props.position.move.piecePosition)) {
          if (pawnPromotionCheck(props.position, props.row)) {
            pawnPromotion.value = true
            props.position.pawnPromotion = true
            return true
          }
          const move = changeTable(
            props.position,
            props.row,
            props.column,
            value,
            true
          )
          socket.emit('move', move)
        }
      }
      props.position.pawnJumped = false
      return true
    }
  }
  clearMove(props.position)
  return false
}

function finalPawnPromotionHandler(event: Event) {
  const isCapture =
    props.column + props.row === props.position.move.possibleMoves[0]
      ? false
      : true
  const eventTarget = JSON.stringify(event).slice(1, 3)
  for (const [key, value] of Object.entries(props.position.table)) {
    if (key === eventTarget) {
      value.push(props.column + props.row)
    }
    if (value.includes(props.position.move.piecePosition)) {
      const index = value.indexOf(props.position.move.piecePosition)
      value.splice(index, 1)
      writeHistory(props.position, props.row, props.column, isCapture)
      const lastMove = props.position.history[props.position.history.length - 1]
      lastMove[lastMove.length - 1] += '=' + eventTarget[1].toUpperCase()
      clearMove(props.position)
      props.position.whiteMove = !props.position.whiteMove
      props.position.pawnJumped = false
      pawnPromotion.value = false
      props.position.pawnPromotion = false
      socket.emit('move', lastMove[lastMove.length - 1])
      console.log(props.position)
    }
  }
}

function enPassant() {
  // used changing state
  const lastMove = props.position.history[props.position.history.length - 1]
  const jumpedPiecePosition = lastMove[lastMove.length - 1]
  for (const value of Object.values(props.position.table)) {
    if (value.includes(props.position.move.piecePosition)) {
      socket.emit(
        'move',
        props.position.move.piecePosition[0] + 'x' + props.column + props.row
      )
      changeTable(props.position, props.row, props.column, value, true)
      props.position.pawnJumped = false
    }
    if (value.includes(jumpedPiecePosition)) {
      const index = value.indexOf(jumpedPiecePosition)
      value.splice(index, 1)
    }
  }
}

function Message(event: MouseEvent) {
  console.log(event.target)
}

function onMouseDown(event: MouseEvent, isWhite: boolean, piece: Piece) {
  showMoves(isWhite, piece)
  const pieceImg = event.target as HTMLElement
  const parent = pieceImg.parentElement as HTMLElement
  pieceImg.style.position = 'absolute'
  pieceImg.style.zIndex = '1000'
  document.body.append(pieceImg)

  moveAt(event.pageX, event.pageY)

  function moveAt(pageX: number, pageY: number) {
    pieceImg.style.left = pageX - pieceImg.offsetWidth / 2 + 'px'
    pieceImg.style.top = pageY - pieceImg.offsetHeight / 2 + 'px'
  }

  function onMouseMove(event: MouseEvent) {
    moveAt(event.pageX, event.pageY)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', OnMouseUp)

  function OnMouseUp(event: MouseEvent) {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', OnMouseUp)
    pieceImg.style.position = 'static'
    pieceImg.style.zIndex = '0'
    parent.append(pieceImg)
    const element = document.elementFromPoint(
      event.pageX,
      event.pageY
    ) as HTMLElement
    if (element) {
      element.click()
      if (
        !props.position.pawnPromotion &&
        (pieceImg !== element || !showOnClick.value)
      ) {
        clearMove(props.position)
        showOnClick.value = true
      } else {
        showOnClick.value = false
      }
    } else {
      clearMove(props.position)
    }
  }
}
</script>

<template>
  <div>
    <img
      v-if="pieceCode === 'wk'"
      src="/Light-king.svg"
      alt="light king"
      @click.stop="clickHandler(true, Piece.king)"
      @mousedown="onMouseDown($event, true, Piece.king)"
      @dragstart.prevent=""
    />
    <img
      v-else-if="pieceCode === 'wq'"
      src="/Light-queen.svg"
      alt="light queen"
      @click.stop="clickHandler(true, Piece.queen)"
      @mousedown="onMouseDown($event, true, Piece.queen)"
      @dragstart.prevent=""
    />
    <img
      v-else-if="pieceCode === 'wr'"
      src="/Light-rook.svg"
      alt="light rook"
      @click.stop="clickHandler(true, Piece.rook)"
      @mousedown="onMouseDown($event, true, Piece.rook)"
      @dragstart.prevent=""
    />
    <img
      v-else-if="pieceCode === 'wb'"
      src="/Light-bishop.svg"
      alt="light bishop"
      @click.stop="clickHandler(true, Piece.bishop)"
      @mousedown="onMouseDown($event, true, Piece.bishop)"
      @dragstart.prevent=""
    />
    <img
      v-else-if="pieceCode === 'wn'"
      src="/Light-knight.svg"
      alt="light knight"
      @click.stop="clickHandler(true, Piece.knight)"
      @mousedown="onMouseDown($event, true, Piece.knight)"
      @dragstart.prevent=""
    />
    <img
      v-else-if="pieceCode === 'wp'"
      src="/Light-pawn.svg"
      alt="light pawn"
      @click.stop="clickHandler(true, Piece.pawn)"
      @mousedown="onMouseDown($event, true, Piece.pawn)"
      @dragstart.prevent=""
      @dragend="Message($event)"
    />
    <img
      v-else-if="pieceCode === 'bk'"
      src="/Dark-king.svg"
      alt="dark king"
      @click.stop="clickHandler(false, Piece.king)"
      @mousedown="onMouseDown($event, false, Piece.king)"
      @dragstart.prevent=""
    />
    <img
      v-else-if="pieceCode === 'bq'"
      src="/Dark-queen.svg"
      alt="dark queen"
      @click.stop="clickHandler(false, Piece.queen)"
      @mousedown="onMouseDown($event, false, Piece.queen)"
      @dragstart.prevent=""
    />
    <img
      v-else-if="pieceCode === 'br'"
      src="/Dark-rook.svg"
      alt="dark rook"
      @click.stop="clickHandler(false, Piece.rook)"
      @mousedown="onMouseDown($event, false, Piece.rook)"
      @dragstart.prevent=""
    />
    <img
      v-else-if="pieceCode === 'bb'"
      src="/Dark-bishop.svg"
      alt="dark bishop"
      @click.stop="clickHandler(false, Piece.bishop)"
      @mousedown="onMouseDown($event, false, Piece.bishop)"
      @dragstart.prevent=""
    />
    <img
      v-else-if="pieceCode === 'bn'"
      src="/Dark-knight.svg"
      alt="dark knight"
      @click.stop="clickHandler(false, Piece.knight)"
      @mousedown="onMouseDown($event, false, Piece.knight)"
      @dragstart.prevent=""
    />
    <img
      v-else-if="pieceCode === 'bp'"
      src="/Dark-pawn.svg"
      alt="dark pawn"
      @click.stop="clickHandler(false, Piece.pawn)"
      @mousedown="onMouseDown($event, false, Piece.pawn)"
      @dragstart.prevent=""
    />
    <img
      v-else-if="position.move.possibleMoves.includes(column + row)"
      class="w-100 pa-2 pointer"
      src="/greyCircleLine.png"
      alt="circle"
      @click.stop="finalMoveHandler()"
    />
    <div
      v-else-if="
        position.pawnJumped &&
        position.move.possibleCaptures.includes(column + row)
      "
      class="filledCell pointer"
      @click.stop="enPassant()"
    ></div>
  </div>
  <PawnPromotionModal
    v-if="pawnPromotion"
    :pawnPromotion="pawnPromotion"
    :isWhite="position.whiteMove"
    @pawnPromotion="finalPawnPromotionHandler"
  />
</template>

<style scoped>
img {
  width: 58px;
  height: 58px;
  cursor: grab;
}
.pointer {
  cursor: pointer;
}
.filledCell {
  height: 58px;
}
</style>
