import { THREAT_STATS } from "../game/combat";
import type { Threat } from "../game/types";
import enemyImage from "../assets/enemies/enemy.png";
import styles from "./Darkness.module.css";

export default function Darkness({ threat, targeted }: { threat: Threat; targeted: boolean }) {
  const stat = THREAT_STATS[threat.tier];
  const marks = { 1: "S", 2: "Sh", 3: "D", 4: "A" } as const;
  const classes = [styles.darkness, styles[`tier${threat.tier}`], targeted ? styles.targeted : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} aria-label={`${stat.name} tier ${threat.tier}`}>
      <img className={styles.body} src={enemyImage} alt="" aria-hidden="true" />
      <span className={styles.hp} aria-hidden="true">
        <span style={{ width: `${(threat.hp / threat.maxHp) * 100}%` }} />
      </span>
      <span className={styles.badge}>{marks[threat.tier]}</span>
    </span>
  );
}
