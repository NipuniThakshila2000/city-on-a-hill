import { FormEvent, useState } from "react";
import { useGame } from "../store/useGame";
import styles from "./VerseCheckModal.module.css";

export default function VerseCheckModal() {
  const check = useGame((state) => state.combatCheck);
  const submitVerseGuess = useGame((state) => state.submitVerseGuess);
  const cancelVerseCheck = useGame((state) => state.cancelVerseCheck);
  const [guess, setGuess] = useState("");

  if (!check) return null;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitVerseGuess(guess);
    setGuess("");
  };

  return (
    <section className={styles.overlay} role="dialog" aria-modal="true" aria-label="Verse check">
      <form className={styles.panel} onSubmit={onSubmit}>
        <header>
          <p>{check.header}</p>
          <h2>{check.passage}</h2>
        </header>
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
          <span>{check.triesRemaining} {check.triesRemaining === 1 ? "try" : "tries"} remaining</span>
          <span>Hint: {check.hint}</span>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={cancelVerseCheck}>Cancel</button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </section>
  );
}
