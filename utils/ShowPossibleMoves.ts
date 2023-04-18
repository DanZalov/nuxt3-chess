export enum Piece {
  pawn = 'pawn',
  knight = 'knight',
  bishop = 'bishop',
  rook = 'rook',
  queen = 'queen',
  king = 'king',
}

export function showPossibleMoves({
  position,
  row,
  column,
  isWhite,
  piece,
}: ShowPossibleMovesOptions) {
  let tempMoves: MoveInfo
  if (piece === Piece.pawn) {
    tempMoves = showPossibleMovesPawn(position, row, column, isWhite)
  } else if (piece === Piece.knight || piece === Piece.king) {
    tempMoves = showPossibleMovesKN(position, row, column, isWhite, piece)
  } else {
    tempMoves = showPossibleMovesBRQ(position, row, column, isWhite, piece)
  }

  return tempMoves
}

function showPossibleMovesPawn(
  position: PositionState,
  row: string,
  column: string,
  isWhite: boolean
) {
  const nextRow = isWhite ? (+row + 1).toString() : (+row - 1).toString()
  let moves: string[] = []
  if (isWhite) {
    moves = row === '2' ? [column + '3', column + '4'] : [column + nextRow]
  } else {
    moves = row === '7' ? [column + '6', column + '5'] : [column + nextRow]
  }

  const captures: string[] = []
  if (column === 'a') {
    captures.push('b' + nextRow)
  } else if (column === 'h') {
    captures.push('g' + nextRow)
  } else {
    captures.push(String.fromCharCode(column.charCodeAt(0) - 1) + nextRow)
    captures.push(String.fromCharCode(column.charCodeAt(0) + 1) + nextRow)
  }

  const possibleMoves: string[] = []
  const possibleCaptures: string[] = []
  const defended: string[] = []
  const target: string[] = []
  let emptyIndicator: boolean = true
  for (const move of moves) {
    for (const [key, value] of Object.entries(position.table)) {
      if (value.includes(move)) {
        emptyIndicator = false
        break
      }
    }
    if (emptyIndicator) {
      possibleMoves.push(move)
    } else {
      break
    }
  }
  for (const capture of captures) {
    emptyIndicator = true
    for (const [key, value] of Object.entries(position.table)) {
      if (value.includes(capture)) {
        if ((isWhite && key[0] === 'b') || (!isWhite && key[0] === 'w')) {
          possibleCaptures.push(capture)
        } else {
          defended.push(capture)
        }
        emptyIndicator = false
        break
      }
    }
    if (emptyIndicator) {
      if (position.pawnJumped) {
        const lastMove = position.history[position.history.length - 1]
        const jumpedPiecePosition = lastMove[lastMove.length - 1]
        if (
          capture[0] === jumpedPiecePosition[0] &&
          row === jumpedPiecePosition[1]
        ) {
          possibleCaptures.push(capture)
        } else {
          target.push(capture)
        }
      } else {
        target.push(capture)
      }
    }
  }
  return {
    possibleMoves,
    possibleCaptures,
    defended,
    target,
  } as MoveInfo
}

function showPossibleMovesKN(
  position: PositionState,
  row: string,
  column: string,
  isWhite: boolean,
  piece: Piece
) {
  function castlingMoves(possibleMoves: string[]) {
    const castlingPossibility = castlingHistoryCheck(position)
    const queenCells = isWhite ? ['b1', 'c1', 'd1'] : ['b8', 'c8', 'd8']
    const kingCells = isWhite ? ['f1', 'g1'] : ['f8', 'g8']
    const rookPositions = isWhite ? ['a1', 'h1'] : ['a8', 'h8']
    const cellsArray = [queenCells, kingCells]
    const castlingArray = Object.values(castlingPossibility)
    if (
      (isWhite && position.table.wk[0] !== 'e1') ||
      (!isWhite && position.table.bk[0] !== 'e8')
    ) {
      return possibleMoves
    }
    for (let index = 0; index < castlingArray.length; index++) {
      if (castlingArray[index]) {
        const cells = cellsArray[index]
        for (const cell of cells) {
          for (const value of Object.values(position.table)) {
            if (value.includes(cell)) {
              castlingArray[index] = false
            }
          }
        }
        if (castlingArray[index]) {
          if (isWhite) {
            if (position.table.wr.includes(rookPositions[index])) {
              possibleMoves.push(cells[1])
            }
          } else {
            if (position.table.br.includes(rookPositions[index])) {
              possibleMoves.push(cells[1])
            }
          }
        }
      }
    }
    return possibleMoves
  }

  const numberedColumn = column.charCodeAt(0)
  const numberedRow = +row
  let moves: string[] = []
  if (piece === Piece.knight) {
    moves = [
      String.fromCharCode(numberedColumn - 2) + (numberedRow - 1).toString(),
      String.fromCharCode(numberedColumn - 2) + (numberedRow + 1).toString(),
      String.fromCharCode(numberedColumn - 1) + (numberedRow - 2).toString(),
      String.fromCharCode(numberedColumn - 1) + (numberedRow + 2).toString(),
      String.fromCharCode(numberedColumn + 1) + (numberedRow - 2).toString(),
      String.fromCharCode(numberedColumn + 1) + (numberedRow + 2).toString(),
      String.fromCharCode(numberedColumn + 2) + (numberedRow - 1).toString(),
      String.fromCharCode(numberedColumn + 2) + (numberedRow + 1).toString(),
    ]
  } else if (piece === Piece.king) {
    moves = [
      String.fromCharCode(numberedColumn - 1) + (numberedRow - 1).toString(),
      String.fromCharCode(numberedColumn - 1) + numberedRow.toString(),
      String.fromCharCode(numberedColumn - 1) + (numberedRow + 1).toString(),
      String.fromCharCode(numberedColumn) + (numberedRow - 1).toString(),
      String.fromCharCode(numberedColumn) + (numberedRow + 1).toString(),
      String.fromCharCode(numberedColumn + 1) + (numberedRow - 1).toString(),
      String.fromCharCode(numberedColumn + 1) + numberedRow.toString(),
      String.fromCharCode(numberedColumn + 1) + (numberedRow + 1).toString(),
    ]
  }
  const tableMoves: string[] = []
  const columnsArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  moves.forEach((move) => {
    if (move.length === 2 && move[1] !== '0' && move[1] !== '9') {
      if (columnsArray.includes(move[0])) {
        tableMoves.push(move)
      }
    }
  })
  let possibleMoves: string[] = []
  const possibleCaptures: string[] = []
  const defended: string[] = []
  let emptyIndicator: boolean = true
  for (const move of tableMoves) {
    for (const [key, value] of Object.entries(position.table)) {
      if (value.includes(move)) {
        if ((isWhite && key[0] === 'b') || (!isWhite && key[0] === 'w')) {
          possibleCaptures.push(move)
        } else {
          defended.push(move)
        }
        emptyIndicator = false
        break
      }
    }
    if (emptyIndicator) {
      possibleMoves.push(move)
    }
    emptyIndicator = true
  }

  if (piece === Piece.king) {
    possibleMoves = castlingMoves(possibleMoves)
  }

  return {
    possibleMoves,
    possibleCaptures,
    defended,
    target: possibleMoves,
  } as MoveInfo
}

