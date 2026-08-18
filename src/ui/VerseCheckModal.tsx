import { FormEvent, useState } from "react";
import { PIECE_STATS } from "../game/combat";
import { useGame } from "../store/useGame";
import binderImage from "../assets/characters/binder.webp";
import destroyerCombatImage from "../assets/characters/destroyer-combat.gif";
import looserImage from "../assets/characters/looser.webp";
import enemyCombatImage from "../assets/enemies/enemy-combat.gif";
import styles from "./VerseCheckModal.module.css";

const servantImages = {
  destroyer: destroyerCombatImage,
  binder: binderImage,
  looser: looserImage
} as const;

export default function VerseCheckModal() {
  const check = useGame((state) => state.combatCheck);
  const threat = useGame((state) => state.combatCheck ? state.threats.find((candidate) => candidate.id === state.combatCheck?.defenderThreatId) : undefined);
  const submitVerseGuess = useGame((state) => state.submitVerseGuess);
  const cancelVerseCheck = useGame((state) => state.cancelVerseCheck);
  const [guess, setGuess] = useState("");
  const [fast, setFast] = useState(false);
  const [skipMotion, setSkipMotion] = useState(false);

  if (!check) return null;

  const promptNumber = check.currentPromptIndex + 1;
  const promptCount = check.sequence.length;
  const hp = threat ? `${threat.hp}/${threat.maxHp}` : "--";
  const result = check.announcement?.includes("holds") ? "The Word Holds" : "Battle";

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitVerseGuess(guess);
    setGuess("");
  };

  return (
    <section className={styles.overlay} role="dialog" aria-modal="true" aria-label="Scripture battle screen">
      <form className={`${styles.panel} ${fast ? styles.fast : ""} ${skipMotion ? styles.skipMotion : ""}`} onSubmit={onSubmit}>
        <header className={styles.topBar}>
          <div className={styles.combatant}>
            <h2>{check.attackerName}</h2>
            <p>HP {useGame.getState().pieces[check.attackerId].hp}/{useGame.getState().pieces[check.attackerId].maxHp}</p>
            <strong>Attack {check.attackerOffense}</strong>
          </div>
          <div className={styles.result}>
            <span>{result}</span>
            <p>Margin {check.margin >= 0 ? "+" : ""}{check.margin}</p>
            <small>{check.blanks} blanks, {check.totalTries} {check.totalTries === 1 ? "try" : "tries"}</small>
          </div>
          <div className={`${styles.combatant} ${styles.right}`}>
            <h2>{check.defenderName}</h2>
            <p>Vitality {hp}</p>
            <strong>Defense {check.defenderDefense}</strong>
          </div>
        </header>

        <section className={`${styles.battlefield} ${styles[`tier${threat?.tier ?? 1}`]}`} aria-label={`${check.attackerName} confronts ${check.defenderName}`}>
          <div className={styles.meadow} aria-hidden="true" />
          <img className={styles.servant} src={servantImages[check.attackerId]} alt="" draggable={false} />
          <span className={`${styles.lightStrike} ${styles[check.attackerId]}`} aria-hidden="true" />
          <span className={styles.damageNumber} aria-hidden="true">{check.attackerOffense}</span>
          <img className={styles.darkness} src={enemyCombatImage} alt="" draggable={false} />
          <span className={styles.shadowImpact} aria-hidden="true" />
        </section>

        <section className={styles.bottomPanels}>
          <div className={styles.abilityPanel} aria-label="Combat values">
            <span>{PIECE_STATS[check.attackerId].passage}</span>
            <strong>Attack {check.attackerOffense} vs Defense {check.defenderDefense}</strong>
            <p>{check.header}</p>
          </div>

          <div className={styles.scripturePanel}>
            <div className={styles.sequence}>
              <span>Scripture Sequence</span>
              <strong>{promptNumber} of {promptCount}</strong>
              <div>
                {check.sequence.map((_, index) => (
                  <i key={index} className={index < promptNumber ? styles.activeStep : ""} />
                ))}
              </div>
            </div>
            <h3>{check.passage}</h3>
            <p className={styles.prompt}>{check.prompt}</p>
            {check.announcement && (
              <p className={styles.announcement} role="status" aria-live="polite">
                {check.announcement}
              </p>
            )}
            <label>
              Fill the blank word{check.blanks === 1 ? "" : "s"}
              <input
                autoFocus
                value={guess}
                onChange={(event) => setGuess(event.target.value)}
                placeholder="Type the missing word or words"
              />
            </label>
            <div className={styles.meta}>
              <span>Attempts remaining: {check.triesRemaining}</span>
              <span>Hint: {check.hint}</span>
            </div>
          </div>

          <div className={styles.logPanel} aria-label="Battle log">
            <p>{check.attackerName} confronts {check.defenderName}.</p>
            <p>Scripture determines whether the strike lands.</p>
            <div className={styles.toggles}>
              <button type="button" onClick={() => setFast((value) => !value)} aria-pressed={fast}>Fast</button>
              <button type="button" onClick={() => setSkipMotion((value) => !value)} aria-pressed={skipMotion}>Skip motion</button>
            </div>
          </div>
        </section>

        <div className={styles.actions}>
          <button type="button" onClick={cancelVerseCheck}>Return</button>
          <button type="submit">Set the word</button>
        </div>
      </form>
    </section>
  );
}
