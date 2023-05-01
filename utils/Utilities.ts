export function convertLetterToPiece(letter: string) {
  switch (letter) {
    case 'k':
      return Piece.king
    case 'q':
      return Piece.queen
    case 'r':
      return Piece.rook
    case 'b':
      return Piece.bishop
    case 'n':
      return Piece.knight
    case 'p':
      return Piece.pawn
    default:
      return
  }
}

export function initialPosition() {
  // made it a function to prevent mutations
  return {
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
  } as PositionState
}

export function countableIntersection(arr1: any, arr2: any) {
  const result: any[] = []
  for (const elem1 of arr1) {
    for (const elem2 of arr2) {
      if (elem1 === elem2) {
        result.push(elem1)
      }
    }
  }
  return result
}

export function restartBoard(position: PositionState) {
  const initial = initialPosition()

  position.check = initial.check
  Object.assign(position.history, initial.history)
  position.move = initial.move
  position.pawnJumped = initial.pawnJumped
  position.pawnPromotion = initial.pawnPromotion
  position.pinned = initial.pinned
  Object.assign(position.table, initial.table)
  position.tableHistory = initial.tableHistory
  position.whiteMove = initial.whiteMove
  // did it manually because watching position.table (not to be rewrited) and object values have mixed types
}

// export function initialPosition() {
//   return {
//     table: {
//       bk: ['g8'],
//       wk: ['h6'],
//       bq: ['d8'],
//       wq: ['c3'],
//       br: ['a8', 'h3'],
//       wr: ['a1', 'g5'],
//       bb: ['c6', 'f4'],
//       wb: ['c1', 'f5'],
//       bn: ['b8', 'h4'],
//       wn: ['b1', 'g1'],
//       bp: ['a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'e6', 'h7'],
//       wp: ['a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'],
//     },
//     pinned: [],
//     whiteMove: false,
//     check: [],
//     move: {
//       piecePosition: '',
//       pieceCode: '',
//       possibleMoves: [],
//       possibleCaptures: [],
//     },
//     history: [
//       ['e3', 'e6'],
//       ['e4', 'e5'],
//       ['d3', 'd6'],
//       ['d4', 'd5'],
//       ['c3', 'c6'],
//       ['c4', 'c5'],
//       ['b3', 'b6'],
//       ['b4', 'b5'],
//       ['a3', 'a6'],
//       ['a4', 'a5'],
//       ['f3', 'f6'],
//       ['f4', 'f5'],
//       ['g3', 'g6'],
//       ['g4', 'g5'],
//       ['h3', 'h6'],
//       ['h4', 'h5'],
//       ['Ra2', 'Ra7'],
//       ['Ra3', 'Ra6'],
//       ['Rh2', 'Rh7'],
//       ['Rhh3', 'Rhh6'],
//       ['e3', 'e6'],
//       ['e4', 'e5'],
//       ['e3', 'e6'],
//       ['e4', 'e5'],
//       ['e3', 'e6'],
//       ['e4', 'e5'],
//     ],
//     pawnJumped: false,
//     tableHistory: [],
//     pawnPromotion: false,
//   } as PositionState
// }
