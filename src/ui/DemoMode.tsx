import { useEffect, useMemo, useRef, useState } from "react";
import { DEMO_STEPS, demoHighlightSquares, runDemoAction, startDemoLevel } from "../demo/demoScript";
import { useGame } from "../store/useGame";
import Board from "./Board";
import LevelEnd from "./LevelEnd";
import styles from "./DemoMode.module.css";

type DemoModeProps = {
  onSkip: () => void;
};

const DEFAULT_HOLD_BEFORE = 1000;
const DEFAULT_ACTION_TIME = 760;
const DEFAULT_HOLD_AFTER = 2500;
const PLAYBACK_SPEEDS = [0.5, 1, 1.5, 2] as const;

export default function DemoMode({ onSkip }: DemoModeProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<(typeof PLAYBACK_SPEEDS)[number]>(1);
  const [typedAnswer, setTypedAnswer] = useState("");
  const state = useGame();
  const timers = useRef<number[]>([]);
  const intervals = useRef<number[]>([]);
  const step = DEMO_STEPS[stepIndex];
  const progress = ((stepIndex + 1) / DEMO_STEPS.length) * 100;
  const highlightSquares = useMemo(() => demoHighlightSquares(state, step?.highlight), [state, step?.highlight]);
  const showSkillTree = step?.id === "servant-skills" || step?.id === "skill-forks";

  useEffect(() => {
    startDemoLevel();
    setStepIndex(0);
    setTypedAnswer("");
  }, []);

  useEffect(() => {
    if (paused || !step) return;
    const clearScheduled = () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      intervals.current.forEach((id) => window.clearInterval(id));
      timers.current = [];
      intervals.current = [];
    };
    const schedule = (callback: () => void, delay: number) => {
      const id = window.setTimeout(callback, delay);
      timers.current.push(id);
      return id;
    };

    clearScheduled();

    const holdBefore = step.caption ? step.holdBefore ?? DEFAULT_HOLD_BEFORE : 80;
    const actionTime = step.actionTime ?? DEFAULT_ACTION_TIME;
    const holdAfter = step.holdAfter ?? DEFAULT_HOLD_AFTER;
    const scaled = (ms: number) => Math.max(1, Math.round(ms / playbackSpeed));

    schedule(() => {
      try {
        if (step.typeAnswer) {
          const answers = useGame.getState().combatCheck?.answers.join(" ") ?? "";
          let index = 0;
          const typeTimer = window.setInterval(() => {
            index += 1;
            setTypedAnswer(answers.slice(0, index));
            if (index >= answers.length) window.clearInterval(typeTimer);
          }, Math.max(70, Math.floor(scaled(actionTime) / Math.max(answers.length, 1))));
          intervals.current.push(typeTimer);
        }
        if (step.action) {
          schedule(() => {
            try {
              runDemoAction(step.action!);
            } catch (error) {
              console.error(error);
              throw error;
            }
          }, step.typeAnswer ? scaled(actionTime) : 0);
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
      schedule(() => {
        setTypedAnswer("");
        setStepIndex((current) => Math.min(current + 1, DEMO_STEPS.length - 1));
      }, scaled(actionTime + holdAfter));
    }, scaled(holdBefore));

    return clearScheduled;
  }, [paused, playbackSpeed, step, stepIndex]);

  return (
    <main className={styles.demo} aria-label="Demo mode">
      <header className={styles.controls}>
        <button onClick={() => setPaused((value) => !value)}>{paused ? "Play" : "Pause"}</button>
        <button onClick={onSkip}>Skip</button>
        <div className={styles.speed} aria-label="Playback speed">
          {PLAYBACK_SPEEDS.map((speed) => (
            <button
              key={speed}
              className={speed === playbackSpeed ? styles.selectedSpeed : ""}
              onClick={() => setPlaybackSpeed(speed)}
              aria-pressed={speed === playbackSpeed}
            >
              {speed}x
            </button>
          ))}
        </div>
        <div className={styles.progress} aria-label="Demo progress">
          <span style={{ width: `${progress}%` }} />
        </div>
      </header>

      <section className={styles.stage} aria-label="Self-playing Level 1 demo">
        <div className={styles.boards}>
          <section className={styles.boardFrame} aria-label="Now board">
            <h2>Now</h2>
            <Board viewMode="now" interactive={false} tutorialSquares={highlightSquares} />
          </section>
          <section className={styles.boardFrame} aria-label="Coming board">
            <h2>Coming</h2>
            <Board viewMode="coming" interactive={false} tutorialSquares={highlightSquares} />
          </section>
        </div>

        <div className={styles.caption} aria-live="polite">
          {step?.caption && <p>{step.caption}</p>}
        </div>

        {showSkillTree && (
          <aside className={styles.skillCallout} aria-label="Demo skill tree example">
            <header>
              <span>Protector</span>
              <strong>8 Oil</strong>
            </header>
            <div className={styles.skillRows}>
              <div>
                <small>Tier 1</small>
                <button className={styles.skillBought}>Shield of Faith</button>
                <button className={step.id === "skill-forks" ? styles.skillClosed : ""}>Belt of Truth</button>
              </div>
              <div>
                <small>Tier 2</small>
                <button>Breastplate</button>
                <button>Feet Shod</button>
              </div>
              <div>
                <small>Tier 3</small>
                <button>Under His Wings</button>
                <button>Ten Thousand</button>
              </div>
            </div>
          </aside>
        )}
      </section>

      {state.combatCheck && (
        <section className={styles.verseOverlay} role="dialog" aria-modal="true" aria-label="Verse check">
          <div className={styles.versePanel}>
            <header>
              <p>{state.combatCheck.header}</p>
              <h2>{state.combatCheck.passage}</h2>
            </header>
            <p className={styles.prompt}>{state.combatCheck.prompt}</p>
            <label>
              Fill the blank word{state.combatCheck.blanks === 1 ? "" : "s"}
              <input readOnly value={typedAnswer} placeholder="Type the missing word or words" />
            </label>
            <div className={styles.meta}>
              <span>{state.combatCheck.triesRemaining} {state.combatCheck.triesRemaining === 1 ? "try" : "tries"} remaining</span>
              <span>Hint: {state.combatCheck.hint}</span>
            </div>
          </div>
        </section>
      )}

      <LevelEnd />
    </main>
  );
}
