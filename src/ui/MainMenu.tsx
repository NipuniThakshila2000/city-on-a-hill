import { useState } from "react";
import type { HelperId } from "../game/types";
import { levels } from "../levels";
import { availableHelpers, useGame } from "../store/useGame";
import binderImage from "../assets/characters/binder.webp";
import destroyerImage from "../assets/characters/destroyer.webp";
import looserImage from "../assets/characters/looser.webp";
import protectorImage from "../assets/characters/protector.webp";
import cmsLogoImage from "../assets/structures/cms-redux-logo.webp";
import homeBannerImage from "../assets/home-banner.jpeg";
import styles from "./MainMenu.module.css";

const helperNames: Record<HelperId, string> = {
  counsel: "Counsel",
  might: "Might",
  knowledge: "Knowledge",
  understanding: "Understanding",
  fear: "Fear of the Lord",
  wisdom: "Wisdom",
  spirit: "Spirit of the Lord"
};

const helperEffects: Record<HelperId, string> = {
  counsel: "See one extra turn into the future.",
  might: "The Protector covers diagonals too.",
  knowledge: "Poor soil is visible before you try.",
  understanding: "Coming soon.",
  fear: "Coming soon.",
  wisdom: "Coming soon.",
  spirit: "Coming soon."
};

const characters = [
  {
    id: "protector",
    name: "The Protector",
    image: protectorImage,
    mark: "P",
    summary: "Holds ground and turns paths aside.",
    teaching: "The Protector connects to the CMS emphasis on covering what carries light. He does not attack; his work is presence, position, and faithful resistance. In play, his protected squares make the invisible work of spiritual covering visible on the board."
  },
  {
    id: "destroyer",
    name: "The Destroyer",
    image: destroyerImage,
    mark: "D",
    summary: "Answers any threat, at a cost.",
    teaching: "The Destroyer represents decisive confrontation. CMS teaching does not frame force as the first answer; the limited charges and verse check show that destruction must be governed by scripture, timing, and responsibility."
  },
  {
    id: "binder",
    name: "The Binder",
    image: binderImage,
    mark: "B",
    summary: "Locks a square and gives up freedom.",
    teaching: "The Binder comes from the lesson language of binding. He closes a path so darkness cannot advance through it. The cost is that a bound position also limits movement, teaching that spiritual authority includes constraint and stewardship."
  },
  {
    id: "looser",
    name: "The Looser",
    image: looserImage,
    mark: "L",
    summary: "Fast, fragile, and useful in the way.",
    teaching: "The Looser connects to the lesson language of loosing. He opens what has been bound when the board needs release. His fragility makes release feel careful rather than casual."
  }
];

const teachingLinks = [
  {
    title: "Lamp",
    body: "The lamp is the center of witness. It teaches that light begins from a kept source before it is carried outward."
  },
  {
    title: "Houses",
    body: "The houses represent the people and places that must receive light. The win condition is not surviving alone; it is making sure the light reaches others."
  },
  {
    title: "Darkness",
    body: "Darkness is pressure, confusion, and opposition moving toward the lamp. Its tiers help players see that not every threat has the same weight."
  },
  {
    title: "YESOD and MALKUT",
    body: "YESOD shows the before/current state. MALKUT shows the after/forecast state. The lesson connection is discernment: seeing what is present and what is approaching."
  },
  {
    title: "Verse checks",
    body: "Attacks are resolved through scripture recall instead of raw numbers alone. Stats decide the difficulty, but the passage decides whether the action lands."
  }
];

type MainMenuProps = {
  onStart: () => void;
  onTutorial: () => void;
  onDemo: () => void;
  onServants: () => void;
  onLoad: () => void;
};

