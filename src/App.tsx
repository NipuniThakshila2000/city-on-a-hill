import { useEffect, useState } from "react";
import { BOARD_SIZE } from "./game/constants";
import { inBounds } from "./game/distance";
import { levels } from "./levels";
import { availableHelpers, useGame } from "./store/useGame";
import ActionPanel from "./ui/ActionPanel";
import ActivityConsole from "./ui/ActivityConsole";
import Board from "./ui/Board";
import LevelEnd from "./ui/LevelEnd";
import MainMenu from "./ui/MainMenu";
import PlayableTutorial, { tutorialSteps } from "./ui/PlayableTutorial";
import TutorialPanel from "./ui/TutorialPanel";
import TurnBar from "./ui/TurnBar";
import VerseCheckModal from "./ui/VerseCheckModal";
import styles from "./App.module.css";

export default function App() {
  const [ready, setReady] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
  const state = useGame();
  const activeTutorial = tutorialStep === null ? null : tutorialSteps[tutorialStep];
  const startPlayableTutorial = () => {
    state.startLevel(1, state.helper);
    setReady(true);
    setShowTutorial(false);
    setTutorialStep(0);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        state.toggleMode();
        return;
      }
      const delta =
        event.key === "ArrowUp" ? { x: 0, y: -1 } :
        event.key === "ArrowRight" ? { x: 1, y: 0 } :
        event.key === "ArrowDown" ? { x: 0, y: 1 } :
        event.key === "ArrowLeft" ? { x: -1, y: 0 } :
        null;
      if (delta) {
        event.preventDefault();
        const next = { x: state.selectedSquare.x + delta.x, y: state.selectedSquare.y + delta.y };
        if (inBounds(next)) state.selectSquare(next);
      }
      if (event.key === "Enter") {
        const piece = Object.values(state.pieces).find(
          (p) => p.alive && p.pos.x === state.selectedSquare.x && p.pos.y === state.selectedSquare.y
        );
        if (piece) state.selectPiece(piece.id);
        else state.moveSelected(state.selectedSquare);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state]);

  if (!ready) {
    return (
      <>
        <MainMenu onStart={() => setReady(true)} onTutorial={startPlayableTutorial} />
        {showTutorial && <TutorialPanel onClose={() => setShowTutorial(false)} />}
      </>
    );
  }

  return (
    <main className={styles.app} style={{ filter: `brightness(${1 - state.templeHits * 0.18}) saturate(${1 - state.templeHits * 0.22})` }}>
      <nav className={styles.levels} aria-label="Levels">
        <button onClick={() => setReady(false)}>Menu</button>
        <button onClick={startPlayableTutorial}>Tutorial</button>
        {levels.map((level) => (
          <button key={level.id} onClick={() => state.startLevel(level.id, state.helper)} disabled={level.id > state.campaign.highestUnlockedLevel}>
            {level.id}
          </button>
        ))}
        <select value={state.helper} onChange={(e) => state.startLevel(state.level.id, e.target.value as (typeof availableHelpers)[number])}>
          {availableHelpers.map((helper) => (
            <option key={helper} value={helper} disabled={!["counsel", "might", "knowledge"].includes(helper)}>
              {helper}
            </option>
          ))}
        </select>
      </nav>
      <TurnBar tutorialView={!!activeTutorial?.view} tutorialEndTurn={!!activeTutorial?.endTurn} />
      <section className={styles.table}>
        <Board tutorialSquares={activeTutorial?.boardSquares ?? []} />
        <ActionPanel tutorialActions={activeTutorial?.actions ?? []} />
      </section>
      <ActivityConsole />
      {showTutorial && <TutorialPanel compact onClose={() => setShowTutorial(false)} />}
      {tutorialStep !== null && (
        <PlayableTutorial
          step={tutorialStep}
          onStep={setTutorialStep}
          onClose={() => setTutorialStep(null)}
        />
      )}
      <VerseCheckModal />
      <LevelEnd />
    </main>
  );
}
