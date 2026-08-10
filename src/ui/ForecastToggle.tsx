import { useGame } from "../store/useGame";
import styles from "./ForecastToggle.module.css";

export default function ForecastToggle() {
  const { mode, toggleMode, level, helper } = useGame();
  const window = helper === "counsel" ? level.forecastWindow + 1 : level.forecastWindow;
  return (
    <button className={styles.toggle} onClick={toggleMode} aria-pressed={mode === "coming"}>
      <span>{mode === "coming" ? "Coming" : "Now"}</span>
      <small>{window} turn forecast</small>
    </button>
  );
}
