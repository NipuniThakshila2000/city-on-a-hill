import { PIECE_LABELS, TEMPLE } from "../game/constants";
import { dist, keyOf, samePos } from "../game/distance";
import { activeCheckpoints, checkpointState, housesForLevel, isHouseLit, isLit, litSquares } from "../game/light";
import { canEstablishCheckpoint, legalMoves, lockedSquares } from "../game/rules";
import { projectThreatPath, protectorCoveredSquares, threatBehaviour } from "../game/threatAI";
import { makeThreat, THREAT_STATS } from "../game/combat";
import { hasSkill } from "../game/skills";
import type { Pos, ViewMode } from "../game/types";
import { useGame } from "../store/useGame";
import houseSrc from "../assets/structures/house.webp";
import Darkness from "./Darkness";
import HelpHotspot from "./HelpHotspot";
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
  const house = housesForLevel(state).find((h) => samePos(h.pos, pos));
  const temple = samePos(TEMPLE, pos);
  const locked = lockedSquares(state).some((p) => samePos(p, pos));
  const checkpoint = state.checkpoints.find((c) => samePos(c.pos, pos));
  const checkpointKind = checkpoint ? checkpointState(checkpoint, state) : null;
  const selected = state.selectedPieceId ? state.pieces[state.selectedPieceId] : null;
  const legal = interactive && selected ? legalMoves(state, selected.id).some((p) => samePos(p, pos)) : false;
  const forecastWindow =
    state.level.forecastWindow +
    (state.helper === "counsel" ? 1 : 0) +
    (hasSkill(state.campaign, "destroyer-the-tower") ? 1 : 0);
  const forecastBoard = {
    threats: state.threats,
    locked: lockedSquares(state),
    protector: state.pieces.protector.pos,
    protectorCoversDiagonals: state.protectorBraced || state.helper === "might" || hasSkill(state.campaign, "protector-under-his-wings"),
    looser: state.pieces.looser.alive ? state.pieces.looser.pos : undefined,
    checkpoints: activeCheckpoints(state).map((c) => c.pos),
    constructingCheckpoints: state.checkpoints.filter((c) => !c.complete).map((c) => c.pos),
    lit: litSquares(state),
    threatenedCheckpoints: state.checkpoints.map((c) => c.pos),
    anchoredThreatIds: state.threats.filter((candidate) => candidate.anchoredTurns).map((candidate) => candidate.id)
  };
  const forecast = [
    ...state.threats.flatMap((candidate) =>
      projectThreatPath(candidate, forecastBoard, forecastWindow).map((step, index) => ({
        id: `${candidate.id}-${index}`,
        turn: state.turn + index + 1,
        tier: candidate.tier,
        step,
        routeStep: index + 1
      }))
    ),
    ...state.level.spawns
      .filter((s) => s.turn > state.turn && s.turn <= state.turn + forecastWindow)
      .flatMap((spawn) => [
        { id: `${spawn.id}-entry`, turn: spawn.turn, tier: spawn.tier ?? 1, step: spawn.pos, routeStep: 0 },
        ...projectThreatPath(makeThreat(spawn), forecastBoard, Math.max(1, state.turn + forecastWindow - spawn.turn)).map((step, index) => ({
          id: `${spawn.id}-${index}`,
          turn: spawn.turn + index + 1,
          tier: spawn.tier ?? 1,
          step,
          routeStep: index + 1
        }))
      ])
  ].filter((entry) => samePos(entry.step, pos));
  const lit = isLit(pos, state);
  const houseLit = !!house && isHouseLit(house, state);
  const houseStable = !!house && !!state.houseProgress[house.id]?.stabilized;
  const establishable = selected ? canEstablishCheckpoint(state, selected) && samePos(selected.pos, pos) : false;
  const showSoil = state.helper === "knowledge" || state.preparedSoil.includes(keyOf(pos));
  const soil = state.level.soil[keyOf(pos)];
  const actionEffect = state.actionEffect && samePos(state.actionEffect.pos, pos) ? state.actionEffect : null;
  const protectedSquare = protectorCoveredSquares(
    state.pieces.protector.pos,
    state.protectorBraced || state.helper === "might" || hasSkill(state.campaign, "protector-under-his-wings")
  ).some((p) =>
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
    !!house &&
    state.actionEffect?.type === "establish" &&
    dist(pos, state.actionEffect.pos) <= 2;
  const coord = pos.y === 0 ? String.fromCharCode(65 + pos.x) : pos.x === 0 ? String(pos.y + 1) : "";
  const tutorialHighlight = tutorialSquares.includes(squareKey);
  const tutorialPrimary = tutorialPrimarySquare === squareKey;
  const helpTopic =
    temple ? "cornerstone" :
    !!threat ? "darkness" :
    !!piece ? piece.id :
    !!checkpoint ? "checkpoint" :
    !!house ? "house" :
    forecast.length > 0 ? "forecast" :
    "square";

  const classes = [
    styles.square,
    lit ? styles.lit : "",
    temple ? styles.temple : "",
    house ? styles.house : "",
    house && !houseLit ? styles.houseDark : "",
    houseLit ? styles.houseLit : "",
    houseStable ? styles.houseStable : "",
    protectedSquare ? styles.protected : "",
    protectedSquare && selected?.id === "protector" ? styles.protectedActive : "",
    legal ? styles.legal : "",
    destroyTarget ? styles.destroyTarget : "",
    establishable ? styles.establishable : "",
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
      data-help-topic={helpTopic}
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
      title={squareKey}
    >
      <span className={styles.coordinateTooltip}>{squareKey}</span>
      {displayMode !== "coming" && <HelpHotspot topic={helpTopic} />}
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
      {checkpoint && (
        <span className={`${styles.checkpoint} ${checkpointKind ? styles[checkpointKind] : ""}`} title={`Checkpoint of Light: ${checkpointKind}`}>
          {checkpoint.complete ? "" : checkpoint.turnsRemaining}
        </span>
      )}
      {displayMode === "coming" && forecast.map((f) => (
        <span
          className={`${styles.forecast} ${f.routeStep === 0 ? styles.forecastEntry : styles.forecastRoute} ${styles[`forecastTier${f.tier}`]}`}
          key={f.id}
          title={`${f.routeStep === 0 ? "Entry" : "Predicted route"}: ${THREAT_STATS[f.tier].name}, turn ${f.turn}, ${threatBehaviour(f.tier)}`}
        >
          {f.turn}
        </span>
      ))}
      {threat && <Darkness threat={threat} targeted={destroyTarget} />}
      {house && <span className={styles.houseName}>{house.name.replace("House of ", "")}</span>}
      {showSoil && soil === "poor" && !checkpoint && <span className={styles.soil}>poor</span>}
      {actionEffect && <span key={actionEffect.id} className={`${styles.effect} ${styles[actionEffect.type]}`}>{actionEffect.text}</span>}
      {piece && <Piece piece={piece} selected={state.selectedPieceId === piece.id} />}
    </button>
  );
}