function showPossibleMovesBRQ(
  position: PositionState,
  row: string,
  column: string,
  isWhite: boolean,
  piece: Piece
) {
  let moves: string[][] = []
  switch (piece) {
    case Piece.bishop:
      moves = bishopRawMoves(row, column)
      break
    case Piece.rook:
      moves = rookRawMoves(row, column)
      break
    case Piece.queen:
      moves = queenRawMoves(row, column)
      break
    default:
      break
  }

  const possibleMoves: string[] = []
  const possibleCaptures: string[] = []
  const defended: string[] = []
  let emptyIndicator: boolean = true
  for (let i = 0; i < moves.length; i++) {
    for (const move of moves[i]) {
      for (const [key, value] of Object.entries(position.table)) {
        if (value.includes(move)) {
          if ((isWhite && key[0] === 'b') || (!isWhite && key[0] === 'w')) {
            possibleCaptures.push(move)
          } else {
            defended.push(move)
          }
          emptyIndicator = false
          break
        }
      }
      if (emptyIndicator) {
        possibleMoves.push(move)
      } else {
        break
      }
    }
    emptyIndicator = true
  }

  return {
    possibleMoves,
    possibleCaptures,
    defended,
    target: possibleMoves,
  } as MoveInfo
}

export function bishopRawMoves(row: string, column: string) {
  const numberedColumn = column.charCodeAt(0)
  const numberedRow = +row
  const moves: string[][] = [[], [], [], []]
  let i = numberedRow - 1
  let j = numberedColumn - 1
  while (i > 0 && j > 96) {
    moves[0].push(String.fromCharCode(j) + i.toString())
    i--
    j--
  }
  i = numberedRow + 1
  j = numberedColumn - 1
  while (i < 9 && j > 96) {
    moves[1].push(String.fromCharCode(j) + i.toString())
    i++
    j--
  }
  i = numberedRow - 1
  j = numberedColumn + 1
  while (i > 0 && j < 105) {
    moves[2].push(String.fromCharCode(j) + i.toString())
    i--
    j++
  }
  i = numberedRow + 1
  j = numberedColumn + 1
  while (i < 9 && j < 105) {
    moves[3].push(String.fromCharCode(j) + i.toString())
    i++
    j++
  }
  return moves
}

export function rookRawMoves(row: string, column: string) {
  const numberedColumn = column.charCodeAt(0)
  const numberedRow = +row
  const moves: string[][] = [[], [], [], []]
  let i = numberedRow - 1
  while (i > 0) {
    moves[0].push(column + i.toString())
    i--
  }
  let j = numberedColumn - 1
  while (j > 96) {
    moves[1].push(String.fromCharCode(j) + row)
    j--
  }
  j = numberedColumn + 1
  while (j < 105) {
    moves[2].push(String.fromCharCode(j) + row)
    j++
  }
  i = numberedRow + 1
  while (i < 9) {
    moves[3].push(column + i.toString())
    i++
  }
  return moves
}

export function queenRawMoves(row: string, column: string) {
  const movesB = bishopRawMoves(row, column)
  const movesR = rookRawMoves(row, column)
  return movesB.concat(movesR)
}
