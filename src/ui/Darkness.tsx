import { THREAT_STATS } from "../game/combat";
import type { Threat } from "../game/types";
import styles from "./Darkness.module.css";

export default function Darkness({ threat, targeted }: { threat: Threat; targeted: boolean }) {
  const stat = THREAT_STATS[threat.tier];
  const classes = [styles.darkness, styles[`tier${threat.tier}`], targeted ? styles.targeted : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} aria-label={`${stat.name} tier ${threat.tier}`}>
      <span className={styles.body} />
      <span className={styles.hp} aria-hidden="true">
        <span style={{ width: `${(threat.hp / threat.maxHp) * 100}%` }} />
      </span>
      <span className={styles.badge}>{threat.tier}</span>
    </span>
  );
}
