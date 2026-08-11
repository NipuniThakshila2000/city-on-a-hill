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

export default function ActionPanel() {
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
            <button className={selected.id !== "binder" || selected.acted || selected.locked ? styles.unavailable : ""} onClick={state.lockBinder}>Lock</button>
            <button className={selected.id !== "binder" || selected.acted || !selected.locked ? styles.unavailable : ""} onClick={state.unlockBinder}>Unlock</button>
            <button className={!canRelease(state, selected) ? styles.unavailable : ""} onClick={state.releaseLock}>Release</button>
            <button className={!canBuild(state, selected) ? styles.unavailable : ""} onClick={state.buildHere}>Build</button>
          </div>
          {selected.id === "destroyer" && (
            <p className={styles.targetHint}>Select a highlighted darkness tile on the board to attack.</p>
          )}
        </>
      )}
    </aside>
  );
}
