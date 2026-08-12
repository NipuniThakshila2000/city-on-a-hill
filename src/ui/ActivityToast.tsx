import { useGame } from "../store/useGame";
import styles from "./ActivityToast.module.css";

export default function ActivityToast() {
  const latest = useGame((state) => state.activityLog[0]);

  if (!latest || latest.text.startsWith("Warning:")) return null;

  return (
    <aside key={latest.id} className={`${styles.toast} ${styles[latest.tone]}`} aria-live="polite" role="status">
      <span>T{latest.turn}</span>
      {latest.text}
    </aside>
  );
}
