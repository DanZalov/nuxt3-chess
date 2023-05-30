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
  position.current = cleanedString
}

export function restoreTableFromHistory(
  historyString: string,
  position: PositionState
) {
  const piecesPositions = historyString.split(']')
  position.table.bk[0] = piecesPositions[0]
  position.table.wk[0] = piecesPositions[1]
  for (let i = 2; i < 12; i++) {
    if (piecesPositions[i].length > 2) {
      let tempPosition = ''
      for (let j = 0; j < piecesPositions[i].length; j++) {
        if (j > 1 && j % 2 === 0) {
          tempPosition += ` ${piecesPositions[i][j]}`
        } else {
          tempPosition += piecesPositions[i][j]
        }
      }
      piecesPositions[i] = tempPosition
    }
  }
  position.table.bq = piecesPositions[2].split(' ')
  position.table.wq = piecesPositions[3].split(' ')
  position.table.br = piecesPositions[4].split(' ')
  position.table.wr = piecesPositions[5].split(' ')
  position.table.bb = piecesPositions[6].split(' ')
  position.table.wb = piecesPositions[7].split(' ')
  position.table.bn = piecesPositions[8].split(' ')
  position.table.wn = piecesPositions[9].split(' ')
  position.table.bp = piecesPositions[10].split(' ')
  position.table.wp = piecesPositions[11].split(' ')
  console.log(position.table)
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

export function goToPrevPosition(position: PositionState) {
  const history = position.tableHistory
  let prevPosition = ''
  for (let i = 0; i < history.length; i++) {
    if (history[i][0] === position.current && i > 0) {
      prevPosition = history[i - 1][1]
    } else if (history[i][1] === position.current) {
      prevPosition = history[i][0]
    }
  }
  if (prevPosition) {
    restoreTableFromHistory(prevPosition, position)
    position.current = prevPosition
    console.log('previous position: ', position.current)
  }
  position.whiteMove = !position.whiteMove
}

export function goToNextPosition(position: PositionState) {
  const history = position.tableHistory
  let nextPosition = ''
  for (let i = 0; i < history.length; i++) {
    if (history[i][0] === position.current && history[i][1]) {
      nextPosition = history[i][1]
    } else if (history[i][1] === position.current && history[i + 1][0]) {
      nextPosition = history[i + 1][0]
    }
  }
  if (nextPosition) {
    restoreTableFromHistory(nextPosition, position)
    position.current = nextPosition
    console.log('next position: ', position.current)
  }
  position.whiteMove = !position.whiteMove
}
