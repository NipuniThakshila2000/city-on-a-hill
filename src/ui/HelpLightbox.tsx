import { useEffect, useState } from "react";
import { HELP_COPY } from "./HelpContent";
import { useGame } from "../store/useGame";
import styles from "./HelpLightbox.module.css";

export default function HelpLightbox() {
  const topic = useGame((state) => state.activeHelpTopic);
  const closeHelp = useGame((state) => state.closeHelp);
  const toggleContextualHelp = useGame((state) => state.toggleContextualHelp);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 520px), (hover: none) and (pointer: coarse)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 520px), (hover: none) and (pointer: coarse)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  if (!topic) return null;
  const copy = HELP_COPY[topic];

  return (
    <section className={styles.overlay} role="dialog" aria-modal="true" aria-label={copy.title}>
      <article className={styles.panel}>
        <header>
          <span>Guide</span>
          <h2>{copy.title}</h2>
        </header>
        {copy.body.map((line) => <p key={line}>{line}</p>)}
        <div className={styles.actions}>
          <button onClick={closeHelp}>Close</button>
          {!isMobile && <button onClick={toggleContextualHelp}>Turn guide icons off</button>}
        </div>
      </article>
    </section>
  );
}
