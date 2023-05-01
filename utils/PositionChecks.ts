import { Piece } from './ShowPossibleMoves'

export function searchForPinned(position: PositionState) {
  const wkPosition = position.table.wk[0] || ''
  const bkPosition = position.table.bk[0] || ''
  const pinnedPieces: PinnedPiece[] = []
  let tempPinnedPieces: PinnedPiece[] = []

  function getPinnedPiece(
    piecePosition: string,
    move: string[],
    kPosition: string,
    isWhite: boolean
  ) {
    let pinnedPiece = true
    let pinnedPiecePosition = ''
    let pinnedPieceCounter = 0
    for (const cell of move) {
      for (const [innerKey, innerValue] of Object.entries(position.table)) {
        //searching for pieces between the bishop and the king
        if (innerValue.includes(cell)) {
          if (
            (innerKey[0] === 'w' && isWhite) ||
            (innerKey[0] === 'b' && !isWhite)
          ) {
            if (pinnedPieceCounter === 1) {
              if (innerKey[1] === 'k' && pinnedPiece) {
                const kingIndex = move.indexOf(kPosition)
                return {
                  position: pinnedPiecePosition,
                  line: [piecePosition].concat(move.slice(0, kingIndex + 2)),
                } as PinnedPiece
              }
            }
            pinnedPieceCounter++
            pinnedPiecePosition = cell
          } else {
            pinnedPiece = false
          }
        }
      }
    }
    return
  }

  function checkPiece(
    key: string,
    value: string[],
    wkPosition: string,
    bkPosition: string,
    piece: Piece
  ) {
    const pinnedPieces: PinnedPiece[] = []
    for (const piecePosition of value) {
      let moves: string[][]
      if (piece === Piece.bishop) {
        moves = bishopRawMoves(piecePosition[1], piecePosition[0]) //checking a bishop
      } else if (piece === Piece.rook) {
        moves = rookRawMoves(piecePosition[1], piecePosition[0]) //checking a rook
      } else if (piece === Piece.queen) {
        moves = queenRawMoves(piecePosition[1], piecePosition[0]) //checking a queen
      } else {
        moves = []
      }
      for (const move of moves) {
        if (move.includes(wkPosition) && key[0] === 'b') {
          //found a black brq in a white king's line
          const tempPinnedPiece = getPinnedPiece(
            piecePosition,
            move,
            wkPosition,
            true
          )
          if (tempPinnedPiece) {
            pinnedPieces.push(tempPinnedPiece)
          }
        } else if (move.includes(bkPosition) && key[0] === 'w') {
          //found a white brq in a black king's line
          const tempPinnedPiece = getPinnedPiece(
            piecePosition,
            move,
            bkPosition,
            false
          )
          if (tempPinnedPiece) {
            pinnedPieces.push(tempPinnedPiece)
          }
        }
      }
    }
    return pinnedPieces
  }

  for (const [key, value] of Object.entries(position.table)) {
    const pieceLetters = ['q', 'r', 'b']
    if (pieceLetters.includes(key[1])) {
      const piece = convertLetterToPiece(key[1]) as Piece
      tempPinnedPieces = checkPiece(key, value, wkPosition, bkPosition, piece)
    }
    if (tempPinnedPieces) {
      tempPinnedPieces.forEach((pinnedPiece) => {
        pinnedPieces.push(pinnedPiece)
      })
      tempPinnedPieces = []
    }
  }
  return pinnedPieces
}

export function checkCheck(position: PositionState) {
  const wkPosition = position.table.wk[0] || ''
  const bkPosition = position.table.bk[0] || ''
  const checkInfo: CheckInfo[] = []
  let tempCheckInfo: CheckInfo[] = []

  function getCheckInfoByPiece(
    position: PositionState,
    value: string[],
    wkPosition: string,
    bkposition: string,
    piece: Piece
  ) {
    const checkInfo: CheckInfo[] = []
    let moves: string[][] = []
    let kPosition: string
    let isWhite: boolean
    if (position.whiteMove) {
      kPosition = wkPosition
      isWhite = false
    } else {
      kPosition = bkPosition
      isWhite = true
    }
    for (const piecePosition of value) {
      if (
        showPossibleMoves({
          position,
          row: piecePosition[1],
          column: piecePosition[0],
          isWhite,
          piece,
        }).possibleCaptures.includes(kPosition)
      ) {
        if (piece === Piece.queen) {
          moves = queenRawMoves(piecePosition[1], piecePosition[0])
        } else if (piece === Piece.rook) {
          moves = rookRawMoves(piecePosition[1], piecePosition[0])
        } else if (piece === Piece.bishop) {
          moves = bishopRawMoves(piecePosition[1], piecePosition[0])
        } else {
          checkInfo.push({
            checkerPosition: piecePosition,
            line: [],
          } as CheckInfo)
        }
        for (const move of moves) {
          if (move.includes(kPosition)) {
            const kingIndex = move.indexOf(kPosition)
            checkInfo.push({
              checkerPosition: piecePosition,
              line: move.slice(0, kingIndex + 2), // added cell after king to prevent that to be possible move for the king
            } as CheckInfo)
          }
        }
      }
    }
    return checkInfo
  }

  for (const [key, value] of Object.entries(position.table)) {
    if (
      (position.whiteMove && key[0] === 'b') ||
      (!position.whiteMove && key[0] === 'w')
    ) {
      const pieceLetters = ['q', 'r', 'b', 'n', 'p']
      if (pieceLetters.includes(key[1])) {
        const piece = convertLetterToPiece(key[1]) as Piece
        tempCheckInfo = getCheckInfoByPiece(
          position,
          value,
          wkPosition,
          bkPosition,
          piece
        )
      }
    }
    if (tempCheckInfo) {
      tempCheckInfo.forEach((singleCheckInfo) => {
        checkInfo.push(singleCheckInfo)
      })
      tempCheckInfo = []
    }
  }
  return checkInfo
}

