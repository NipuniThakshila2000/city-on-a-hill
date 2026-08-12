import { useGame } from "../store/useGame";
import { HOUSES } from "../game/constants";
import { isLit } from "../game/light";
import ActivityConsole from "./ActivityConsole";
import ForecastToggle from "./ForecastToggle";
import styles from "./TurnBar.module.css";

type TurnBarProps = {
  tutorialView?: boolean;
  tutorialEndTurn?: boolean;
};

export default function TurnBar({ tutorialView = false, tutorialEndTurn = false }: TurnBarProps) {
  const { turn, level, templeHits, destroyerCharges, message, endPlayerTurn, phase } = useGame();
  const housesLit = useGame((state) => HOUSES.filter((house) => isLit(house, state)).length);
  return (
    <header className={styles.bar}>
      <div className={styles.turnControls}>
        <div className={styles.status}>
          <span>Turn {Math.min(turn, level.turns)} / {level.turns}</span>
          <span>Lamp hits {templeHits} / 3</span>
          <span>Houses lit {housesLit} / 3</span>
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
