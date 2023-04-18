import { Piece } from './ShowPossibleMoves'

export function filterKingsMoves(
  moves: string[],
  position: PositionState,
  isWhite: boolean,
  isCapture: boolean
) {
  function validMoveSearcher(
    value: string[],
    move: string,
    piece: Piece,
    isCapture: boolean
  ) {
    for (const piecePosition of value) {
      for (const check of position.check) {
        if (check.line[check.line.length - 1] === move) {
          return true
        }
      }
      const { target, defended } = showPossibleMoves({
        position,
        row: piecePosition[1],
        column: piecePosition[0],
        isWhite: !isWhite,
        piece,
      } as ShowPossibleMovesOptions)
      if (isCapture) {
        if (defended.includes(move)) {
          return true
        }
      } else {
        if (target.includes(move)) {
          return true
        }
      }
    }
    return false
  }
  let invalidMove: boolean = false
  let validMoves: string[] = []
  for (const move of moves) {
    for (const [key, value] of Object.entries(position.table)) {
      if ((key[0] === 'b' && isWhite) || (key[0] === 'w' && !isWhite)) {
        const piece = convertLetterToPiece(key[1]) as Piece
        invalidMove =
          invalidMove || validMoveSearcher(value, move, piece, isCapture)
      }
    }
    if (!invalidMove) {
      validMoves.push(move)
    }
    invalidMove = false
  }

  function validMovesFilter(
    validMoves: string[],
    filtered: string,
    required: string
  ) {
    if (
      validMoves.includes(filtered) &&
      (!validMoves.includes(required) || position.check[0])
    ) {
      const index = validMoves.indexOf(filtered)
      validMoves.splice(index, 1)
    }
    return validMoves
  }

  if (!isCapture) {
    //castling handler
    if (position.table.wk[0] === 'e1' && isWhite) {
      validMoves = validMovesFilter(validMoves, 'c1', 'd1')
      validMoves = validMovesFilter(validMoves, 'g1', 'f1')
    } else if (position.table.bk[0] === 'e8' && !isWhite) {
      validMoves = validMovesFilter(validMoves, 'c8', 'd8')
      validMoves = validMovesFilter(validMoves, 'g8', 'f8')
    }
  }

  return validMoves
}

export function pinnedFilter(
  position: PositionState,
  row: string,
  column: string,
  tempMoves: MoveInfo,
  piece: Piece
) {
  let filteredMoves: MoveInfo = {
    possibleMoves: [],
    possibleCaptures: [],
    defended: [],
    target: [],
  }
  position.pinned.forEach((pinnedPiece) => {
    if (pinnedPiece.position === column + row) {
      const pinningPiece = pinnedPiece.line[0]
      if (piece === Piece.pawn) {
        filteredMoves.target = tempMoves.target
      } else {
        filteredMoves.target = tempMoves.possibleMoves
      }
      if (tempMoves.possibleCaptures.includes(pinningPiece)) {
        filteredMoves.possibleCaptures.push(pinningPiece)
      }
      tempMoves.possibleCaptures
        .filter((capture) => capture !== pinningPiece)
        .forEach((capture) => {
          filteredMoves.target.push(capture)
        })
      for (const move of pinnedPiece.line) {
        if (tempMoves.possibleMoves.includes(move)) {
          filteredMoves.possibleMoves.push(move)
        }
      }
      filteredMoves.defended = tempMoves.defended
      tempMoves = filteredMoves
    }
  })
  return tempMoves
}

export function checkFilter(
  position: PositionState,
  tempMoves: MoveInfo,
  isWhite: boolean,
  piece: Piece
) {
  let filteredMoves: MoveInfo = {
    possibleMoves: [],
    possibleCaptures: [],
    defended: [],
    target: [],
  }
  if (
    piece !== Piece.king &&
    ((position.whiteMove && isWhite === true) ||
      (!position.whiteMove && isWhite === false))
  ) {
    if (position.check.length > 1) {
      if (piece === Piece.pawn) {
        filteredMoves.target = tempMoves.target
      } else {
        filteredMoves.target = tempMoves.possibleMoves
      }
      tempMoves.possibleCaptures.forEach((capture) => {
        filteredMoves.target.push(capture)
      })
      filteredMoves.defended = tempMoves.defended
      return filteredMoves
    } else if (position.check.length === 1) {
      const checkingPiecePosition = position.check[0].checkerPosition
      if (piece === Piece.pawn) {
        filteredMoves.target = tempMoves.target
      } else {
        filteredMoves.target = tempMoves.possibleMoves
      }
      if (tempMoves.possibleCaptures.includes(checkingPiecePosition)) {
        filteredMoves.possibleCaptures.push(checkingPiecePosition)
      }
      tempMoves.possibleCaptures
        .filter((capture) => capture !== checkingPiecePosition)
        .forEach((capture) => {
          filteredMoves.target.push(capture)
        })
      for (const move of position.check[0].line) {
        if (tempMoves.possibleMoves.includes(move)) {
          filteredMoves.possibleMoves.push(move)
        }
      }
      filteredMoves.defended = tempMoves.defended
      return filteredMoves
    }
  }
  return tempMoves
}
