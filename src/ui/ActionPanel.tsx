import { keyOf } from "../game/distance";
import { canBuild, canRelease } from "../game/rules";
import { useGame } from "../store/useGame";
import styles from "./ActionPanel.module.css";

export default function ActionPanel() {
  const state = useGame();
  const selected = state.selectedPieceId ? state.pieces[state.selectedPieceId] : null;
  return (
    <aside className={styles.panel} aria-label="Piece actions">
      <h2>{selected ? selected.id : "Select a piece"}</h2>
      {selected && <p>{keyOf(selected.pos)} {selected.moved ? "moved" : "ready"} {selected.acted ? "acted" : ""}</p>}
      <div className={styles.actions}>
        <button onClick={state.lockBinder} disabled={!selected || selected.id !== "binder" || selected.acted || selected.locked}>Lock</button>
        <button onClick={state.unlockBinder} disabled={!selected || selected.id !== "binder" || selected.acted || !selected.locked}>Unlock</button>
        <button onClick={state.releaseLock} disabled={!selected || !canRelease(state, selected)}>Release</button>
        <button onClick={state.buildHere} disabled={!selected || !canBuild(state, selected)}>Build</button>
      </div>
      <div className={styles.threats}>
        <h3>Threats</h3>
        {state.threats.length === 0 && <span>None on board</span>}
        {state.threats.map((threat) => (
          <button
            key={threat.id}
            onClick={() => state.destroyThreat(threat.id)}
            disabled={state.phase !== "player" || state.pieces.destroyer.acted || state.destroyerCharges <= 0}
          >
            Destroy {keyOf(threat.pos)}
          </button>
        ))}
      </div>
    </aside>
  );
}
