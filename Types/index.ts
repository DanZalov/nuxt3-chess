import { Piece } from '~~/utils/ShowPossibleMoves'

export {}

declare global {
  interface PositionState {
    table: {
      bk: string[]
      wk: string[]
      bq: string[]
      wq: string[]
      br: string[]
      wr: string[]
      bb: string[]
      wb: string[]
      bn: string[]
      wn: string[]
      bp: string[]
      wp: string[]
    }
    pinned: PinnedPiece[]
    whiteMove: boolean
    check: CheckInfo[]
    move: {
      piecePosition: string
      pieceCode: string
      possibleMoves: string[]
      possibleCaptures: string[]
    }
    history: string[][]
    pawnJumped: boolean
    tableHistory: string[][]
    pawnPromotion: boolean
    current: string
  }
  interface ShowPossibleMovesOptions {
    position: PositionState
    row: string
    column: string
    isWhite: boolean
    piece: Piece
  }
  interface MoveInfo {
    possibleMoves: string[]
    possibleCaptures: string[]
    defended: string[]
    target: string[]
  }
  interface PinnedPiece {
    position: string
    line: string[]
  }
  interface CheckInfo {
    checkerPosition: string
    line: string[]
  }
  interface CastlingInfo {
    queenside: boolean
    kingside: boolean
  }
  interface GameOptions {
    game: boolean
    white: boolean
  }
  interface GameRooms {
    [key: string]: {
      moves: string[]
      white: string
      black: string
    }
  }
  interface ClassRooms {
    [key: string]: {
      moves: string[]
      class: boolean
    }
  }
  interface Sessions {
    [key: string]: {
      online: boolean
      time: number
    }
  }
  interface SoundsLib {
    move: HTMLAudioElement
    capture: HTMLAudioElement
  }
}

declare module 'socket.io' {
  interface Socket {
    sessionID: string
  }
}
