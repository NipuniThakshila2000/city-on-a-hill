import { levels } from "../levels";
import { useGame } from "../store/useGame";
import styles from "./LevelEnd.module.css";

const word = (n: number) => (n === 1 ? "once" : n === 2 ? "twice" : "three times");

export default function LevelEnd() {
  const state = useGame();
  if (!["won", "lost", "failed"].includes(state.phase)) return null;
  const delta = state.campaign.avoidableDestroys - state.avoidableDestroysAtLevelStart;
  const next = Math.min(state.level.id + 1, levels.length);
  return (
    <section className={styles.overlay} role="dialog" aria-modal="true">
      <div className={`${styles.panel} ${state.phase === "won" ? styles.won : ""}`}>
        {state.phase === "won" && <div className={styles.burst} aria-hidden="true" />}
        <h2>{state.phase === "won" ? "Level complete" : state.phase === "lost" ? "The lamp went out" : "The houses stayed dark"}</h2>
        {state.oilAward && (
          <section className={styles.oilAward} aria-label="Oil earned">
            <h3><span />Oil earned <strong>{state.oilAward.total}</strong></h3>
            {state.oilAward.lines.map((line) => (
              <div className={line.prominent ? styles.prominent : ""} key={line.label}>
                <span>{line.label}</span>
                <strong>{line.amount}</strong>
              </div>
            ))}
          </section>
        )}
        <button onClick={() => state.startLevel(state.level.id, state.helper)}>Retry</button>
        {state.phase === "won" && state.level.id < levels.length && (
          <button onClick={() => state.startLevel(next, state.helper)}>Next level</button>
        )}
        {delta > 0 && <p>Your Destroyer acted {word(Math.min(delta, 3))} where another would have served.</p>}
      </div>
    </section>
  );
}
