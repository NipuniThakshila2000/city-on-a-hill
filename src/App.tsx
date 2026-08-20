import { useEffect, useRef, useState } from "react";
import { BOARD_SIZE } from "./game/constants";
import { inBounds } from "./game/distance";
import { levels } from "./levels";
import type { HelpTopicId } from "./game/types";
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
  const longPressTarget = useRef<HTMLElement | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const longPressOpened = useRef(false);

  useEffect(() => {
    const clearLongPress = () => {
      if (longPressTimer.current !== null) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      longPressTarget.current = null;
      longPressOpened.current = false;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-help-topic]");
      const topic = target?.dataset.helpTopic;
      if (!target || !topic) return;
      clearLongPress();
      longPressTarget.current = target;
      longPressOpened.current = false;
      longPressTimer.current = window.setTimeout(() => {
        longPressTimer.current = null;
        longPressOpened.current = true;
        state.openHelp(topic as HelpTopicId);
      }, 450);
    };

    const onPointerUp = () => {
      if (longPressTimer.current !== null) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
        longPressTarget.current = null;
        longPressOpened.current = false;
      }
    };

    const onClickCapture = (event: MouseEvent) => {
      if (!longPressTarget.current) return;
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-help-topic]");
      if (target !== longPressTarget.current) return;
      if (longPressOpened.current) {
        event.preventDefault();
        event.stopPropagation();
      }
      longPressTarget.current = null;
      longPressOpened.current = false;
    };

    const onContextMenu = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-help-topic]");
      if (!target) return;
      event.preventDefault();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointercancel", onPointerUp, true);
    document.addEventListener("click", onClickCapture, true);
    document.addEventListener("contextmenu", onContextMenu, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointercancel", onPointerUp, true);
      document.removeEventListener("click", onClickCapture, true);
      document.removeEventListener("contextmenu", onContextMenu, true);
      if (longPressTimer.current !== null) {
        window.clearTimeout(longPressTimer.current);
      }
      longPressTarget.current = null;
      longPressOpened.current = false;
    };
  }, [state.openHelp]);

  const renderGameControls = (showGuideToggle = true) => (
    <>
      <button data-help-topic="level" onClick={() => setScreen("menu")}>Menu <HelpHotspot topic="level" compact /></button>
      <button data-help-topic="servant" onClick={() => setScreen("servants")}>Servants <HelpHotspot topic="servant" compact /></button>
      <button data-help-topic="scripture" onClick={() => setShowTutorial(true)}>Help <HelpHotspot topic="scripture" compact /></button>
      <button data-help-topic="save" onClick={state.saveCurrentGame}>Save <HelpHotspot topic="save" compact /></button>
      <button data-help-topic="save" onClick={state.loadCurrentGame} disabled={!state.hasSavedGame}>Load <HelpHotspot topic="save" compact /></button>
      {showGuideToggle && (
        <button data-help-topic="level" onClick={state.toggleContextualHelp}>{state.contextualHelpEnabled ? "Guide icons on" : "Guide icons off"} <HelpHotspot topic="level" compact /></button>
      )}
      {levels.map((level) => (
        <button key={level.id} data-help-topic="level" onClick={() => state.startLevel(level.id, state.helper)} disabled={level.id > state.campaign.highestUnlockedLevel}>
          {level.id} <HelpHotspot topic="level" compact />
        </button>
      ))}
      <span className="helpReveal" data-help-topic="servant" style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
        <select value={state.helper} onChange={(e) => state.startLevel(state.level.id, e.target.value as (typeof availableHelpers)[number])}>
          {availableHelpers.map((helper) => (
            <option key={helper} value={helper} disabled={!["counsel", "might", "knowledge"].includes(helper)}>
              {helper}
            </option>
          ))}
        </select>
        <HelpHotspot topic="servant" compact />
      </span>
    </>
  );
  const gameControls = renderGameControls();
  const statusContent = (
    <>
      <section className={`${styles.levelSign} helpReveal`} data-help-topic="level" aria-label="Current level">
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
    </>
  );

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
        {gameControls}
      </nav>
      <details className={styles.mobileControls}>
        <summary>Controls</summary>
        <div className={styles.mobileControlsBody}>{renderGameControls(false)}</div>
      </details>
      <div className={styles.desktopStatus}>{statusContent}</div>
      <details className={styles.mobileStatus}>
        <summary>Status</summary>
        <div className={styles.mobileStatusBody}>{statusContent}</div>
      </details>
      <TurnBar />
      <section className={styles.table}>
        <ActivityToast />
        <div className={styles.desktopBoards} aria-label="Before and after board views">
          <section className={styles.boardFrame} aria-label="YESOD before board">
            <h2 className="helpReveal" data-help-topic="now">YESOD <span>Before <HelpHotspot topic="now" compact /></span></h2>
            <Board viewMode="now" />
          </section>
          <section className={styles.boardFrame} aria-label="MALKUT after board">
            <h2>MALKUT <span>After</span></h2>
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
