import { Piece } from './ShowPossibleMoves'

function showKingsLegalMoves(
  position: PositionState,
  row: string,
  column: string,
  isWhite: boolean
) {
  const moves = showPossibleMoves({
    position: position,
    row: row,
    column: column,
    isWhite,
    piece: Piece.king,
  } as ShowPossibleMovesOptions)
  const finalMoves = {
    possibleMoves: filterKingsMoves(
      moves.possibleMoves,
      position,
      isWhite,
      false
    ),
    possibleCaptures: filterKingsMoves(
      moves.possibleCaptures,
      position,
      isWhite,
      true
    ),
    defended: moves.defended,
    target: moves.possibleMoves,
  } as MoveInfo
  return finalMoves
}

function showPiecesLegalMoves({
  position,
  row,
  column,
  isWhite,
  piece,
}: ShowPossibleMovesOptions) {
  let moves = showPossibleMoves({
    position,
    row,
    column,
    isWhite,
    piece,
  } as ShowPossibleMovesOptions)
  if (position.pinned[0]) {
    moves = pinnedFilter(position, row, column, moves, piece)
  }
  if (position.check[0]) {
    moves = checkFilter(position, moves, isWhite, piece)
  }
  return moves
}

export function showLegalMoves({
  position,
  row,
  column,
  isWhite,
  piece,
}: ShowPossibleMovesOptions) {
  let moves: MoveInfo
  if (piece === Piece.king) {
    moves = showKingsLegalMoves(position, row, column, isWhite)
  } else {
    moves = showPiecesLegalMoves({ position, row, column, isWhite, piece })
  }
  return moves
}
