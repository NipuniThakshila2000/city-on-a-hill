import styles from "./TutorialPanel.module.css";

type TutorialPanelProps = {
  compact?: boolean;
  onClose: () => void;
  onDemo?: () => void;
};

export default function TutorialPanel({ compact = false, onClose, onDemo }: TutorialPanelProps) {
  return (
    <section className={compact ? styles.drawer : styles.overlay} aria-label="How to play">
      <div className={styles.panel}>
        <header>
          <h2>How to play</h2>
        </header>
        <article className={styles.copy}>
          <h3>The Goal</h3>
          <p>Keep the Lamp at the central Cornerstone lit. If Darkness reaches it three times, you lose.</p>
          <p>Carry connected Light from the Cornerstone to the three houses. You do not win by killing everything.</p>

          <h3>The Board</h3>
          <p>The Temple, Lamp, and one Cornerstone sit dead centre. Servants establish Checkpoints of Light that carry its Light outward.</p>
          <p>A Checkpoint only works while it connects back to the Cornerstone, either directly or through another active Checkpoint.</p>

          <h3>Your Turn</h3>
          <p>Each servant gets one move and one action. Move first, then act, or just act. When you end the turn, Darkness moves deterministically.</p>

          <h3>Coming</h3>
          <p className={styles.wideSeeing}>The left board is Now. The right board is Coming. Coming shows entry turns, Darkness type, and predicted route steps.</p>
          <p className={styles.narrowSeeing}>Now shows the present board. Coming shows entry turns, Darkness type, and predicted route steps.</p>
          <p>A solid square shows where Darkness will enter the board. Its number is the fixed arrival turn.</p>
          <p>A dashed square shows where Darkness is predicted to move next. Its number is the future turn it is expected to reach that square.</p>
          <p>Move, Bind, Brace, Disperse, or establish a Checkpoint and the future route redraws immediately.</p>
          <p>Solid means where Darkness is coming from. Dashed means where Darkness is currently heading.</p>

          <h3>Servants</h3>
          <p>Protector - never attacks. Guard blocks nearby entry. Brace widens protection for the next Enemy Phase.</p>
          <p>Binder - Bind locks a square. Release Bind opens it. Anchor holds adjacent Darkness for one Enemy Phase.</p>
          <p>Looser - Release removes a Bind. Free restores a suppressed Checkpoint. Disperse pushes adjacent Darkness away.</p>
          <p>Destroyer - strikes hard from anywhere, but restraint matters. Watch or Stay Thy Hand can preserve Order.</p>

          <h3>Checkpoints Of Light</h3>
          <p>Stand a servant on an empty square and choose Establish Checkpoint.</p>
          <p>Poor soil must be prepared first. A new Checkpoint stabilizes during Upkeep and is vulnerable until then.</p>
          <p>Houses receive Light only through the connected network. Suppressed or disconnected Checkpoints dim until restored.</p>

          <h3>Houses</h3>
          <p>Peace must stay connected for two complete turns. Wisdom needs a Scripture interaction once Light reaches it. Mercy cannot stabilize while Darkness is adjacent.</p>

          <h3>Scripture</h3>
          <p>Major actions can call for Scripture. The four passages remain Psalm 91, Psalm 109, Matthew 16:19, and Colossians 1:13.</p>

          <h3>Order</h3>
          <p>Order rises when routes are redirected, houses stabilize, the Lamp is protected, and restraint holds. It can fall when the network breaks or the centre is struck.</p>

          <h3>Oil</h3>
          <p>Oil is earned for completing levels, holding houses in Light, preserving the Lamp and servants, and passing verse checks. Oil is not awarded for kills.</p>

          <h3>One Warning</h3>
          <p>The Destroyer is the easy answer. Use him when another servant could have handled it, and eventually he stops waiting for your orders.</p>
        </article>
        <div className={styles.actions}>
          <button onClick={onClose}>Close</button>
          {onDemo && <button onClick={onDemo}>Watch a demo</button>}
        </div>
      </div>
    </section>
  );
}
