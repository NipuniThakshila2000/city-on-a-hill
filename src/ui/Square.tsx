import { HOUSES, TEMPLE } from "../game/constants";
import { keyOf, samePos } from "../game/distance";
import { isLit } from "../game/light";
import { canBuild, legalMoves, lockedSquares } from "../game/rules";
import type { Pos } from "../game/types";
import { useGame } from "../store/useGame";
import Piece from "./Piece";
import styles from "./Square.module.css";

export default function Square({ pos }: { pos: Pos }) {
  const state = useGame();
  const piece = Object.values(state.pieces).find((p) => p.alive && samePos(p.pos, pos));
  const threat = state.threats.find((t) => samePos(t.pos, pos));
  const house = HOUSES.some((h) => samePos(h, pos));
  const temple = samePos(TEMPLE, pos);
  const locked = lockedSquares(state).some((p) => samePos(p, pos));
  const cornerstone = state.cornerstones.find((c) => samePos(c.pos, pos));
  const selected = state.selectedPieceId ? state.pieces[state.selectedPieceId] : null;
  const legal = selected ? legalMoves(state, selected.id).some((p) => samePos(p, pos)) : false;
  const forecastWindow = state.helper === "counsel" ? state.level.forecastWindow + 1 : state.level.forecastWindow;
  const forecast = state.level.spawns.filter(
    (s) => s.turn > state.turn && s.turn <= state.turn + forecastWindow && samePos(s.pos, pos)
  );
  const lit = isLit(pos, state);
  const buildable = selected ? canBuild(state, selected) && samePos(selected.pos, pos) : false;
  const showSoil = state.helper === "knowledge" || state.preparedSoil.includes(keyOf(pos));
  const soil = state.level.soil[keyOf(pos)];

  const classes = [
    styles.square,
    lit ? styles.lit : "",
    temple ? styles.temple : "",
    house ? styles.house : "",
    legal ? styles.legal : "",
    buildable ? styles.buildable : "",
    state.selectedSquare.x === pos.x && state.selectedSquare.y === pos.y ? styles.focused : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      onClick={() => {
        state.selectSquare(pos);
        if (piece) state.selectPiece(piece.id);
        else if (legal) state.moveSelected(pos);
      }}
      aria-label={keyOf(pos)}
    >
      <span className={styles.coord}>{keyOf(pos)}</span>
      {temple && <span className={styles.marker}>⌂</span>}
      {house && <span className={styles.marker}>▯</span>}
      {locked && <span className={styles.lock}>▓</span>}
      {cornerstone && <span className={styles.corner}>{cornerstone.complete ? "◆" : cornerstone.turnsRemaining}</span>}
      {state.mode === "coming" && forecast.map((f) => <span className={styles.forecast} key={f.id}>{f.turn}</span>)}
      {state.mode === "now" && threat && <span className={styles.threat}>X</span>}
      {showSoil && soil === "poor" && !cornerstone && <span className={styles.soil}>poor</span>}
      {piece && <Piece piece={piece} selected={state.selectedPieceId === piece.id} />}
    </button>
  );
}
