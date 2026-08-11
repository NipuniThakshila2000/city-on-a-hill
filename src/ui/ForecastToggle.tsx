import { useGame } from "../store/useGame";
import styles from "./ForecastToggle.module.css";

export default function ForecastToggle() {
  const { mode, setMode, level, helper } = useGame();
  const window = helper === "counsel" ? level.forecastWindow + 1 : level.forecastWindow;
  return (
    <div className={styles.tabs} aria-label="Before and after view">
      <button className={mode === "now" ? styles.active : ""} onClick={() => setMode("now")} aria-pressed={mode === "now"}>
        YESOD
        <small>before</small>
      </button>
      <button className={mode === "coming" ? styles.active : ""} onClick={() => setMode("coming")} aria-pressed={mode === "coming"}>
        MALKUT
        <small>after</small>
      </button>
      <small>{window} turn forecast</small>
    </div>
  );
}
