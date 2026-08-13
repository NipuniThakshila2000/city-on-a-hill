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
          <h3>The goal</h3>
          <p>Two things:</p>
          <ol>
            <li>Keep the lamp lit. It's in the middle of the board. If darkness hits it three times, you lose.</li>
            <li>Get light down to the three houses at the bottom.</li>
          </ol>
          <p>You do not win by killing everything.</p>

          <h3>The board</h3>
          <p>A 7×7 grid. Your temple sits dead centre. The three houses are at the bottom, in the dark.</p>
          <p>Light spreads two squares from the temple. That's not far enough to reach the houses — so you have to build.</p>

          <h3>Your turn</h3>
          <p>Each of your four pieces gets one move and one action per turn. Move first, then act — or just act.</p>
          <p>When you're done, hit End turn. Then the darkness moves. Then it's your turn again.</p>

          <h3>Seeing what's coming</h3>
          <p className={styles.wideSeeing}>Two boards sit side by side. The left one is Now. The right one is Coming — it shows where darkness will appear, two turns before it does.</p>
          <p className={styles.narrowSeeing}>Two views of the board. Now shows what's there. Coming shows where darkness will appear, two turns before it does — switch between them with the button above the board.</p>
          <p>So you're never surprised. You just never have enough pieces to cover everything you can see.</p>

          <h3>Your four pieces</h3>
          <p>Protector — moves 1 square. Can't attack at all. Protects his square and the four around it. Darkness can't walk into those squares.</p>
          <p>Defender — flies anywhere, hits anything. Only 3 uses per level.</p>
          <p>Binder — moves 1 square. Locks the square he's on. Nothing crosses it — including your own pieces. He's stuck there until he unlocks.</p>
          <p>Looser — moves 3 squares. Unlocks things. Dies in one hit.</p>

          <h3>Building light</h3>
          <p>Stand a piece on an empty square and choose Build.</p>
          <p>If the soil is bad, you have to spend a turn preparing it first. Then plant. Then wait two turns while it finishes.</p>
          <p>Once it's done, that square lights two squares around it. Build in the right place and the light reaches the houses.</p>
          <p>Build early, while the board is quiet. A half-built cornerstone gets destroyed if darkness walks onto it.</p>

          <h3>Fighting</h3>
          <p>When you attack darkness — or it attacks you — a verse appears with words missing.</p>
          <p>Fill in the blanks. Get it right and your attack lands. Get it wrong and you take the hit instead.</p>
          <p>You get up to three tries, with hints after each miss. How many blanks you face depends on how strong your piece is against that enemy — a strong match gives you one blank and three tries, a bad match gives you four blanks and one try.</p>
          <p>Each piece has its own passage. The Protector fights with Psalm 91, the Defender with Psalm 109, the Binder with Matthew 16:19, the Looser with Colossians 1:13.</p>
          <p>Only four passages in the whole game. You'll know them by the end.</p>

          <h3>Pick a helper</h3>
          <p>Before each level, choose one of the seven spirits.</p>
          <ul>
            <li>Counsel — see one extra turn into the future</li>
            <li>Might — the Protector covers more ground</li>
            <li>Knowledge — you can see which squares have bad soil</li>
          </ul>
          <p>You only get one. The same level plays differently depending on which you brought.</p>

          <h3>Healing</h3>
          <p>Any piece standing on a lit square heals 1 HP each turn.</p>
          <p>That's why light matters twice — it wins you the level, and it keeps your pieces alive.</p>

          <h3>One warning</h3>
          <p>The Defender is the easy answer. He kills anything from anywhere.</p>
          <p>Use him when another piece could have handled it, and eventually he stops waiting for your orders.</p>
        </article>
        <div className={styles.actions}>
          <button onClick={onClose}>Close</button>
          {onDemo && <button onClick={onDemo}>Watch a demo</button>}
        </div>
      </div>
    </section>
  );
}