export function castlingHistoryCheck(position: PositionState) {
  const history = position.history
  const longColumns = ['a', 'b', 'c', 'd']
  const shortColumns = ['f', 'g', 'h']
  let longPossibility: boolean = true
  let shortPossibility: boolean = true
  let move: string
  for (let i = 0; i < history.length; i++) {
    if (i < history.length - 1) {
      move = position.whiteMove ? history[i][0] : history[i][1]
    } else {
      move = position.whiteMove ? history[i][0] : ''
    }
    if (move[0] === 'K' || move[0] === 'O') {
      return { queenside: false, kingside: false } as CastlingInfo
    } else if (move[0] === 'R') {
      if (longColumns.includes(move[1]) || longColumns.includes(move[2])) {
        longPossibility = false
      }
      if (shortColumns.includes(move[1]) || shortColumns.includes(move[2])) {
        shortPossibility = false
      }
    }
  }
  return {
    queenside: longPossibility,
    kingside: shortPossibility,
  } as CastlingInfo
}

function legalMovesCheck(position: PositionState) {
  for (const [key, value] of Object.entries(position.table)) {
    if (
      (key[0] === 'w' && position.whiteMove) ||
      (key[0] === 'b' && !position.whiteMove)
    ) {
      for (const piecePosition of value) {
        const piece = convertLetterToPiece(key[1]) as Piece
        const moves = showLegalMoves({
          position,
          row: piecePosition[1],
          column: piecePosition[0],
          isWhite: position.whiteMove,
          piece,
        } as ShowPossibleMovesOptions)
        if (moves.possibleMoves[0] || moves.possibleCaptures[0]) {
          return true
        }
      }
    }
  }
  return false
}

export function mateChecks(position: PositionState) {
  const foundMoves = legalMovesCheck(position)
  const lastMove = position.history[position.history.length - 1]
  if (position.check[0]) {
    if (foundMoves) {
      if (lastMove) {
        lastMove[lastMove.length - 1] += '+'
      }
    } else {
      if (lastMove) {
        lastMove[lastMove.length - 1] += '#'
        return 'mate'
      }
    }
  } else {
    if (!foundMoves) {
      lastMove[lastMove.length - 1] += ' stalemate'
      return 'stalemate'
    }
  }
}

function moveRepeatCheck(position: PositionState) {
  const stringHistory = position.history.map((move) => JSON.stringify(move))
  const entries: { [k: string]: number } = {}
  for (const stringMove of stringHistory) {
    entries[stringMove] = entries[stringMove] ? entries[stringMove] + 1 : 1
    if (entries[stringMove] === 3) {
      console.log(position)
      return true
    }
  }
  return false
}

function positionRepeatCheck(position: PositionState) {
  const stringHistory = position.tableHistory
  for (let i = 0; i < 2; i++) {
    const entries: { [k: string]: number } = {}
    for (const stringedPosition of stringHistory) {
      entries[stringedPosition[i]] = entries[stringedPosition[i]]
        ? entries[stringedPosition[i]] + 1
        : 1
      if (entries[stringedPosition[i]] === 3) {
        console.log(position)
        return true
      }
    }
  }
  return false
}

export function drawChecks(position: PositionState) {
  if (moveRepeatCheck(position) || positionRepeatCheck(position)) {
    const lastMove = position.history[position.history.length - 1]
    lastMove[lastMove.length - 1] += ' draw'
    return true
  }
}

export function pawnPromotionCheck(position: PositionState, row: string) {
  if (position.move.pieceCode[1] === 'p') {
    if (
      (position.whiteMove && row === '8') ||
      (!position.whiteMove && row === '1')
    ) {
      return true
    }
  }
  return false
}
