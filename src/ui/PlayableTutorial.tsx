import styles from "./PlayableTutorial.module.css";

export type TutorialStep = {
  title: string;
  act: string;
  game: string;
  scripture: string;
  cms: string;
  purpose: string;
  boardSquares?: string[];
  actions?: string[];
  view?: boolean;
  endTurn?: boolean;
};

export const tutorialSteps: TutorialStep[] = [
  {
    title: "Begin at the lamp",
    act: "Watch the center and the three houses. The lamp at D4 is the source; the houses at C7, D7, and E7 are where the light must arrive.",
    game: "You win by building enough cornerstones to light every house before the turn limit, while keeping the lamp from taking three hits.",
    scripture: "Matthew 5:14-16 frames the city as visible witness, not private survival.",
    cms: "CMS Deep Dive connects this to carrying light from the kept center into real houses, people, and assignments.",
    purpose: "Every move should either preserve the lamp, prepare a path, answer darkness, or move light toward the houses.",
    boardSquares: ["D4", "C7", "D7", "E7"]
  },
  {
    title: "Read before and after",
    act: "Use the tab switch at the top: YESOD is Before and MALKUT is After.",
    game: "YESOD shows the board as it is now. MALKUT previews coming attacks, so you can plan before darkness reaches the lamp.",
    scripture: "Discernment means noticing what is present and what is approaching before acting.",
    cms: "The CMS lesson connection is timing: do not only react after pressure arrives; learn to read the pattern early.",
    purpose: "Switch views before ending a turn so the next move is intentional.",
    view: true
  },
  {
    title: "Protector",
    act: "Select the Protector at D5. The highlighted nearby squares show the area he can cover.",
    game: "The Protector does not attack. His role is presence: he shields nearby lanes and makes darkness move around him.",
    scripture: "Psalm 91 gives the image of covering, refuge, and guarded space.",
    cms: "CMS teaching connects covering to faithful position. Protection is not noisy, but it changes what can reach the lamp.",
    purpose: "Move the Protector when a lane needs resistance or when a house path needs to stay open.",
    boardSquares: ["D5", "C5", "D4", "E5", "D6"]
  },
  {
    title: "Binder",
    act: "Select the Binder at C4, then use Lock when you need to close a lane.",
    game: "Lock creates a blocked square that darkness cannot pass through. The Binder gives up freedom when locked, so timing matters.",
    scripture: "Matthew 16:19 gives the language of binding as authority with responsibility.",
    cms: "The CMS connection is constraint. Some paths should be closed so the light-bearing path can remain clear.",
    purpose: "Use Lock to stop an approach lane before the attack gets too close.",
    boardSquares: ["C4", "B4", "C3", "C5"],
    actions: ["lock"]
  },
  {
    title: "Looser",
    act: "Select the Looser at E4 when a locked lane needs to open again.",
    game: "Release removes a lock. The Looser is quick but fragile, so release should be careful rather than casual.",
    scripture: "Loosing points to ordered release: what was bound can be opened when the assignment requires it.",
    cms: "CMS teaching treats release as stewardship, not permission to undo discipline without purpose.",
    purpose: "Use Release when an old block now prevents movement, building, or rescue.",
    boardSquares: ["E4", "D4", "E5", "F4"],
    actions: ["release"]
  },
  {
    title: "Destroyer",
    act: "Select the Destroyer at D3, then attack a highlighted darkness tile when a threat must be removed.",
    game: "Destroy is limited by charges and triggers a Bible verse guess. The attack only lands when the verse check is handled correctly.",
    scripture: "This role teaches that confrontation must be governed by scripture rather than impulse.",
    cms: "CMS frames decisive action as timed, accountable, and submitted to the Word.",
    purpose: "Use Destroy for threats that cannot be handled by covering, binding, or movement.",
    boardSquares: ["D3", "A4", "G2"],
    actions: ["attack"]
  },
  {
    title: "Build",
    act: "Move a player toward D6 and the houses, then use Build when the selected player stands on a buildable square.",
    game: "Building creates cornerstones that carry light outward. Poor soil can delay the work, so watch the board and the console.",
    scripture: "Building makes the invisible assignment visible through faithful placement.",
    cms: "The CMS connection is formation: light reaches houses through repeated, concrete obedience, not only defense.",
    purpose: "Build when the move extends light toward C7, D7, or E7 without exposing the lamp.",
    boardSquares: ["D6", "C7", "D7", "E7"],
    actions: ["build"]
  },
  {
    title: "End turn and read the console",
    act: "Press End turn after moving and acting. Watch the bottom console after every attack, mistake, warning, build, or win.",
    game: "The console records what happened and highlights important activity, including attacks and mistakes.",
    scripture: "Reviewing the fruit of a turn teaches sober attention: action, consequence, correction.",
    cms: "CMS Deep Dive uses reflection so players learn why a move helped or harmed the assignment.",
    purpose: "End the turn only after checking the after-view, then use the console to learn what changed.",
    endTurn: true
  }
];

type PlayableTutorialProps = {
  step: number;
  onStep: (step: number) => void;
  onClose: () => void;
};

export default function PlayableTutorial({ step, onStep, onClose }: PlayableTutorialProps) {
  const current = tutorialSteps[step];
  const isFirst = step === 0;
  const isLast = step === tutorialSteps.length - 1;

  return (
    <aside className={styles.panel} aria-label="Playable tutorial">
      <header>
        <p>Playable tutorial level</p>
        <h2>{current.title}</h2>
        <span>{step + 1} / {tutorialSteps.length}</span>
      </header>

      <div className={styles.textBoxes}>
        <section>
          <h3>Act</h3>
          <p>{current.act}</p>
        </section>
        <section>
          <h3>Game role</h3>
          <p>{current.game}</p>
        </section>
        <section>
          <h3>Scriptural connection</h3>
          <p>{current.scripture}</p>
        </section>
        <section>
          <h3>CMS connection</h3>
          <p>{current.cms}</p>
        </section>
        <section>
          <h3>Purpose of the move</h3>
          <p>{current.purpose}</p>
        </section>
      </div>

      <footer>
        <button onClick={() => onStep(Math.max(0, step - 1))} disabled={isFirst}>Back</button>
        <button onClick={() => (isLast ? onClose() : onStep(step + 1))}>{isLast ? "Finish" : "Next"}</button>
        <button onClick={onClose}>Exit</button>
      </footer>
    </aside>
  );
}
