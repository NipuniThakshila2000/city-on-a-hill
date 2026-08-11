import { PIECE_LABELS } from "../game/constants";
import binderSrc from "../assets/characters/binder-sprite.png";
import destroyerSrc from "../assets/characters/destroyer-sprite.png";
import looserSrc from "../assets/characters/looser-sprite.png";
import protectorSrc from "../assets/characters/protector-sprite.png";
import type { Piece as PieceType, PieceId } from "../game/types";
import styles from "./Piece.module.css";

const PIECE_IMAGES: Record<PieceId, string> = {
  protector: protectorSrc,
  destroyer: destroyerSrc,
  binder: binderSrc,
  looser: looserSrc
};

export default function Piece({ piece, selected }: { piece: PieceType; selected: boolean }) {
  if (!piece.alive) return null;
  const classes = [styles.piece, styles[piece.id], selected ? styles.selected : "", piece.acted ? styles.acted : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={classes} aria-label={`${piece.id} ${PIECE_LABELS[piece.id]}`}>
      <img className={styles.image} src={PIECE_IMAGES[piece.id]} alt="" draggable={false} />
      <span className={styles.hp} aria-hidden="true">
        <span style={{ width: `${(piece.hp / piece.maxHp) * 100}%` }} />
      </span>
      <span className={styles.label}>{PIECE_LABELS[piece.id]}</span>
    </span>
  );
}
