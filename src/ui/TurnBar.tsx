import { useGame } from "../store/useGame";
import ForecastToggle from "./ForecastToggle";
import styles from "./TurnBar.module.css";

export default function TurnBar() {
  const { turn, level, templeHits, destroyerCharges, message, endPlayerTurn, phase } = useGame();
  return (
    <header className={styles.bar}>
      <div>
        <span>Turn {Math.min(turn, level.turns)} / {level.turns}</span>
        <span>Lamp hits {templeHits} / 3</span>
        <span>Destroyer {destroyerCharges}</span>
      </div>
      <p>{message}</p>
      <div className={styles.actions}>
        <ForecastToggle />
        <button onClick={endPlayerTurn} disabled={phase !== "player"}>End turn</button>
      </div>
    </header>
  );
}
