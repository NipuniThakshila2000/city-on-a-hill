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
          <p>first watch</p>
          <h2>How to keep the lamp lit</h2>
        </header>
        <ol>
          <li>Select a piece on the board. Legal movement squares glow yellow.</li>
          <li>Move first, then act. If a piece moves this turn, it cannot build until next turn.</li>
          <li>Use Coming view or Tab to see authored threat arrivals before they land.</li>
          <li>Build at D6 to extend light to C7, D7, and E7. Poor soil takes one prepare action first.</li>
          <li>Use the Destroyer sparingly. The game remembers when another answer would have served.</li>
        </ol>
        <div className={styles.keys}>
          <span>Arrows: focus square</span>
          <span>Enter: select or move</span>
          <span>Tab: Now / Coming</span>
        </div>
        <button onClick={onClose}>{compact ? "Hide tutorial" : "Back"}</button>
      </div>
    </section>
  );
}
