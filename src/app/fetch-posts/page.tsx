"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function FetchPostsPage() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playerPosition, setPlayerPosition] = useState(2);
  const [bricks, setBricks] = useState<{ id: number; position: number; top: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/external');
        const data = await res.json();
  
        if (data.success) {
          setPosts(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000); // Remove confetti after 5 seconds
      }
    };
  
    fetchData();
  }, []);
  

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === "ArrowLeft" && playerPosition > 0) {
        setPlayerPosition(playerPosition - 1);
      } else if (e.key === "ArrowRight" && playerPosition < 4) {
        setPlayerPosition(playerPosition + 1);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [playerPosition, gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setBricks((prevBricks) => {
        const newBricks = prevBricks
          .map((brick) => ({ ...brick, top: brick.top + 10 }))
          .filter((brick) => brick.top < 300);

        if (Math.random() < 0.2) {
          newBricks.push({ id: Date.now(), position: Math.floor(Math.random() * 5), top: 0 });
        }

        const hitBrick = newBricks.find((brick) => brick.top >= 280 && brick.position === playerPosition);
        if (hitBrick) {
          setScore((prevScore) => prevScore + 1);
          newBricks.splice(newBricks.indexOf(hitBrick), 1);
        }

        if (newBricks.some((brick) => brick.top >= 280 && brick.position === playerPosition)) {
          setGameOver(true);
          clearInterval(interval);
        }

        return newBricks;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [playerPosition, gameOver]);

  const handleRestart = () => {
    setGameOver(false);
    setScore(0);
    setBricks([]);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-3xl font-semibold text-blue-600 mb-4">Loading... Play the game while you wait!</h1>
        <div className="game-container relative w-full h-[400px] flex justify-center items-center bg-gray-300">
          {bricks.map((brick) => (
            <div
              key={brick.id}
              className="falling-brick bg-red-500 w-[50px] h-[50px] absolute"
              style={{ left: `${brick.position * 60}px`, top: `${brick.top}px` }}
            ></div>
          ))}
          <div
            className={`player bg-blue-500 w-[50px] h-[50px] absolute bottom-0`}
            style={{ left: `${playerPosition * 60}px` }}
          ></div>
        </div>
        <p className="text-gray-600 mt-4">Score: {score}</p>
        <p className="text-gray-600 mt-4">Move the player with Left and Right arrows!</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-3xl font-semibold text-red-600">{error}</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 relative">
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="confetti absolute inset-0 pointer-events-none z-10">
          {[...Array(1200)].map((_, i) => (
            <div
              key={i}
              className={`confetti-piece w-[10px] h-[25px] bg-${
                ["red", "blue", "yellow", "green", "pink", "purple"][Math.floor(Math.random() * 6)]
              }-500 rounded-full absolute`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `confetti-popper ${Math.random() * 3 + 3}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                transform: "scale(0)",
              }}
            ></div>
          ))}
          <style jsx>{`
            @keyframes confetti-popper {
              0% {
                transform: scale(1) translateY(0) rotate(0deg);
              }
              100% {
                transform: scale(2) translateY(300px) rotate(720deg);
              }
            }
          `}</style>
        </div>
      )}

      {gameOver && (
        <div className="game-over absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 z-20">
          <div className="text-center text-white">
            <h1 className="text-3xl font-semibold">Game Over</h1>
            <button
              className="mt-4 bg-blue-500 px-6 py-2 rounded text-white"
              onClick={handleRestart}
            >
              Restart Game
            </button>
          </div>
        </div>
      )}
      
      <h1 className="text-3xl font-semibold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 via-purple-400 to-pink-400 transition-all duration-500 ease-in-out transform hover:scale-105">
  API-FETCH POSTS
</h1>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
        {posts.map((post: { id: number; title: string; body: string }) => (
          <li
            key={post.id}
            className="relative group w-full h-[300px] rounded-lg overflow-hidden shadow-lg"
          >
            <Image
              src={`/images/rubics.jpg`}
              alt={post.title}
              layout="fill"
              objectFit="cover"
              className="group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h2 className="text-xl font-bold text-white">{post.title}</h2>
              <p className="text-gray-300 mt-2">{post.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
