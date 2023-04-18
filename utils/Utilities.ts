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
