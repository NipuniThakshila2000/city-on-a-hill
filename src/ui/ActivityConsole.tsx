import { useGame } from "../store/useGame";
import styles from "./ActivityConsole.module.css";

export default function ActivityConsole() {
  const entries = useGame((state) => state.activityLog);

  return (
    <section className={styles.console} aria-label="Activity console" aria-live="polite">
      <header>
        <span>Activity console</span>
        <small>latest first</small>
      </header>
      <div className={styles.log}>
        {entries.map((entry, index) => (
          <p key={entry.id} className={`${styles.entry} ${styles[entry.tone]} ${index === 0 ? styles.latest : ""}`}>
            <span>T{entry.turn}</span>
            {entry.text}
          </p>
        ))}
      </div>
    </section>
  );
}
