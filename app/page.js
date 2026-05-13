"use client";

import { useState, useEffect } from "react";

export default function Home() {

  const [numbers, setNumbers] = useState([]);
  const [input, setInput] = useState("");
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("roulette_data");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setNumbers(data.numbers || []);
        setWins(data.wins || 0);
        setLosses(data.losses || 0);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "roulette_data",
      JSON.stringify({ numbers, wins, losses })
    );
  }, [numbers, wins, losses]);

  const roulette = [
    0,32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26
  ];

  const RED = [
    1,3,5,7,9,12,14,16,18,
    19,21,23,25,27,30,32,34,36
  ];

  const VOISINS   = [22,18,29,7,28,12,35,3,26,0,32,15,19,4,21,2,25];
  const TIERS     = [27,13,36,11,30,8,23,10,5,24,16,33];
  const ORPHELINS = [1,20,14,31,9,17,34,6];

  const DOZEN_RANGE = {
    first:  [1,  12],
    second: [13, 24],
    third:  [25, 36]
  };

  function getNeighbors(number, range = 6) {
    const index = roulette.indexOf(number);
    if (index === -1) return [];
    const neighbors = [];
    for (let i = -range; i <= range; i++) {
      const pos = (index + i + roulette.length) % roulette.length;
      neighbors.push(roulette[pos]);
    }
    return [...new Set(neighbors)];
  }

  function getColor(n) {
    if (n === 0) return "green";
    return RED.includes(n) ? "#cc2233" : "#333";
  }

  const addNumber = () => {
    const num = parseInt(input);
    if (input === "" || isNaN(num) || num < 0 || num > 36) {
      setError("Enter a valid number between 0 and 36");
      return;
    }
    setError("");
    const updated = [num, ...numbers].slice(0, 100);
    checkPrediction(num);
    setNumbers(updated);
    setInput("");
  };

  function analyzePattern() {

    // Require 10 spins minimum for more reliable data
    if (numbers.length < 10) {
      return {
        prediction: "WAIT",
        confidence: 0,
        trend: "COLLECTING DATA",
        signals: 0,
        warning: null,
        neighbors: [],
        alert: `NEED ${10 - numbers.length} MORE SPINS`,
        colorPrediction: null,
        parityPrediction: null,
        sectorAlert: null
      };
    }

    const recent     = numbers.slice(0, 12);
    const veryRecent = numbers.slice(0, 4); // last 4 for acceleration check

    // ===== DÚZIAS — threshold raised to 6/12 (50%) =====

    const dozens = {
      first:  recent.filter(n => n >= 1  && n <= 12).length,
      second: recent.filter(n => n >= 13 && n <= 24).length,
      third:  recent.filter(n => n >= 25 && n <= 36).length
    };

    const strongest =
      Object.entries(dozens).sort((a,b) => b[1]-a[1])[0];

    let prediction = "WAIT";
    let confidence = 0;
    let trend      = "NO TREND";
    let warning    = null;

    if (strongest[1] >= 6) {

      const [lo, hi] = DOZEN_RANGE[strongest[0]];

      // Acceleration: check if last 4 spins reinforce the pattern
      const recentHits =
        veryRecent.filter(n => n >= lo && n <= hi).length;

      if (recentHits >= 2) {
        // Pattern is active AND accelerating — bet signal
        prediction =
          strongest[0] === "first"  ? "1ST 12"
          : strongest[0] === "second" ? "2ND 12"
          : "3RD 12";

        confidence = Math.min(92, Math.round((strongest[1] / 12) * 100 + 30));
        trend = "ACCELERATING";

      } else {
        // Pattern exists in last 12 but NOT confirmed by last 4 — slowing down
        trend   = "MOMENTUM SLOWING";
        warning = "PATTERN WEAKENING — AVOID BET";
      }

    }

    // ===== FINAIS QUENTES =====

    const finals = {};
    recent.forEach(n => {
      const f = n % 10;
      finals[f] = (finals[f] || 0) + 1;
    });
    const hotFinal =
      Object.entries(finals).sort((a,b) => b[1]-a[1])[0];

    let alert = "NO ALERT";
    if (hotFinal[1] >= 3) alert = `FINAL ${hotFinal[0]} HOT`;

    // ===== SETOR DA RODA =====

    const voisinsHits   = recent.filter(n => VOISINS.includes(n)).length;
    const tiersHits     = recent.filter(n => TIERS.includes(n)).length;
    const orphelinsHits = recent.filter(n => ORPHELINS.includes(n)).length;

    const voisinsExp = (VOISINS.length / 37) * 12;
    const tiersExp   = (TIERS.length / 37) * 12;
    const orphExp    = (ORPHELINS.length / 37) * 12;

    let sectorAlert = null;
    if (voisinsHits > voisinsExp * 1.5)
      sectorAlert = "VOISINS DU ZERO ACTIVE";
    else if (tiersHits > tiersExp * 1.5)
      sectorAlert = "TIERS DU CYLINDRE ACTIVE";
    else if (orphelinsHits > orphExp * 1.5)
      sectorAlert = "ORPHELINS ACTIVE";

    // ===== COR — threshold raised to 70% =====

    const nonZero = recent.filter(n => n !== 0);
    let colorPrediction = null;

    if (nonZero.length >= 8) {
      const redCount = nonZero.filter(n => RED.includes(n)).length;
      const ratio    = redCount / nonZero.length;

      if (ratio >= 0.70)
        colorPrediction = { bet: "RED",   pct: Math.round(ratio * 100) };
      else if (ratio <= 0.30)
        colorPrediction = { bet: "BLACK", pct: Math.round((1 - ratio) * 100) };
    }

    // ===== PAR / ÍMPAR — threshold raised to 70% =====

    let parityPrediction = null;

    if (nonZero.length >= 8) {
      const oddCount = nonZero.filter(n => n % 2 !== 0).length;
      const oddRatio = oddCount / nonZero.length;

      if (oddRatio >= 0.70)
        parityPrediction = { bet: "ODD",  pct: Math.round(oddRatio * 100) };
      else if (oddRatio <= 0.30)
        parityPrediction = { bet: "EVEN", pct: Math.round((1 - oddRatio) * 100) };
    }

    // ===== MULTI-SIGNAL COUNT =====
    // Count how many independent signals are aligned

    let signals = 0;
    if (prediction !== "WAIT") signals++;
    if (colorPrediction)       signals++;
    if (parityPrediction)      signals++;
    if (sectorAlert)           signals++;

    return {
      prediction,
      confidence,
      trend,
      signals,
      warning,
      neighbors: prediction !== "WAIT" ? [] : getNeighbors(0),
      alert,
      colorPrediction,
      parityPrediction,
      sectorAlert
    };
  }

  function checkPrediction(newNumber) {
    const analysis = analyzePattern();
    if (analysis.prediction.includes("12")) {
      const result =
        newNumber >= 1  && newNumber <= 12 ? "1ST 12"
        : newNumber >= 13 && newNumber <= 24 ? "2ND 12"
        : newNumber >= 25 && newNumber <= 36 ? "3RD 12"
        : "ZERO";
      if (result === analysis.prediction) setWins(prev => prev + 1);
      else setLosses(prev => prev + 1);
    }
  }

  const prediction = analyzePattern();

  function hotNumbers() {
    const count = {};
    numbers.forEach(n => { count[n] = (count[n] || 0) + 1; });
    return Object.entries(count).sort((a,b) => b[1]-a[1]).slice(0, 6);
  }

  // Signal strength color
  const signalColor =
    prediction.signals >= 3 ? "#00ff99"
    : prediction.signals === 2 ? "#ffb547"
    : "#888";

  return (
    <main style={{ background:"#000", color:"white", minHeight:"100vh", padding:20 }}>

      <h1 style={{ fontSize:40 }}>⚡ Roulette AI PRO</h1>

      {/* Input */}
      <div style={{ marginTop:20 }}>
        <input
          value={input}
          onChange={e => { setInput(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && addNumber()}
          placeholder="Number (0–36) + Enter"
          style={{ padding:10, color:"black", fontSize:16 }}
        />
        <button
          onClick={addNumber}
          style={{ background:"#00ff99", border:"none", padding:10, marginLeft:10, fontWeight:"bold" }}
        >
          ADD
        </button>
        <button
          onClick={() => { setNumbers([]); setWins(0); setLosses(0); }}
          style={{ background:"red", color:"white", border:"none", padding:10, marginLeft:10, fontWeight:"bold" }}
        >
          RESET
        </button>
        {error && <p style={{ color:"#ff6666", marginTop:8 }}>⚠ {error}</p>}
      </div>

      {/* AI Prediction */}
      <div style={{ background:"#111", marginTop:30, padding:20, borderRadius:10 }}>

        <h2>🤖 AI PREDICTION</h2>

        <h1 style={{ color: prediction.prediction === "WAIT" ? "#888" : "#00ff99", fontSize:48 }}>
          {prediction.prediction}
        </h1>

        {prediction.confidence > 0 && (
          <h2>CONFIDENCE: {prediction.confidence}%</h2>
        )}

        <h3 style={{ color:
          prediction.trend === "ACCELERATING"      ? "#00ff99"
          : prediction.trend === "MOMENTUM SLOWING" ? "#ffb547"
          : "#888"
        }}>
          {prediction.trend}
        </h3>

        {/* Warning — avoid bet */}
        {prediction.warning && (
          <div style={{
            background:"#331a00",
            border:"2px solid #ffb547",
            borderRadius:8,
            padding:"10px 16px",
            marginTop:10
          }}>
            <strong style={{ color:"#ffb547" }}>⚠ {prediction.warning}</strong>
          </div>
        )}

        {/* Multi-signal indicator */}
        {prediction.signals > 0 && (
          <h3 style={{ color: signalColor, marginTop:12 }}>
            📡 {prediction.signals} SIGNAL{prediction.signals > 1 ? "S" : ""} ALIGNED
            {prediction.signals >= 3 ? " — HIGH CONFIDENCE" : prediction.signals === 2 ? " — MODERATE" : ""}
          </h3>
        )}

        {alert !== "NO ALERT" && (
          <h3 style={{ color:"yellow" }}>{prediction.alert}</h3>
        )}

        {prediction.sectorAlert && (
          <h3 style={{ color:"#00d4ff" }}>🎡 {prediction.sectorAlert}</h3>
        )}

      </div>

      {/* Color & Parity */}
      {(prediction.colorPrediction || prediction.parityPrediction) && (
        <div style={{ background:"#111", marginTop:20, padding:20, borderRadius:10 }}>

          <h2>🎨 COLOR & PARITY</h2>

          <div style={{ display:"flex", gap:15, flexWrap:"wrap", marginTop:10 }}>

            {prediction.colorPrediction && (
              <div style={{
                background: prediction.colorPrediction.bet === "RED" ? "#cc2233" : "#333",
                padding:"14px 24px",
                borderRadius:10,
                fontWeight:"bold",
                fontSize:20,
                border:"2px solid #444"
              }}>
                {prediction.colorPrediction.bet} — {prediction.colorPrediction.pct}%
              </div>
            )}

            {prediction.parityPrediction && (
              <div style={{
                background:"#1a3a7a",
                padding:"14px 24px",
                borderRadius:10,
                fontWeight:"bold",
                fontSize:20,
                border:"2px solid #2255cc"
              }}>
                {prediction.parityPrediction.bet} — {prediction.parityPrediction.pct}%
              </div>
            )}

          </div>

        </div>
      )}

      {/* Neighbors */}
      {prediction.neighbors.length > 0 && (
        <div style={{ background:"#111", marginTop:20, padding:20, borderRadius:10 }}>

          <h2>🎯 NEIGHBORS OF 0</h2>

          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {prediction.neighbors.map((n,i) => (
              <div key={i} style={{
                width:45, height:45, borderRadius:8,
                background:getColor(n),
                display:"flex", justifyContent:"center", alignItems:"center",
                fontWeight:"bold"
              }}>
                {n}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Score */}
      <div style={{ background:"#111", marginTop:20, padding:20, borderRadius:10 }}>

        <h2>📊 SCORE</h2>
        <h1 style={{ color:"#00ff99" }}>WINS: {wins}</h1>
        <h1 style={{ color:"red" }}>LOSSES: {losses}</h1>
        <h2>
          ACCURACY:{" "}
          {wins + losses > 0
            ? ((wins / (wins + losses)) * 100).toFixed(1)
            : 0}%
        </h2>

      </div>

      {/* Hot Numbers */}
      <div style={{ background:"#111", marginTop:20, padding:20, borderRadius:10 }}>

        <h2>🔥 HOT NUMBERS</h2>

        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {hotNumbers().map(([n,q]) => (
            <div key={n} style={{
              background:getColor(Number(n)),
              color:"white",
              padding:10,
              borderRadius:8,
              fontWeight:"bold"
            }}>
              {n} ({q}x)
            </div>
          ))}
        </div>

      </div>

      {/* Last 100 */}
      <div style={{ background:"#111", marginTop:20, padding:20, borderRadius:10 }}>

        <h2>🎲 LAST 100 NUMBERS</h2>

        <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
          {numbers.map((n,i) => (
            <div key={i} style={{
              width:45, height:45, borderRadius:8,
              background:getColor(n),
              display:"flex", justifyContent:"center", alignItems:"center",
              fontWeight:"bold"
            }}>
              {n}
            </div>
          ))}
        </div>

      </div>

    </main>
  );
}
