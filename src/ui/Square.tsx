import { HOUSES, PIECE_LABELS, TEMPLE } from "../game/constants";
import { dist, keyOf, samePos } from "../game/distance";
import { isLit } from "../game/light";
import { canBuild, legalMoves, lockedSquares } from "../game/rules";
import { protectorCoveredSquares } from "../game/threatAI";
import type { Pos, ViewMode } from "../game/types";
import { useGame } from "../store/useGame";
import houseSrc from "../assets/structures/house.webp";
import Darkness from "./Darkness";
import Piece from "./Piece";
import styles from "./Square.module.css";

type SquareProps = {
  pos: Pos;
  tutorialSquares?: string[];
  tutorialPrimarySquare?: string;
  viewMode?: ViewMode;
  interactive?: boolean;
};

export default function Square({ pos, tutorialSquares = [], tutorialPrimarySquare, viewMode, interactive = true }: SquareProps) {
  const state = useGame();
  const displayMode = viewMode ?? state.mode;
  const squareKey = keyOf(pos);
  const piece = Object.values(state.pieces).find((p) => p.alive && samePos(p.pos, pos));
  const moveTrail = Object.values(state.moveTrails).find((trail) => trail && samePos(trail.from, pos));
  const threat = state.threats.find((t) => samePos(t.pos, pos));
  const house = HOUSES.some((h) => samePos(h, pos));
  const temple = samePos(TEMPLE, pos);
  const locked = lockedSquares(state).some((p) => samePos(p, pos));
  const cornerstone = state.cornerstones.find((c) => samePos(c.pos, pos));
  const selected = state.selectedPieceId ? state.pieces[state.selectedPieceId] : null;
  const legal = interactive && selected ? legalMoves(state, selected.id).some((p) => samePos(p, pos)) : false;
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
    interactive &&
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
  const tutorialHighlight = tutorialSquares.includes(squareKey);
  const tutorialPrimary = tutorialPrimarySquare === squareKey;

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
    state.selectedSquare.x === pos.x && state.selectedSquare.y === pos.y ? styles.focused : "",
    tutorialHighlight ? styles.tutorialHighlight : "",
    tutorialPrimary ? styles.tutorialPrimary : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      onClick={() => {
        if (!interactive) return;
        state.selectSquare(pos);
        if (threat) state.destroyThreat(threat.id);
        else if (piece) state.selectPiece(piece.id);
        else if (legal) state.moveSelected(pos);
      }}
      tabIndex={interactive ? 0 : -1}
      aria-disabled={!interactive}
      disabled={!interactive}
      aria-label={keyOf(pos)}
    >
      {tutorialPrimary && <span className={styles.tutorialArrow}>{"->"}</span>}
      {tutorialHighlight && !tutorialPrimary && <span className={styles.tutorialDot} />}
      {coord && <span className={styles.coord}>{coord}</span>}
      {moveTrail && (
        <span className={`${styles.moveTrail} ${styles[moveTrail.pieceId]}`} aria-label={`${moveTrail.pieceId} moved from here`}>
          <span>{PIECE_LABELS[moveTrail.pieceId]}</span>
        </span>
      )}
      {temple && <span className={styles.templeLamp} />}
      {house && <img className={styles.houseImage} src={houseSrc} alt="" draggable={false} />}
      {locked && <span className={styles.lock} />}
      {cornerstone && (
        <span className={cornerstone.complete ? styles.cornerComplete : styles.cornerScaffold}>
          {cornerstone.complete ? "" : cornerstone.turnsRemaining}
        </span>
      )}
      {displayMode === "coming" && forecast.map((f) => <span className={styles.forecast} key={f.id}>{f.turn}</span>)}
      {threat && <Darkness threat={threat} targeted={destroyTarget} />}
      {showSoil && soil === "poor" && !cornerstone && <span className={styles.soil}>poor</span>}
      {actionEffect && <span key={actionEffect.id} className={`${styles.effect} ${styles[actionEffect.type]}`}>{actionEffect.text}</span>}
      {piece && <Piece piece={piece} selected={state.selectedPieceId === piece.id} />}
    </button>
  );
}
