import type { HelperId } from "../game/types";
import { availableHelpers, useGame } from "../store/useGame";
import styles from "./HelperSelect.module.css";

const names: Record<HelperId, string> = {
  counsel: "Counsel",
  might: "Might",
  knowledge: "Knowledge",
  understanding: "Understanding",
  fear: "Fear of the Lord",
  wisdom: "Wisdom",
  spirit: "Spirit of the Lord"
};

const effects: Record<HelperId, string> = {
  counsel: "Forecast reaches one extra turn.",
  might: "Protector covers diagonals too.",
  knowledge: "Soil quality is visible.",
  understanding: "Coming soon.",
  fear: "Coming soon.",
  wisdom: "Coming soon.",
  spirit: "Coming soon."
};

export default function HelperSelect() {
  const { level, startLevel } = useGame();
  return (
    <section className={styles.panel} aria-label="Helper selection">
      <div>
        <p className={styles.kicker}>Level {level.id}</p>
        <h1>City on a Hill</h1>
      </div>
      <div className={styles.helpers}>
        {availableHelpers.map((id) => {
          const disabled = !["counsel", "might", "knowledge"].includes(id);
          return (
            <button key={id} disabled={disabled} onClick={() => startLevel(level.id, id)}>
              <span>{names[id]}</span>
              <small>{effects[id]}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}
