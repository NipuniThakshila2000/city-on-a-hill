import { SKILLS, hasSkill, skillAvailable, skillClosed } from "../game/skills";
import type { CSSProperties } from "react";
import type { PieceId } from "../game/types";
import { useGame } from "../store/useGame";
import binderImage from "../assets/characters/binder.webp";
import destroyerImage from "../assets/characters/destroyer.webp";
import looserImage from "../assets/characters/looser.webp";
import protectorImage from "../assets/characters/protector.webp";
import styles from "./ServantsScreen.module.css";

const pieces: { id: PieceId; name: string; passage: string; image: string; tint: string }[] = [
  { id: "protector", name: "Protector", passage: "Psalm 91", image: protectorImage, tint: "#9b4b3f" },
  { id: "destroyer", name: "Defender", passage: "Psalm 109", image: destroyerImage, tint: "#8b6a2d" },
  { id: "binder", name: "Binder", passage: "Matthew 16:19", image: binderImage, tint: "#32816f" },
  { id: "looser", name: "Looser", passage: "Colossians 1:13", image: looserImage, tint: "#426f8d" }
];

type ServantsScreenProps = {
  onBack: () => void;
};

export default function ServantsScreen({ onBack }: ServantsScreenProps) {
  const campaign = useGame((state) => state.campaign);
  const purchaseSkill = useGame((state) => state.purchaseSkill);

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <button onClick={onBack}>Back</button>
        <h1>Skills</h1>
        <div className={styles.oilBadge} aria-label={`${campaign.oil} Oil`}>
          <span className={styles.oilIcon} />
          <strong>{campaign.oil}</strong>
        </div>
      </header>

      <section className={styles.trees} aria-label="Servant skill trees">
        {pieces.map((piece) => {
          const skills = SKILLS.filter((skill) => skill.piece === piece.id);
          return (
            <article className={styles.tree} style={{ "--tree-color": piece.tint } as CSSProperties} key={piece.id}>
              <div className={styles.portraitWrap}>
                <img src={piece.image} alt="" />
              </div>
              <p className={styles.passage}>{piece.passage}</p>
              <h2>{piece.name}</h2>
              <div className={styles.lattice} aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              {[1, 2, 3].map((tier) => (
                <div className={styles.tier} key={tier}>
                  {skills.filter((skill) => skill.tier === tier).map((skill) => {
                    const bought = hasSkill(campaign, skill.id);
                    const closed = skillClosed(campaign, skill);
                    const available = skillAvailable(campaign, skill);
                    return (
                      <button
                        key={skill.id}
                        className={[
                          styles.skill,
                          bought ? styles.bought : "",
                          closed ? styles.closed : ""
                        ].filter(Boolean).join(" ")}
                        disabled={!available}
                        onClick={() => purchaseSkill(skill.id)}
                      >
                        <span>{skill.fork}</span>
                        <strong>{skill.name}</strong>
                        <small>{skill.effect}</small>
                        <em>{skill.cost} Oil</em>
                      </button>
                    );
                  })}
                </div>
              ))}
            </article>
          );
        })}
      </section>
    </main>
  );
}
