"use client";

import { useState } from "react";

export default function Home() {
  const [numbers, setNumbers] = useState([]);
  const [input, setInput] = useState("");

  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  const addNumber = () => {
    if (!input) return;

    const num = parseInt(input);

    if (isNaN(num) || num < 0 || num > 36) return;

    const updated = [num, ...numbers].slice(0, 30);

    setNumbers(updated);
    setInput("");

    checkPrediction(num);
  };

  const resetAll = () => {
    setNumbers([]);
    setWins(0);
    setLosses(0);
  };

  const getDozen = (n) => {
    if (n >= 1 && n <= 12) return "1ST 12";
    if (n >= 13 && n <= 24) return "2ND 12";
    if (n >= 25 && n <= 36) return "3RD 12";
    return "ZERO";
  };

  const analyzePattern = () => {
    if (numbers.length < 6) {
      return {
        prediction: "WAIT",
        confidence: 0,
        trend: "WAITING"
      };
    }

    const last = numbers[0];
    const second = numbers[1];
    const third = numbers[2];

    const lastDigit = (n) => n % 10;

    // FINAL IGUAL
    if (
      lastDigit(last) === lastDigit(second) &&
      lastDigit(second) !== lastDigit(third)
    ) {
      return {
        prediction: `FINAL ${lastDigit(last)}`,
        confidence: 88,
        trend: "DOUBLE FINAL DETECTED"
      };
    }

    // DUPLO NÚMERO
    if (last === second && second !== third) {
      return {
        prediction: `BREAK AFTER ${last}`,
        confidence: 91,
        trend: "DOUBLE NUMBER BREAK"
      };
    }

    // FINAL 5
    const final5 = numbers.filter((n) => n % 10 === 5).length;

    if (final5 >= 3) {
      return {
        prediction: "FINAL 5",
        confidence: 82,
        trend: "FINAL 5 TREND"
      };
    }

    // DÚZIAS
    const dozens = {
      first: numbers.filter((n) => n >= 1 && n <= 12).length,
      second: numbers.filter((n) => n >= 13 && n <= 24).length,
      third: numbers.filter((n) => n >= 25 && n <= 36).length
    };

    const maxDozen = Object.entries(dozens).sort(
      (a, b) => b[1] - a[1]
    )[0];

    if (maxDozen[1] >= 4) {
      return {
        prediction:
          maxDozen[0] === "first"
            ? "1ST 12"
            : maxDozen[0] === "second"
            ? "2ND 12"
            : "3RD 12",
        confidence: 75,
        trend: "DOZEN MOMENTUM"
      };
    }

    return {
      prediction: "WAIT",
      confidence: 0,
      trend: "NO TREND"
    };
  };

  const checkPrediction = (newNumber) => {
    const analysis = analyzePattern();

    if (analysis.prediction.includes("12")) {
      const result = getDozen(newNumber);

      if (result === analysis.prediction) {
        setWins((prev) => prev + 1);
      } else {
        setLosses((prev) => prev + 1);
      }
    }
  };

  const prediction = analyzePattern();

  const hotNumbers = () => {
    const count = {};

    numbers.forEach((n) => {
      count[n] = (count[n] || 0) + 1;
    });

    return Object.entries(count)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  return (
    <main
      style={{
        background: "#000",
        minHeight: "100vh",
        color: "white",
        padding: 20
      }}
    >
      <h1 style={{ fontSize: 40 }}>
        ⚡ Roulette AI OCR
      </h1>

      <div style={{ marginTop: 20 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter number"
          style={{
            padding: 10,
            color: "black"
          }}
        />

        <button
          onClick={addNumber}
          style={{
            background: "#00ff99",
            color: "black",
            padding: 10,
            marginLeft: 10,
            border: "none",
            fontWeight: "bold"
          }}
        >
          ADD
        </button>

        <button
          onClick={resetAll}
          style={{
            background: "red",
            color: "white",
            padding: 10,
            marginLeft: 10,
            border: "none",
            fontWeight: "bold"
          }}
        >
          RESET
        </button>
      </div>

      <div
        style={{
          background: "#111",
          marginTop: 30,
          padding: 20,
          borderRadius: 10
        }}
      >
        <h2>🤖 AI PREDICTION</h2>

        <h1
          style={{
            color:
              prediction.prediction === "WAIT"
                ? "#00ff99"
                : "#00ff99",
            fontSize: 50
          }}
        >
          {prediction.prediction}
        </h1>

        <h2>
          CONFIDENCE: {prediction.confidence}%
        </h2>

        <h3>{prediction.trend}</h3>
      </div>

      <div
        style={{
          background: "#111",
          padding: 20,
          marginTop: 20,
          borderRadius: 10
        }}
      >
        <h2>📊 SCORE</h2>

        <h1 style={{ color: "#00ff99" }}>
          WINS: {wins}
        </h1>

        <h1 style={{ color: "red" }}>
          LOSSES: {losses}
        </h1>

        <h2>
          ACCURACY:
          {" "}
          {wins + losses > 0
            ? (
                (wins / (wins + losses)) *
                100
              ).toFixed(1)
            : 0}
          %
        </h2>
      </div>

      <div
        style={{
          background: "#111",
          marginTop: 20,
          padding: 20,
          borderRadius: 10
        }}
      >
        <h2>🔥 HOT NUMBERS</h2>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap"
          }}
        >
          {hotNumbers().map(([num, qty]) => (
            <div
              key={num}
              style={{
                background: "#00ff99",
                color: "black",
                padding: 10,
                borderRadius: 8,
                fontWeight: "bold"
              }}
            >
              {num} ({qty}x)
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: "#111",
          marginTop: 20,
          padding: 20,
          borderRadius: 10
        }}
      >
        <h2>🎲 LAST 30 NUMBERS</h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10
          }}
        >
          {numbers.map((n, i) => (
            <div
              key={i}
              style={{
                background:
                  n === 0
                    ? "green"
                    : [
                        1,3,5,7,9,12,14,16,18,
                        19,21,23,25,27,30,32,34,36
                      ].includes(n)
                    ? "red"
                    : "#222",
                width: 45,
                height: 45,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 8,
                fontWeight: "bold"
              }}
            >
              {n}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
