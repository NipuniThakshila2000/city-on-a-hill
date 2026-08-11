import { PIECE_STATS } from "../game/combat";
import { keyOf } from "../game/distance";
import { canBuild, canRelease } from "../game/rules";
import { useGame } from "../store/useGame";
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
  return (
    <aside className={styles.panel} aria-label="Piece actions">
      <h2>{selected ? names[selected.id] : "Level objective"}</h2>
      {!selected && <p>Light C7, D7, and E7 before the turn limit while keeping the lamp under 3 hits.</p>}
      {selected && stats && (
        <>
          <p>{keyOf(selected.pos)} {selected.moved ? "moved" : "ready"} {selected.acted ? "acted" : ""}</p>
          <dl className={styles.stats}>
            <div><dt>HP</dt><dd>{selected.hp} / {selected.maxHp}</dd></div>
            {stats.actionLabel && <div><dt>{stats.actionLabel}</dt><dd>{stats.offense}</dd></div>}
            <div><dt>Defense</dt><dd>{stats.defense}</dd></div>
            <div><dt>Passage</dt><dd>{stats.passage}</dd></div>
          </dl>
          <div className={styles.actions}>
            <button className={actionClass(tutorialActions.includes("lock"), selected.id !== "binder" || selected.acted || !!selected.locked)} onClick={state.lockBinder}>
              {tutorialActions.includes("lock") && tutorialArrow}
              Lock
            </button>
            <button className={actionClass(tutorialActions.includes("unlock"), selected.id !== "binder" || selected.acted || !selected.locked)} onClick={state.unlockBinder}>
              {tutorialActions.includes("unlock") && tutorialArrow}
              Unlock
            </button>
            <button className={actionClass(tutorialActions.includes("release"), !canRelease(state, selected))} onClick={state.releaseLock}>
              {tutorialActions.includes("release") && tutorialArrow}
              Release
            </button>
            <button className={actionClass(tutorialActions.includes("build"), !canBuild(state, selected))} onClick={state.buildHere}>
              {tutorialActions.includes("build") && tutorialArrow}
              Build
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
