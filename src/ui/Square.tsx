import { HOUSES, TEMPLE } from "../game/constants";
import { dist, keyOf, samePos } from "../game/distance";
import { isLit } from "../game/light";
import { canBuild, legalMoves, lockedSquares } from "../game/rules";
import { protectorCoveredSquares } from "../game/threatAI";
import type { Pos } from "../game/types";
import { useGame } from "../store/useGame";
import Darkness from "./Darkness";
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
  const houseLit = house && lit;
  const buildable = selected ? canBuild(state, selected) && samePos(selected.pos, pos) : false;
  const showSoil = state.helper === "knowledge" || state.preparedSoil.includes(keyOf(pos));
  const soil = state.level.soil[keyOf(pos)];
  const actionEffect = state.actionEffect && samePos(state.actionEffect.pos, pos) ? state.actionEffect : null;
  const protectedSquare = protectorCoveredSquares(state.pieces.protector.pos, state.helper === "might").some((p) =>
    samePos(p, pos)
  );
  const destroyTarget =
    selected?.id === "destroyer" &&
    state.phase === "player" &&
    !selected.acted &&
    state.destroyerCharges > 0 &&
    !!threat;
  const houseGlow =
    house &&
    state.actionEffect?.type === "build" &&
    dist(pos, state.actionEffect.pos) <= 2;
  const coord = pos.y === 0 ? String.fromCharCode(65 + pos.x) : pos.x === 0 ? String(pos.y + 1) : "";

  const classes = [
    styles.square,
    lit ? styles.lit : "",
    temple ? styles.temple : "",
    house ? styles.house : "",
    house && !houseLit ? styles.houseDark : "",
    houseLit ? styles.houseLit : "",
    protectedSquare ? styles.protected : "",
    protectedSquare && selected?.id === "protector" ? styles.protectedActive : "",
    legal ? styles.legal : "",
    destroyTarget ? styles.destroyTarget : "",
    buildable ? styles.buildable : "",
    houseGlow ? styles.houseGlow : "",
    state.selectedSquare.x === pos.x && state.selectedSquare.y === pos.y ? styles.focused : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      onClick={() => {
        state.selectSquare(pos);
        if (threat) state.destroyThreat(threat.id);
        else if (piece) state.selectPiece(piece.id);
        else if (legal) state.moveSelected(pos);
      }}
      aria-label={keyOf(pos)}
    >
      {coord && <span className={styles.coord}>{coord}</span>}
      {temple && <span className={styles.templeLamp} />}
      {house && <span className={styles.houseSprite} />}
      {locked && <span className={styles.lock} />}
      {cornerstone && (
        <span className={cornerstone.complete ? styles.cornerComplete : styles.cornerScaffold}>
          {cornerstone.complete ? "" : cornerstone.turnsRemaining}
        </span>
      )}
      {state.mode === "coming" && forecast.map((f) => <span className={styles.forecast} key={f.id}>{f.turn}</span>)}
      {threat && <Darkness threat={threat} targeted={destroyTarget} />}
      {showSoil && soil === "poor" && !cornerstone && <span className={styles.soil}>poor</span>}
      {actionEffect && <span key={actionEffect.id} className={`${styles.effect} ${styles[actionEffect.type]}`}>{actionEffect.text}</span>}
      {piece && <Piece piece={piece} selected={state.selectedPieceId === piece.id} />}
    </button>
  );
}
