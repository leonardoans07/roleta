"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";

export default function Home() {

  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);

  const [prediction, setPrediction] = useState("WAIT");
  const [confidence, setConfidence] = useState(0);
  const [trend, setTrend] = useState("NO TREND");
  const [status, setStatus] = useState("WAITING");

  const [ocrText, setOcrText] = useState("");
  const [loadingOCR, setLoadingOCR] = useState(false);

  const redNumbers = [
    1,3,5,7,9,12,14,16,18,
    19,21,23,25,27,30,32,34,36
  ];

  const voisins = [
    22,18,29,7,28,12,35,3,26,
    0,32,15,19,4,21,2,25
  ];

  function getColor(n) {
    if (n === 0) return "green";
    return redNumbers.includes(n)
      ? "red"
      : "black";
  }

  function getDozen(n) {
    if (n >= 1 && n <= 12) return "1ST 12";
    if (n >= 13 && n <= 24) return "2ND 12";
    if (n >= 25 && n <= 36) return "3RD 12";
    return "ZERO";
  }

  function getSector(n) {
    if (voisins.includes(n)) {
      return "VOISINS";
    }

    if ([1,6,9,14,17,20,31,34].includes(n)) {
      return "ORPHELINS";
    }

    return "TIERS";
  }

  function analyze(updated) {

    if (updated.length < 5) {
      setPrediction("WAIT");
      setConfidence(0);
      return;
    }

    const recent = updated.slice(0, 6);

    const dozens = {};
    const sectors = {};

    recent.forEach(n => {

      const d = getDozen(n);
      const s = getSector(n);

      dozens[d] = (dozens[d] || 0) + 1;
      sectors[s] = (sectors[s] || 0) + 1;

    });

    let bestDozen = "";
    let bestDozenCount = 0;

    Object.entries(dozens).forEach(([k,v]) => {
      if (v > bestDozenCount) {
        bestDozen = k;
        bestDozenCount = v;
      }
    });

    let bestSector = "";
    let bestSectorCount = 0;

    Object.entries(sectors).forEach(([k,v]) => {
      if (v > bestSectorCount) {
        bestSector = k;
        bestSectorCount = v;
      }
    });

    // STRONG SIGNAL
    if (
      bestDozenCount >= 4 &&
      bestSectorCount >= 3
    ) {

      setPrediction(bestDozen);
      setConfidence(91);
      setTrend("🔥 STRONG TREND");
      setStatus("🎯 ENTRY CONFIRMED");

      return;
    }

    // MEDIUM SIGNAL
    if (
      bestDozenCount >= 3
    ) {

      setPrediction(bestDozen);
      setConfidence(75);
      setTrend("📈 MEDIUM TREND");
      setStatus("⚡ POSSIBLE ENTRY");

      return;
    }

    // SECTOR
    if (
      bestSectorCount >= 4
    ) {

      setPrediction(bestSector);
      setConfidence(82);
      setTrend("🎡 SECTOR DOMINANCE");
      setStatus("🔥 SECTOR ENTRY");

      return;
    }

    setPrediction("WAIT");
    setConfidence(0);
    setTrend("NO TREND");
    setStatus("WAITING");
  }

  function addNumber(n) {

    if (isNaN(n) || n < 0 || n > 36) return;

    const updated = [n, ...history]
      .slice(0, 30);

    setHistory(updated);

    analyze(updated);

    setInput("");
  }

  async function handleOCR(file) {

    setLoadingOCR(true);

    const result =
      await Tesseract.recognize(
        file,
        "eng"
      );

    const text =
      result.data.text;

    setOcrText(text);

    // PEGAR NUMEROS
    const found =
      text.match(/\d+/g);

    if (found) {

      const cleaned =
        found
          .map(n => parseInt(n))
          .filter(
            n => n >= 0 && n <= 36
          );

      if (cleaned.length > 0) {

        const updated = [
          ...cleaned.reverse(),
          ...history
        ].slice(0, 30);

        setHistory(updated);

        analyze(updated);
      }
    }

    setLoadingOCR(false);
  }

  const hotNumbers = {};

  history.forEach(n => {
    hotNumbers[n] =
      (hotNumbers[n] || 0) + 1;
  });

  const topHot =
    Object.entries(hotNumbers)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,5);

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

      <h1
        style={{
          fontSize:"44px"
        }}
      >
        ⚡ Roulette AI OCR
      </h1>

      {/* INPUTS */}

      <div
        style={{
          display:"flex",
          gap:"10px",
          marginTop:"20px",
          flexWrap:"wrap"
        }}
      >

        <input
          value={input}
          onChange={(e)=>
            setInput(e.target.value)
          }
          placeholder="Enter number"
          style={{
            padding:"14px",
            width:"200px",
            fontSize:"18px",
            color:"#000"
          }}
        />

        <button
          onClick={()=>
            addNumber(parseInt(input))
          }
          style={{
            background:"#00ff99",
            border:"none",
            padding:"14px 22px",
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
            setConfidence(0);
            setTrend("NO TREND");
            setStatus("RESET");
          }}
          style={{
            background:"red",
            color:"#fff",
            border:"none",
            padding:"14px 22px",
            fontWeight:"bold",
            cursor:"pointer"
          }}
        >
          RESET
        </button>

      </div>

      {/* OCR */}

      <div
        style={{
          background:"#090909",
          padding:"20px",
          borderRadius:"12px",
          marginTop:"25px"
        }}
      >

        <h2>📸 OCR Upload</h2>

        <input
          type="file"
          accept="image/*"
          onChange={(e)=>{

            const file =
              e.target.files[0];

            if(file){
              handleOCR(file);
            }

          }}
          style={{
            marginTop:"15px"
          }}
        />

        {loadingOCR && (

          <h3
            style={{
              color:"#00ff99",
              marginTop:"15px"
            }}
          >
            Reading roulette numbers...
          </h3>

        )}

      </div>

      {/* AI */}

      <div
        style={{
          background:"#090909",
          padding:"25px",
          borderRadius:"12px",
          marginTop:"20px"
        }}
      >

        <h2>🤖 AI PREDICTION</h2>

        <h1
          style={{
            color:"#00ff99",
            fontSize:"60px",
            marginTop:"10px"
          }}
        >
          {prediction}
        </h1>

        <h2>
          CONFIDENCE: {confidence}%
        </h2>

        <h3
          style={{
            marginTop:"10px"
          }}
        >
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

      {/* HOT NUMBERS */}

      <div
        style={{
          background:"#090909",
          padding:"20px",
          borderRadius:"12px",
          marginTop:"20px"
        }}
      >

        <h2>🔥 HOT NUMBERS</h2>

        <div
          style={{
            display:"flex",
            gap:"10px",
            flexWrap:"wrap",
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

      {/* HISTORY */}

      <div
        style={{
          background:"#090909",
          padding:"20px",
          borderRadius:"12px",
          marginTop:"20px"
        }}
      >

        <h2>🎲 LAST 30 NUMBERS</h2>

        <div
          style={{
            display:"flex",
            flexWrap:"wrap",
            gap:"10px",
            marginTop:"15px"
          }}
        >

          {history.map((n,i)=>(

            <div
              key={i}
              style={{
                width:"50px",
                height:"50px",
                borderRadius:"8px",
                background:
                  getColor(n)==="red"
                  ? "#ff3355"
                  : getColor(n)==="black"
                  ? "#222"
                  : "green",
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                fontWeight:"bold",
                fontSize:"20px"
              }}
            >
              {n}
            </div>

          ))}

        </div>

      </div>

      {/* OCR RAW */}

      <div
        style={{
          background:"#090909",
          padding:"20px",
          borderRadius:"12px",
          marginTop:"20px"
        }}
      >

        <h2>📝 OCR RAW TEXT</h2>

        <p
          style={{
            color:"#aaa",
            marginTop:"10px",
            whiteSpace:"pre-wrap"
          }}
        >
          {ocrText}
        </p>

      </div>

    </main>
  );
}