export default function MainMenu({ onStart, onTutorial, onDemo, onServants, onLoad }: MainMenuProps) {
  const [showTeaching, setShowTeaching] = useState(false);
  const {
    campaign,
    helper,
    level,
    startLevel,
    turn,
    threats,
    checkpoints,
    preparedSoil,
    templeHits,
    pieces,
    destroyerCharges,
    hasSavedGame
  } = useGame();
  const hasRunningGame =
    turn > 1 ||
    threats.length > 0 ||
    checkpoints.length > 0 ||
    preparedSoil.length > 0 ||
    templeHits > 0 ||
    destroyerCharges < 3 ||
    Object.values(pieces).some((piece) => {
      const start = level.startPositions[piece.id];
      return (
        piece.pos.x !== start.x ||
        piece.pos.y !== start.y ||
        piece.moved ||
        piece.acted ||
        piece.hp < piece.maxHp ||
        !!piece.locked
      );
    });
  const startNewGame = () => {
    startLevel(1, helper);
    onStart();
  };
  const commandButtons = (
    <>
      <button
        className={hasRunningGame ? styles.primary : ""}
        onClick={onStart}
        disabled={!hasRunningGame}
        title={hasRunningGame ? "Continue the current run" : "Start a new game first"}
      >
        Continue
      </button>
      <button onClick={startNewGame}>New Game</button>
      <button onClick={onLoad} disabled={!hasSavedGame}>Load Saved Game</button>
      <button onClick={onTutorial}>How to play</button>
      <button onClick={onDemo}>Watch a demo</button>
      <button onClick={onServants}>Servants</button>
      <button onClick={() => setShowTeaching(true)}>Teaching</button>
      <button onClick={onStart} disabled={!hasRunningGame}>Level {level.id}</button>
    </>
  );

  if (showTeaching) {
    return (
      <main className={styles.menu}>
        <section className={styles.teachingPage} aria-label="Teaching">
          <div className={styles.cmsHeader}>
            <img className={styles.cmsLogo} src={cmsLogoImage} alt="CMS Redux" />
            <div>
              <p>Deep Dive teaching companion</p>
              <h1>Teaching</h1>
            </div>
          </div>

          <p className={styles.disclaimer}>
            This game is exclusively for Deep Dive participants and should not be shared with others.
          </p>

          <article className={styles.purpose}>
            <h2>Purpose of the game</h2>
            <p>
              City on a Hill turns CMS teaching into a playable exercise of discernment, covering, binding,
              loosing, restraint, and scripture-guided action. The board is designed to help participants
              feel the cost of timing: light must be protected, threats must be read before they arrive, and
              every powerful action needs a passage behind it.
            </p>
          </article>

          <section className={styles.teachingGrid} aria-label="Game elements and CMS teaching connections">
            {teachingLinks.map((item) => (
              <article key={item.title}>
                <h2>{item.title}</h2>
                <p>{item.body}</p>
              </article>
            ))}
          </section>

          <section className={styles.characterBreakdown} aria-label="Character breakdown">
            <h2>Character breakdown</h2>
            {characters.map((character) => (
              <article key={character.id}>
                <img src={character.image} alt="" />
                <div>
                  <span>{character.mark}</span>
                  <h3>{character.name}</h3>
                  <p>{character.teaching}</p>
                </div>
              </article>
            ))}
          </section>

          <button className={styles.backButton} onClick={() => setShowTeaching(false)}>Back to menu</button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.menu}>
      <section className={styles.hero} aria-label="Main menu">
        <div className={styles.topLabel}>
          <span />
          <p>CMS Deep Dive</p>
          <span />
        </div>

        <div className={styles.scene}>
          <img className={styles.homeBanner} src={homeBannerImage} alt="" />
          <div className={styles.copy}>
            <img className={styles.cmsLogo} src={cmsLogoImage} alt="CMS Redux" />
            <h1>City on a Hill</h1>
            <p className={styles.logLine}>A scripture strategy game about keeping the lamp lit and carrying light to the houses.</p>
            <p className={styles.disclaimer}>Exclusively for Deep Dive participants. Do not share with others.</p>
            <nav className={styles.menuList} aria-label="Main commands">
              {commandButtons}
            </nav>
          </div>
        </div>
      </section>

      <section className={styles.roster} aria-label="Pieces">
        {characters.map((character) => (
          <article key={character.id} className={styles.characterCard}>
            <img src={character.image} alt="" />
            <div>
              <span>{character.mark}</span>
              <h2>{character.name}</h2>
              <p>{character.summary}</p>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.setup} aria-label="Level and helper setup">
        <div>
          <h2>Level</h2>
          <div className={styles.levels}>
            {levels.map((candidate) => (
              <button
                key={candidate.id}
                className={candidate.id === level.id ? styles.selected : ""}
                disabled={candidate.id > campaign.highestUnlockedLevel}
                onClick={() => startLevel(candidate.id, helper)}
              >
                {candidate.id}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2>Helper</h2>
          <div className={styles.helpers}>
            {availableHelpers.map((id) => {
              const disabled = !["counsel", "might", "knowledge"].includes(id);
              return (
                <button
                  key={id}
                  className={id === helper ? styles.selected : ""}
                  disabled={disabled}
                  onClick={() => startLevel(level.id, id)}
                >
                  <span>{helperNames[id]}</span>
                  <small>{helperEffects[id]}</small>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
