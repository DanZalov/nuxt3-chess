import { Piece } from './ShowPossibleMoves'

export function clearMove(position: PositionState) {
  position.move = {
    piecePosition: '',
    pieceCode: '',
    possibleMoves: [],
    possibleCaptures: [],
  }
}

export function savePositionToHistory(position: PositionState) {
  const piecesArray: string[][] = Object.values(position.table)
  const piecesArrayCopy: string[][] = []
  for (let index = 0; index < piecesArray.length; index++) {
    piecesArrayCopy.push([...piecesArray[index]])
  }
  for (let index = 2; index < piecesArray.length - 2; index++) {
    piecesArrayCopy[index].sort()
  }
  const stringedArray = JSON.stringify(piecesArrayCopy)
  let cleanedString: string = ''
  for (let index = 0; index < stringedArray.length - 2; index++) {
    const letter = stringedArray[index]
    const letersToRemove = ['"', '\\', '[', ',']
    if (!letersToRemove.includes(letter)) {
      cleanedString += stringedArray[index]
    }
  }
  const history = position.tableHistory
  if (position.whiteMove) {
    history.push([cleanedString])
  } else {
    const lastMove = history[history.length - 1]
    if (lastMove) {
      lastMove.push(cleanedString)
    } else {
      history.push(['', cleanedString])
    }
  }
}

export function changeTable(
  position: PositionState,
  row: string,
  column: string,
  value: string[],
  isCapture: boolean
) {
  const index = value.indexOf(position.move.piecePosition)
  value[index] = column + row
  const move = writeHistory(position, row, column, isCapture)
  clearMove(position)
  position.whiteMove = !position.whiteMove
  // console.log(position)
  return move
}

export function writeHistory(
  position: PositionState,
  row: string,
  column: string,
  isCapture: boolean
) {
  const history = position.history
  let pieceSymbol = position.move.pieceCode[1].toUpperCase()
  if (pieceSymbol === 'P') {
    pieceSymbol = isCapture ? position.move.piecePosition[0] : ''
  } else if (pieceSymbol !== 'K') {
    for (const [key, value] of Object.entries(position.table)) {
      //Nbd7 case
      if (key === position.move.pieceCode) {
        const piece: Piece = convertLetterToPiece(key[1])!
        for (const piecePosition of value) {
          const moves = showLegalMoves({
            position,
            row: piecePosition[1],
            column: piecePosition[0],
            isWhite: position.whiteMove,
            piece,
          })
          if (moves.defended.includes(column + row)) {
            pieceSymbol +=
              piecePosition[0] === position.move.piecePosition[0]
                ? position.move.piecePosition[1]
                : position.move.piecePosition[0]
            break
          }
        }
      }
    }
  }
  const move = isCapture
    ? pieceSymbol + 'x' + column + row
    : pieceSymbol + column + row
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
  isCapture ? capture_sound.play() : move_sound.play()
  return move
}

export function fillMove(
  position: PositionState,
  row: string,
  column: string,
  moves: MoveInfo,
  piece: Piece
) {
  position.move.possibleMoves = moves.possibleMoves
  position.move.possibleCaptures = moves.possibleCaptures
  position.move.piecePosition = column + row
  switch (piece) {
    case Piece.king:
      position.move.pieceCode = position.whiteMove ? 'wk' : 'bk'
      break
    case Piece.queen:
      position.move.pieceCode = position.whiteMove ? 'wq' : 'bq'
      break
    case Piece.rook:
      position.move.pieceCode = position.whiteMove ? 'wr' : 'br'
      break
    case Piece.bishop:
      position.move.pieceCode = position.whiteMove ? 'wb' : 'bb'
      break
    case Piece.knight:
      position.move.pieceCode = position.whiteMove ? 'wn' : 'bn'
      break
    case Piece.pawn:
      position.move.pieceCode = position.whiteMove ? 'wp' : 'bp'
      break
  }
}
