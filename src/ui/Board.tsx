import { BOARD_SIZE } from "../game/constants";
import type { ViewMode } from "../game/types";
import Square from "./Square";
import styles from "./Board.module.css";

type BoardProps = {
  tutorialSquares?: string[];
  tutorialPrimarySquare?: string;
  viewMode?: ViewMode;
  interactive?: boolean;
};

export default function Board({ tutorialSquares = [], tutorialPrimarySquare, viewMode, interactive = true }: BoardProps) {
  const squares = [];
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) squares.push({ x, y });
  }
  return (
    <div className={`${styles.board} ${interactive ? "" : styles.preview}`} role="grid" aria-label="7 by 7 city board">
      {squares.map((pos) => (
        <Square
          key={`${pos.x}-${pos.y}`}
          pos={pos}
          tutorialSquares={tutorialSquares}
          tutorialPrimarySquare={tutorialPrimarySquare}
          viewMode={viewMode}
          interactive={interactive}
        />
      ))}
    </div>
  );
}
