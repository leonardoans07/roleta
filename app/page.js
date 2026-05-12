"use client";
import { useState } from "react";

export default function Home() {
  const [number, setNumber] = useState("");
  const [history, setHistory] = useState([]);
  const [prediction, setPrediction] = useState("WAIT");
  const [confidence, setConfidence] = useState(0);
  const [trend, setTrend] = useState("NO TREND");
  const [status, setStatus] = useState("WAITING CONFIRMATION");

  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  const [lastSignal, setLastSignal] = useState(null);
  const [signalActive, setSignalActive] = useState(false);

  const rouletteColors = {
    red: [
      1,3,5,7,9,12,14,16,18,
      19,21,23,25,27,30,32,34,36
    ]
  };

  const voisins = [
    22,18,29,7,28,12,35,3,26,
    0,32,15,19,4,21,2,25
  ];

  function getColor(n) {
    if (n === 0) return "green";
    return rouletteColors.red.includes(n) ? "red" : "black";
  }

  function getDozen(n) {
    if (n >= 1 && n <= 12) return "1ST 12";
    if (n >= 13 && n <= 24) return "2ND 12";
    if (n >= 25 && n <= 36) return "3RD 12";
    return "ZERO";
  }

  function getSector(n) {
    if (voisins.includes(n)) return "VOISINS";
    if (n === 0) return "ZERO";
    if ([1,6,9,14,17,20,31,34].includes(n)) return "ORPHELINS";
    return "TIERS";
  }

  function addNumber() {
    const n = parseInt(number);

    if (isNaN(n) || n < 0 || n > 36) return;

    const updated = [n, ...history].slice(0, 30);

    // =========================
    // CHECK WIN / LOSS
    // =========================

    if (signalActive && lastSignal) {
      let win = false;

      if (lastSignal.type === "DOZEN") {
        win = getDozen(n) === lastSignal.value;
      }

      if (lastSignal.type === "SECTOR") {
        win = getSector(n) === lastSignal.value;
      }

      if (win) {
        setWins(prev => prev + 1);
        setStatus("✅ WIN");
      } else {
        setLosses(prev => prev + 1);
        setStatus("❌ LOSS");
      }

      setSignalActive(false);
    }

    // =========================
    // ANALYSIS
    // =========================

    const last5 = updated.slice(0, 5);

    const dozens = {};
    const sectors = {};
    const colors = {};

    last5.forEach(num => {
      const d = getDozen(num);
      const s = getSector(num);
      const c = getColor(num);

      dozens[d] = (dozens[d] || 0) + 1;
      sectors[s] = (sectors[s] || 0) + 1;
      colors[c] = (colors[c] || 0) + 1;
    });

    let bestDozen = "";
    let bestDozenCount = 0;

    Object.entries(dozens).forEach(([key, val]) => {
      if (val > bestDozenCount) {
        bestDozen = key;
        bestDozenCount = val;
      }
    });

    let bestSector = "";
    let bestSectorCount = 0;

    Object.entries(sectors).forEach(([key, val]) => {
      if (val > bestSectorCount) {
        bestSector = key;
        bestSectorCount = val;
      }
    });

    // =========================
    // SMART AI LOGIC
    // =========================

    let nextPrediction = "WAIT";
    let nextConfidence = 0;
    let nextTrend = "NO TREND";
    let nextStatus = "WAITING CONFIRMATION";

    // VERY STRONG SIGNAL
    if (
      bestDozenCount >= 4 &&
      bestSectorCount >= 3
    ) {
      nextPrediction = `${bestDozen}`;
      nextConfidence = 92;
      nextTrend = "🔥 STRONG TREND";

      setLastSignal({
        type: "DOZEN",
        value: bestDozen
      });

      setSignalActive(true);

      nextStatus = "🎯 ENTRY CONFIRMED";
    }

    // MEDIUM SIGNAL
    else if (
      bestDozenCount >= 3 &&
      bestSectorCount >= 2
    ) {
      nextPrediction = `${bestDozen}`;
      nextConfidence = 75;
      nextTrend = "📈 MEDIUM TREND";

      setLastSignal({
        type: "DOZEN",
        value: bestDozen
      });

      setSignalActive(true);

      nextStatus = "⚡ POSSIBLE ENTRY";
    }

    // SECTOR TREND
    else if (
      bestSectorCount >= 4
    ) {
      nextPrediction = `${bestSector}`;
      nextConfidence = 80;
      nextTrend = "🎡 SECTOR DOMINANCE";

      setLastSignal({
        type: "SECTOR",
        value: bestSector
      });

      setSignalActive(true);

      nextStatus = "🎯 SECTOR ENTRY";
    }

    setPrediction(nextPrediction);
    setConfidence(nextConfidence);
    setTrend(nextTrend);

    if (!signalActive) {
      setStatus(nextStatus);
    }

    setHistory(updated);
    setNumber("");
  }

  const hotNumbers = {};

  history.forEach(n => {
    hotNumbers[n] = (hotNumbers[n] || 0) + 1;
  });

  const topHot = Object.entries(hotNumbers)
    .sort((a,b) => b[1]-a[1])
    .slice(0,5);

  const redCount = history.filter(n => getColor(n)==="red").length;
  const blackCount = history.filter(n => getColor(n)==="black").length;
  const evenCount = history.filter(n => n !==0 && n % 2 ===0).length;
  const oddCount = history.filter(n => n % 2 !==0).length;

  const dozen1 = history.filter(n => n>=1 && n<=12).length;
  const dozen2 = history.filter(n => n>=13 && n<=24).length;
  const dozen3 = history.filter(n => n>=25 && n<=36).length;

  return (
    <main
      style={{
        background:"#000",
        minHeight:"100vh",
        color:"#fff",
        padding:"20px",
        fontFamily:"Arial"
      }}
    >
      <h1 style={{fontSize:"42px"}}>
        ⚡ Lightning Roulette AI PRO
      </h1>

      <div style={{display:"flex",gap:"10px",marginTop:"20px"}}>
        <input
          value={number}
          onChange={(e)=>setNumber(e.target.value)}
          placeholder="Enter roulette number"
          style={{
            padding:"14px",
            width:"220px",
            fontSize:"18px",
            color:"#000"
          }}
        />

        <button
          onClick={addNumber}
          style={{
            background:"#00ff99",
            color:"#000",
            border:"none",
            padding:"14px 20px",
            fontWeight:"bold",
            cursor:"pointer"
          }}
        >
          ADD
        </button>

        <button
          onClick={()=>{
            setHistory([]);
            setPrediction("WAIT");
            setWins(0);
            setLosses(0);
            setStatus("RESET");
            setConfidence(0);
          }}
          style={{
            background:"red",
            color:"#fff",
            border:"none",
            padding:"14px 20px",
            fontWeight:"bold",
            cursor:"pointer"
          }}
        >
          RESET
        </button>
      </div>

      {/* AI BOX */}

      <div
        style={{
          background:"#090909",
          marginTop:"25px",
          padding:"25px",
          borderRadius:"12px"
        }}
      >
        <h2>🤖 AI PREDICTION</h2>

        <h1
          style={{
            color:"#00ff99",
            fontSize:"58px",
            marginTop:"10px"
          }}
        >
          {prediction}
        </h1>

        <h2 style={{marginTop:"15px"}}>
          CONFIDENCE: {confidence}%
        </h2>

        <h3 style={{marginTop:"10px"}}>
          {trend}
        </h3>

        <h2
          style={{
            marginTop:"15px",
            color:"#ffd700"
          }}
        >
          {status}
        </h2>
      </div>

      {/* GRID */}

      <div
        style={{
          display:"grid",
          gridTemplateColumns:"repeat(4,1fr)",
          gap:"15px",
          marginTop:"20px"
        }}
      >

        {/* HOT */}

        <div
          style={{
            background:"#090909",
            padding:"20px",
            borderRadius:"12px"
          }}
        >
          <h2>🔥 HOT NUMBERS</h2>

          <div
            style={{
              display:"flex",
              flexWrap:"wrap",
              gap:"10px",
              marginTop:"15px"
            }}
          >
            {topHot.map(([n,c])=>(
              <div
                key={n}
                style={{
                  background:"#00ff99",
                  color:"#000",
                  padding:"10px",
                  borderRadius:"8px",
                  fontWeight:"bold"
                }}
              >
                {n} ({c}x)
              </div>
            ))}
          </div>
        </div>

        {/* SCORE */}

        <div
          style={{
            background:"#090909",
            padding:"20px",
            borderRadius:"12px"
          }}
        >
          <h2>📊 SCORE</h2>

          <h1 style={{color:"#00ff99"}}>
            WINS: {wins}
          </h1>

          <h1 style={{color:"red"}}>
            LOSSES: {losses}
          </h1>

          <h2>
            ACCURACY: {
              wins + losses > 0
              ? ((wins/(wins+losses))*100).toFixed(1)
              : 0
            }%
          </h2>
        </div>

        {/* DOZENS */}

        <div
          style={{
            background:"#090909",
            padding:"20px",
            borderRadius:"12px"
          }}
        >
          <h2>🎯 DOZENS</h2>

          <h3>1ST 12: {dozen1}</h3>
          <h3>2ND 12: {dozen2}</h3>
          <h3>3RD 12: {dozen3}</h3>
        </div>

        {/* COLORS */}

        <div
          style={{
            background:"#090909",
            padding:"20px",
            borderRadius:"12px"
          }}
        >
          <h2>🎨 COLORS</h2>

          <h3>🔴 RED: {redCount}</h3>
          <h3>⚫ BLACK: {blackCount}</h3>
          <h3>⚪ EVEN: {evenCount}</h3>
          <h3>🟣 ODD: {oddCount}</h3>
        </div>

      </div>

      {/* HISTORY */}

      <div
        style={{
          background:"#090909",
          padding:"20px",
          borderRadius:"12px",
          marginTop:"20px"
        }}
      >
        <h2>🕓 LAST 30 NUMBERS</h2>

        <div
          style={{
            display:"flex",
            flexWrap:"wrap",
            gap:"10px",
            marginTop:"15px"
          }}
        >
          {history.map((n,index)=>(
            <div
              key={index}
              style={{
                width:"45px",
                height:"45px",
                borderRadius:"8px",
                background:
                  getColor(n)==="red"
                  ? "#ff3355"
                  : getColor(n)==="black"
                  ? "#222"
                  : "#00ff99",
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                fontWeight:"bold",
                fontSize:"18px"
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
