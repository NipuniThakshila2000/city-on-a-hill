import { useEffect, useRef } from "react";
import type { MouseEvent, PointerEvent as ReactPointerEvent } from "react";
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
  const pressTimer = useRef<number | null>(null);
  const longPressTriggered = useRef(false);
  if (!enabled) return null;

  const clearPressTimer = () => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const onClick = (event: MouseEvent<HTMLSpanElement>) => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    openHelp(topic);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === "mouse") return;
    longPressTriggered.current = false;
    clearPressTimer();
    pressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true;
      openHelp(topic);
    }, 450);
  };

  const cancelLongPress = () => {
    clearPressTimer();
  };

  useEffect(() => cancelLongPress, []);

  return (
    <span
      className={`${styles.hotspot} ${compact ? styles.compact : ""}`}
      role="button"
      tabIndex={0}
      aria-label="Explain this element"
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={cancelLongPress}
      onPointerLeave={cancelLongPress}
      onPointerCancel={cancelLongPress}
      onContextMenu={(event) => {
        event.preventDefault();
      }}
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
