"use client";

import { useMemo, useState } from "react";

type Game = {
  id: string;
  title: string;
  description: string;
  objective: string;
  game_type: "quiz" | "challenge" | "memory";
  content: any;
};

type Props = {
  game: Game;
  onClose: () => void;
};

export default function PlayGameModal({ game, onClose }: Props) {
  if (!game) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>✕</button>

        <div className="play-area">
          <span className="tag">{game.game_type}</span>
          <h3>{game.title}</h3>
          <p className="play-meta">{game.description}</p>
          <p><strong>Objective:</strong> {game.objective}</p>

          {game.game_type === "quiz" && <QuizGame game={game} />}
          {game.game_type === "challenge" && <ChallengeGame game={game} />}
          {game.game_type === "memory" && <MemoryGame game={game} />}
        </div>
      </div>
    </div>
  );
}

function QuizGame({ game }: { game: Game }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState("");

  const question = game.content?.question || "Answer the question.";
  const answer = (game.content?.answer || "").toLowerCase();
  const choices = game.content?.choices || [];

  return (
    <div className="quiz-box">
      <h4>{question}</h4>

      <div className="quiz-options">
        {choices.map((choice: string) => (
          <button
            key={choice}
            className="quiz-option"
            onClick={() => {
              setSelected(choice);
              const normalized = choice.toLowerCase();
              setResult(
                normalized === answer
                  ? "Correct! You solved it."
                  : `Not quite. The right answer is: ${game.content.answer}`
              );
            }}
          >
            {choice}
          </button>
        ))}
      </div>

      {selected && <div className="result-text">{result}</div>}
    </div>
  );
}

function ChallengeGame({ game }: { game: Game }) {
  const [points, setPoints] = useState(0);
  const [status, setStatus] = useState("Press start.");
  const [started, setStarted] = useState(false);
  const [activeLabel, setActiveLabel] = useState("Start challenge");

  const steps = game.content?.steps || ["Complete the challenge"];
  const target = game.content?.target || 3;

  const beginChallenge = () => {
    setStarted(true);
    setStatus("Pay attention...");
    setActiveLabel("Tap when ready");

    const delay = 1200 + Math.random() * 1800;
    setTimeout(() => {
      setStatus("Now!");
      setActiveLabel("Tap!");
    }, delay);
  };

  const handleTap = () => {
    if (!started) {
      beginChallenge();
      return;
    }

    const nextPoints = points + 1;
    setPoints(nextPoints);

    if (nextPoints >= target) {
      setStatus("Challenge cleared!");
      setActiveLabel("Completed");
      setStarted(false);
      return;
    }

    setStatus("Nice! Keep going.");
    setStarted(false);
    setActiveLabel("Start challenge");
  };

  return (
    <div className="challenge-box">
      <div className="challenge-score">{points} / {target}</div>
      <p>{game.objective}</p>

      {steps.map((step: string) => (
        <div key={step}>• {step}</div>
      ))}

      <button className="primary-button" onClick={handleTap}>
        {activeLabel}
      </button>

      <div>{status}</div>
    </div>
  );
}

function MemoryGame({ game }: { game: Game }) {
  const symbols = useMemo(() => {
    const base = game.content?.symbols || ["🌙", "⭐", "🚀", "🎮", "🪐", "👾"];
    return [...base, ...base].sort(() => Math.random() - 0.5);
  }, [game]);

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);

  const handleClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const [firstIndex, secondIndex] = nextFlipped;
      if (symbols[firstIndex] === symbols[secondIndex]) {
        const nextMatched = [...matched, firstIndex, secondIndex];
        setMatched(nextMatched);

        if (nextMatched.length === symbols.length) {
          setCompleted(true);
        }

        setTimeout(() => setFlipped([]), 400);
      } else {
        setTimeout(() => setFlipped([]), 550);
      }
    }
  };

  return (
    <div className="memory-board">
      {symbols.map((symbol, index) => {
        const visible = flipped.includes(index) || matched.includes(index);
        const matchedClass = matched.includes(index) ? "matched" : visible ? "flipped" : "";

        return (
          <button
            key={`${symbol}-${index}`}
            className={`memory-card ${matchedClass}`}
            onClick={() => handleClick(index)}
            disabled={completed}
          >
            {visible ? symbol : ""}
          </button>
        );
      })}

      {completed && <div style={{ gridColumn: "1 / -1" }}>You matched every pair!</div>}
    </div>
  );
}
