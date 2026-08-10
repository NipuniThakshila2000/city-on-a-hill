import { PIECE_LABELS } from "../game/constants";
import type { Piece as PieceType } from "../game/types";
import styles from "./Piece.module.css";

export default function Piece({ piece, selected }: { piece: PieceType; selected: boolean }) {
  if (!piece.alive) return null;
  const classes = [styles.piece, styles[piece.id], selected ? styles.selected : "", piece.acted ? styles.acted : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={classes} aria-label={piece.id}>
      {PIECE_LABELS[piece.id]}
    </span>
  );
}
