import { useGame } from "../store/useGame";
import { housesForLevel } from "../game/light";
import ActivityConsole from "./ActivityConsole";
import ForecastToggle from "./ForecastToggle";
import styles from "./TurnBar.module.css";

type TurnBarProps = {
  tutorialView?: boolean;
  tutorialEndTurn?: boolean;
};

export default function TurnBar({ tutorialView = false, tutorialEndTurn = false }: TurnBarProps) {
  const { turn, level, templeHits, destroyerCharges, message, endPlayerTurn, phase } = useGame();
  const housesHeld = useGame((state) => housesForLevel(state).filter((house) => state.houseProgress[house.id]?.stabilized).length);
  const order = useGame((state) => state.order);
  return (
    <header className={styles.bar}>
      <div className={styles.turnControls}>
        <div className={styles.status}>
          <span>Turn {Math.min(turn, level.turns)} / {level.turns}</span>
          <span>Lamp hits {templeHits} / 3</span>
          <span>Houses held {housesHeld} / 3</span>
          <span>{order === 3 ? "Full Order" : `Order ${order}`}</span>
          <span>Destroyer {destroyerCharges}</span>
        </div>
        <p>{message}</p>
        <div className={styles.actions}>
          <div className={styles.viewToggle}>
            <ForecastToggle tutorialHighlight={tutorialView} />
          </div>
          <button className={tutorialEndTurn ? styles.tutorialAction : ""} onClick={endPlayerTurn} disabled={phase !== "player"}>
            {tutorialEndTurn && <span className={styles.actionArrow}>{"->"}</span>}
            End turn
          </button>
        </div>
      </div>
      <div className={styles.consoleSlot}>
        <ActivityConsole />
      </div>
    </header>
  );
}
