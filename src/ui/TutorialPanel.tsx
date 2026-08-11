import styles from "./TutorialPanel.module.css";

type TutorialPanelProps = {
  compact?: boolean;
  onClose: () => void;
};

export default function TutorialPanel({ compact = false, onClose }: TutorialPanelProps) {
  return (
    <section className={compact ? styles.drawer : styles.overlay} aria-label="Tutorial">
      <div className={styles.panel}>
        <header>
          <p>visible walk-through</p>
          <h2>How to play the four roles</h2>
        </header>
        <div className={styles.walkthrough}>
          <article>
            <span className={styles.arrow}>{"->"}</span>
            <strong>1. Choose YESOD or MALKUT</strong>
            <p>Press MALKUT for the current before board. Press YESOD to preview the after view and incoming attacks.</p>
          </article>
          <article>
            <span className={styles.arrow}>{"->"}</span>
            <strong>2. Select a player</strong>
            <p>Click a player on the board. Yellow squares show where that player can move.</p>
          </article>
          <article>
            <span className={styles.arrow}>{"->"}</span>
            <strong>3. Press an action button</strong>
            <p>Use Lock, Unlock, Release, Build, or Destroy when the selected role is allowed to act.</p>
          </article>
          <article>
            <span className={styles.arrow}>{"->"}</span>
            <strong>4. End turn</strong>
            <p>Threats move after End turn. Any attack is written into the bottom console with a highlight.</p>
          </article>
        </div>
        <div className={styles.roles} aria-label="Player roles">
          <h3>Four player roles</h3>
          <p><strong>Protector:</strong> blocks nearby attack movement and shields the lamp path.</p>
          <p><strong>Binder:</strong> locks a square so threats cannot pass through that lane.</p>
          <p><strong>Looser:</strong> releases a lock when the board needs to open again.</p>
          <p><strong>Destroyer:</strong> removes a threat, but should be used sparingly.</p>
        </div>
        <div className={styles.keys}>
          <span>Arrows: focus square</span>
          <span>Enter: select or move</span>
          <span>Tab: MALKUT / YESOD</span>
        </div>
        <button onClick={onClose}>{compact ? "Hide tutorial" : "Back"}</button>
      </div>
    </section>
  );
}
