import { PIECE_STATS } from "../game/combat";
import { attackBonus } from "../game/skills";
import { dist, keyOf, samePos } from "../game/distance";
import { housesForLevel, isHouseLit } from "../game/light";
import { canEstablishCheckpoint, canRelease } from "../game/rules";
import { useGame } from "../store/useGame";
import HelpHotspot from "./HelpHotspot";
import styles from "./ActionPanel.module.css";

const names = {
  protector: "Protector",
  destroyer: "Destroyer",
  binder: "Binder",
  looser: "Looser"
} as const;

type ActionPanelProps = {
  tutorialActions?: string[];
};

const actionClass = (active: boolean, unavailable: boolean) =>
  [unavailable ? styles.unavailable : "", active ? styles.tutorialAction : ""].filter(Boolean).join(" ");

const tutorialArrow = <span className={styles.actionArrow}>{"->"}</span>;

export default function ActionPanel({ tutorialActions = [] }: ActionPanelProps) {
  const state = useGame();
  const selected = state.selectedPieceId ? state.pieces[state.selectedPieceId] : null;
  const stats = selected ? PIECE_STATS[selected.id] : null;
  const selectedThreat = state.threats.find((threat) => samePos(threat.pos, state.selectedSquare));
  const adjacentSelectedThreat = selected && selectedThreat ? dist(selectedThreat.pos, selected.pos) <= 1 : false;
  const suppressedNearby = selected?.id === "looser" && state.checkpoints.some((checkpoint) => checkpoint.suppressedTurns && dist(checkpoint.pos, selected.pos) <= 1);
  const scriptureHouseNearby = selected && housesForLevel(state).some((house) =>
    house.objective.type === "scripture" &&
    isHouseLit(house, state) &&
    !state.houseProgress[house.id]?.scriptureComplete &&
    dist(house.pos, selected.pos) <= 1
  );
  return (
    <aside className={styles.panel} aria-label="Piece actions">
      <h2>{selected ? names[selected.id] : "Level objective"}</h2>
      {!selected && (
        <>
          <div className={styles.oilLine}><span />Oil <strong>{state.campaign.oil}</strong></div>
          <p>Extend connected Light from the one Cornerstone to each house before the turn limit while keeping the lamp under 3 hits.</p>
        </>
      )}
      {selected && stats && (
        <>
          <p>{keyOf(selected.pos)} {selected.moved ? "moved" : "ready"} {selected.acted ? "acted" : ""}</p>
          <dl className={styles.stats}>
            <div><dt>HP</dt><dd>{selected.hp} / {selected.maxHp}</dd></div>
            {stats.actionLabel && <div><dt>{stats.actionLabel}</dt><dd>{(stats.offense ?? 0) + attackBonus(state.campaign, selected.id)}</dd></div>}
            <div><dt>Defense</dt><dd>{stats.defense}</dd></div>
            <div><dt>Passage</dt><dd>{stats.passage}</dd></div>
          </dl>
          <div className={styles.actions}>
            <button data-help-topic="bind" className={actionClass(tutorialActions.includes("lock"), selected.id !== "binder" || selected.acted || !!selected.locked)} onClick={state.lockBinder}>
              {tutorialActions.includes("lock") && tutorialArrow}
              Bind
              <HelpHotspot topic="bind" compact />
            </button>
            <button data-help-topic="release" className={actionClass(tutorialActions.includes("unlock"), selected.id !== "binder" || selected.acted || !selected.locked)} onClick={state.unlockBinder}>
              {tutorialActions.includes("unlock") && tutorialArrow}
              Release bind
              <HelpHotspot topic="release" compact />
            </button>
            <button data-help-topic="release" className={actionClass(tutorialActions.includes("release"), !canRelease(state, selected))} onClick={state.releaseLock}>
              {tutorialActions.includes("release") && tutorialArrow}
              Release
              <HelpHotspot topic="release" compact />
            </button>
            <button data-help-topic="brace" className={actionClass(false, selected.id !== "protector" || selected.acted)} onClick={state.braceProtector}>
              Brace
              <HelpHotspot topic="brace" compact />
            </button>
            <button data-help-topic="anchor" className={actionClass(false, selected.id !== "binder" || selected.acted || !adjacentSelectedThreat)} onClick={state.anchorThreat}>
              Anchor
              <HelpHotspot topic="anchor" compact />
            </button>
            <button data-help-topic="free" className={actionClass(false, selected.id !== "looser" || selected.acted || !suppressedNearby)} onClick={state.freeCheckpoint}>
              Free
              <HelpHotspot topic="free" compact />
            </button>
            <button data-help-topic="disperse" className={actionClass(false, selected.id !== "looser" || selected.acted || !adjacentSelectedThreat)} onClick={state.disperseThreat}>
              Disperse
              <HelpHotspot topic="disperse" compact />
            </button>
            <button data-help-topic="watch" className={actionClass(false, selected.id !== "destroyer" || selected.acted || !selectedThreat)} onClick={state.watchThreat}>
              Watch
              <HelpHotspot topic="watch" compact />
            </button>
            <button data-help-topic="stay" className={actionClass(false, selected.id !== "destroyer" || selected.acted)} onClick={state.stayThyHand}>
              Stay thy hand
              <HelpHotspot topic="stay" compact />
            </button>
            <button data-help-topic="scripture" className={actionClass(false, selected.acted || !scriptureHouseNearby)} onClick={state.tendHouseScripture}>
              Tend Scripture
              <HelpHotspot topic="scripture" compact />
            </button>
            <button data-help-topic="establish" className={actionClass(tutorialActions.includes("checkpoint"), !canEstablishCheckpoint(state, selected))} onClick={state.establishCheckpoint}>
              {tutorialActions.includes("checkpoint") && tutorialArrow}
              Establish Checkpoint
              <HelpHotspot topic="establish" compact />
            </button>
          </div>
          {selected.id === "destroyer" && (
            <p className={`${styles.targetHint} ${tutorialActions.includes("attack") ? styles.tutorialHint : ""}`}>
              {tutorialActions.includes("attack") && <span className={styles.actionArrow}>{"->"}</span>}
              Select a highlighted darkness tile on the board to attack.
            </p>
          )}
        </>
      )}
    </aside>
  );
}
