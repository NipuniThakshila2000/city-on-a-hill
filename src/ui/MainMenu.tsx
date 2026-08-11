import type { HelperId } from "../game/types";
import { levels } from "../levels";
import { availableHelpers, useGame } from "../store/useGame";
import binderImage from "../assets/characters/binder.webp";
import destroyerImage from "../assets/characters/destroyer.webp";
import looserImage from "../assets/characters/looser.webp";
import protectorImage from "../assets/characters/protector.webp";
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
    summary: "Holds ground and turns paths aside."
  },
  {
    id: "destroyer",
    name: "The Destroyer",
    image: destroyerImage,
    mark: "D",
    summary: "Answers any threat, at a cost."
  },
  {
    id: "binder",
    name: "The Binder",
    image: binderImage,
    mark: "B",
    summary: "Locks a square and gives up freedom."
  },
  {
    id: "looser",
    name: "The Looser",
    image: looserImage,
    mark: "L",
    summary: "Fast, fragile, and useful in the way."
  }
];

type MainMenuProps = {
  onStart: () => void;
  onTutorial: () => void;
};

export default function MainMenu({ onStart, onTutorial }: MainMenuProps) {
  const { campaign, helper, level, startLevel } = useGame();

  return (
    <main className={styles.menu}>
      <section className={styles.hero} aria-label="Main menu">
        <div className={styles.topLabel}>
          <span />
          <p>Main Menu</p>
          <span />
        </div>

        <div className={styles.scene}>
          <div className={styles.skyline}>
            <span className={styles.tower} />
            <span className={styles.roof} />
            <span className={styles.wall} />
          </div>
          <img className={styles.heroCharacter} src={protectorImage} alt="" />
          <div className={styles.map}>
            <div className={styles.lightBox} />
            <div className={styles.lamp} />
            <div className={styles.houses}>
              <span />
              <span />
              <span />
            </div>
            <span className={styles.edgeOne}>X</span>
            <span className={styles.edgeTwo}>X</span>
            <span className={styles.edgeThree}>?</span>
          </div>
          <div className={styles.copy}>
            <h1>City on a Hill</h1>
            <p>Keep the lamp lit. Carry light down to the houses.</p>
            <nav className={styles.menuList} aria-label="Main commands">
              <button className={styles.primary} onClick={onStart}>Continue</button>
              <button onClick={() => startLevel(1, helper)}>New Game</button>
              <button onClick={onTutorial}>Tutorial</button>
              <button onClick={onStart}>Level {level.id}</button>
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
