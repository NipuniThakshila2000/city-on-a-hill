import { useEffect, useState } from "react";
import { BOARD_SIZE } from "./game/constants";
import { inBounds } from "./game/distance";
import { levels } from "./levels";
import { availableHelpers, useGame } from "./store/useGame";
import ActionPanel from "./ui/ActionPanel";
import ActivityToast from "./ui/ActivityToast";
import Board from "./ui/Board";
import DemoMode from "./ui/DemoMode";
import HelpHotspot from "./ui/HelpHotspot";
import HelpLightbox from "./ui/HelpLightbox";
import LevelEnd from "./ui/LevelEnd";
import MainMenu from "./ui/MainMenu";
import ServantsScreen from "./ui/ServantsScreen";
import TutorialPanel from "./ui/TutorialPanel";
import TurnBar from "./ui/TurnBar";
import VerseCheckModal from "./ui/VerseCheckModal";
import styles from "./App.module.css";

export default function App() {
  const [screen, setScreen] = useState<"menu" | "game" | "demo" | "servants">("menu");
  const [showTutorial, setShowTutorial] = useState(false);
  const state = useGame();
  const warningNotice = useGame((store) => store.warningNotice);
  const clearWarningNotice = useGame((store) => store.clearWarningNotice);

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

  if (screen === "demo") {
    return <DemoMode onSkip={() => setScreen("menu")} />;
  }

  if (screen === "menu") {
    return (
      <>
        <MainMenu
          onStart={() => setScreen("game")}
          onLoad={() => {
            state.loadCurrentGame();
            setScreen("game");
          }}
          onTutorial={() => setShowTutorial(true)}
          onDemo={() => {
            setShowTutorial(false);
            setScreen("demo");
          }}
          onServants={() => setScreen("servants")}
        />
        {showTutorial && (
          <TutorialPanel
            onClose={() => setShowTutorial(false)}
            onDemo={() => {
              setShowTutorial(false);
              setScreen("demo");
            }}
          />
        )}
      </>
    );
  }

  if (screen === "servants") {
    return <ServantsScreen onBack={() => setScreen("menu")} />;
  }

  return (
    <main
      className={styles.app}
      style={{ filter: `brightness(${1 - state.templeHits * 0.18}) saturate(${1 - state.templeHits * 0.22})` }}
      onPointerDownCapture={(event) => {
        if (!warningNotice) return;
        const target = event.target as HTMLElement;
        if (!target.closest("[data-warning-lightbox]")) clearWarningNotice();
      }}
    >
      <nav className={styles.levels} aria-label="Levels">
        <button onClick={() => setScreen("menu")}>Menu</button>
        <button onClick={() => setScreen("servants")}>Servants</button>
        <button onClick={() => setShowTutorial(true)}>Help</button>
        <button onClick={state.saveCurrentGame}>Save <HelpHotspot topic="save" compact /></button>
        <button onClick={state.loadCurrentGame} disabled={!state.hasSavedGame}>Load</button>
        <button onClick={state.toggleContextualHelp}>{state.contextualHelpEnabled ? "Guide icons on" : "Guide icons off"}</button>
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
      <section className={`${styles.levelSign} helpReveal`} aria-label="Current level">
        <div>
          <span>Current Level</span>
          <h1>Level {state.level.id}</h1>
        </div>
        <p>
          {state.level.id === 1
            ? "Prototype: establish a connected city of Light."
            : `Turn ${state.turn} of ${state.level.turns}. Read Coming, preserve the Light Network, and hold the houses.`}
        </p>
        <strong>{state.phase === "player" ? "Player Phase" : state.phase}</strong>
        <HelpHotspot topic="level" />
      </section>
      <TurnBar />
      <section className={styles.table}>
        <ActivityToast />
        <div className={styles.desktopBoards} aria-label="Before and after board views">
          <section className={styles.boardFrame} aria-label="YESOD before board">
            <h2>YESOD <span>Before <HelpHotspot topic="now" compact /></span></h2>
            <Board viewMode="now" />
          </section>
          <section className={styles.boardFrame} aria-label="MALKUT after board">
            <h2>MALKUT <span>After <HelpHotspot topic="coming" compact /></span></h2>
            <Board viewMode="coming" interactive={false} />
          </section>
        </div>
        <div className={styles.mobileBoard}>
          <Board />
        </div>
        <ActionPanel />
      </section>
      {showTutorial && (
        <TutorialPanel
          compact
          onClose={() => setShowTutorial(false)}
          onDemo={() => {
            setShowTutorial(false);
            setScreen("demo");
          }}
        />
      )}
      {warningNotice && (
        <aside className={styles.warningLightbox} data-warning-lightbox role="alert" aria-live="assertive">
          <strong>Warning</strong>
          <p>{warningNotice.text}</p>
        </aside>
      )}
      <VerseCheckModal />
      <HelpLightbox />
      <LevelEnd />
    </main>
  );
}
