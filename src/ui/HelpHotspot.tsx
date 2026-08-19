import type { MouseEvent } from "react";
import type { HelpTopicId } from "../game/types";
import { useGame } from "../store/useGame";
import styles from "./HelpHotspot.module.css";

type HelpHotspotProps = {
  topic: HelpTopicId;
  compact?: boolean;
};

export default function HelpHotspot({ topic, compact = false }: HelpHotspotProps) {
  const enabled = useGame((state) => state.contextualHelpEnabled);
  const openHelp = useGame((state) => state.openHelp);
  if (!enabled) return null;

  const onClick = (event: MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
    openHelp(topic);
  };

  return (
    <span
      className={`${styles.hotspot} ${compact ? styles.compact : ""}`}
      role="button"
      tabIndex={0}
      aria-label="Explain this element"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          openHelp(topic);
        }
      }}
    >
      i
    </span>
  );
}
