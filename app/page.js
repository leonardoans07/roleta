"use client";

import { useState } from "react";

export default function Home() {

  const [numbers, setNumbers] = useState([]);
  const [input, setInput] = useState("");

  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  const roulette = [
    0,32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26
  ];

  function getNeighbors(number, range = 6) {
    const index = roulette.indexOf(number);

    if (index === -1) return [];

    const neighbors = [];

    for (let i = -range; i <= range; i++) {
      const pos =
        (index + i + roulette.length) %
        roulette.length;

      neighbors.push(roulette[pos]);
    }

    return [...new Set(neighbors)];
  }

  const addNumber = () => {

    if (!input) return;

    const num = parseInt(input);

    if (isNaN(num) || num < 0 || num > 36) return;

    const updated = [num, ...numbers].slice(0, 100);

    setNumbers(updated);

    checkPrediction(num);

    setInput("");
  };

  function getColor(n) {

    if (n === 0) return "green";

    const red = [
      1,3,5,7,9,12,14,16,18,
      19,21,23,25,27,30,32,34,36
    ];

    return red.includes(n)
      ? "red"
      : "#222";
  }

  function getFinal(n) {
    return n % 10;
  }

  function analyzePattern() {

    if (numbers.length < 8) {
      return {
        prediction: "WAIT",
        confidence: 0,
        trend: "COLLECTING DATA",
        neighbors: []
      };
    }

    const recent = numbers.slice(0, 15);

    // ===== REPETIÇÃO DE FINAL =====

    const finals = {};

    recent.forEach(n => {

      const final = getFinal(n);

      finals[final] =
        (finals[final] || 0) + 1;
    });

    const strongFinal = Object.entries(finals)
      .sort((a,b)=>b[1]-a[1])[0];

    if (strongFinal[1] >= 3) {

      return {
        prediction: `FINAL ${strongFinal[0]}`,
        confidence: 89,
        trend: "REPEATED FINALS",
        neighbors: []
      };
    }

    // ===== VIZINHOS DO ZERO =====

    const zeroNeighbors =
      getNeighbors(0);

    const zeroHits =
      recent.filter(n =>
        zeroNeighbors.includes(n)
      ).length;

    if (zeroHits <= 1) {

      return {
        prediction: "NEIGHBORS OF 0",
        confidence: 92,
        trend: "LONG ABSENCE",
        neighbors: zeroNeighbors
      };
    }

    // ===== NÚMEROS REPETIDOS =====

    const repeated = {};

    recent.forEach(n => {
      repeated[n] =
        (repeated[n] || 0) + 1;
    });

    const repeatedStrong =
      Object.entries(repeated)
      .sort((a,b)=>b[1]-a[1])[0];

    if (repeatedStrong[1] >= 2) {

      const repeatedNumber =
        parseInt(repeatedStrong[0]);

      return {
        prediction:
          `NEIGHBORS OF ${repeatedNumber}`,
        confidence: 85,
        trend: "NUMBER PULLING PATTERN",
        neighbors:
          getNeighbors(repeatedNumber)
      };
    }

    // ===== MEMÓRIA DE PUXADA =====

    const last = recent[0];

    const previous = recent.filter(
      n => n === last
    ).length;

    if (previous >= 2) {

      return {
        prediction:
          `NUMBER ${last} REPEATING`,
        confidence: 84,
        trend: "MEMORY TABLE",
        neighbors:
          getNeighbors(last)
      };
    }

    // ===== DÚZIAS =====

    const dozens = {
      first:
        recent.filter(n =>
          n >=1 && n <=12
        ).length,

      second:
        recent.filter(n =>
          n >=13 && n <=24
        ).length,

      third:
        recent.filter(n =>
          n >=25 && n <=36
        ).length
    };

    const strongest =
      Object.entries(dozens)
      .sort((a,b)=>b[1]-a[1])[0];

    if (strongest[1] >= 6) {

      return {
        prediction:
          strongest[0] === "first"
            ? "1ST 12"
            : strongest[0] === "second"
            ? "2ND 12"
            : "3RD 12",

        confidence: 78,

        trend: "DOZEN MOMENTUM",

        neighbors: []
      };
    }

    return {
      prediction: "WAIT",
      confidence: 0,
      trend: "NO CLEAR PATTERN",
      neighbors: []
    };
  }

  function checkPrediction(newNumber) {

    const analysis = analyzePattern();

    if (
      analysis.prediction.includes("12")
    ) {

      const result =
        newNumber >=1 && newNumber <=12
        ? "1ST 12"
        : newNumber >=13 && newNumber <=24
        ? "2ND 12"
        : newNumber >=25 && newNumber <=36
        ? "3RD 12"
        : "ZERO";

      if (result === analysis.prediction) {
        setWins(prev => prev + 1);
      } else {
        setLosses(prev => prev + 1);
      }
    }

    if (
      analysis.prediction.includes("FINAL")
    ) {

      const target =
        parseInt(
          analysis.prediction.replace(
            "FINAL ",
            ""
          )
        );

      if (newNumber % 10 === target) {
        setWins(prev => prev + 1);
      } else {
        setLosses(prev => prev + 1);
      }
    }
  }

  const prediction = analyzePattern();

  function hotNumbers() {

    const count = {};

    numbers.forEach(n => {
      count[n] =
        (count[n] || 0) + 1;
    });

    return Object.entries(count)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,6);
  }

  return (

    <main
      style={{
        background:"#000",
        color:"white",
        minHeight:"100vh",
        padding:20
      }}
    >

      <h1 style={{fontSize:40}}>
        ⚡ Roulette AI PRO
      </h1>

      <div style={{marginTop:20}}>

        <input
          value={input}
          onChange={(e)=>
            setInput(e.target.value)
          }
          placeholder="Enter number"
          style={{
            padding:10,
            color:"black"
          }}
        />

        <button
          onClick={addNumber}
          style={{
            background:"#00ff99",
            border:"none",
            padding:10,
            marginLeft:10,
            fontWeight:"bold"
          }}
        >
          ADD
        </button>

        <button
          onClick={()=>{
            setNumbers([]);
            setWins(0);
            setLosses(0);
          }}
          style={{
            background:"red",
            color:"white",
            border:"none",
            padding:10,
            marginLeft:10,
            fontWeight:"bold"
          }}
        >
          RESET
        </button>

      </div>

      <div
        style={{
          background:"#111",
          marginTop:30,
          padding:20,
          borderRadius:10
        }}
      >

        <h2>🤖 AI PREDICTION</h2>

        <h1
          style={{
            color:"#00ff99",
            fontSize:48
          }}
        >
          {prediction.prediction}
        </h1>

        <h2>
          CONFIDENCE:
          {" "}
          {prediction.confidence}%
        </h2>

        <h3>
          {prediction.trend}
        </h3>

      </div>

      <div
        style={{
          background:"#111",
          marginTop:20,
          padding:20,
          borderRadius:10
        }}
      >

        <h2>🎯 NEIGHBORS</h2>

        <div
          style={{
            display:"flex",
            flexWrap:"wrap",
            gap:10
          }}
        >

          {prediction.neighbors.map((n,i)=>(

            <div
              key={i}
              style={{
                width:45,
                height:45,
                borderRadius:8,
                background:getColor(n),
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                fontWeight:"bold"
              }}
            >
              {n}
            </div>

          ))}

        </div>

      </div>

      <div
        style={{
          background:"#111",
          marginTop:20,
          padding:20,
          borderRadius:10
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

          ACCURACY:
          {" "}

          {
            wins + losses > 0

            ?

            (
              (
                wins /
                (wins + losses)
              ) * 100
            ).toFixed(1)

            :

            0
          }

          %

        </h2>

      </div>

      <div
        style={{
          background:"#111",
          marginTop:20,
          padding:20,
          borderRadius:10
        }}
      >

        <h2>🔥 HOT NUMBERS</h2>

        <div
          style={{
            display:"flex",
            gap:10,
            flexWrap:"wrap"
          }}
        >

          {hotNumbers().map(([n,q])=>(

            <div
              key={n}
              style={{
                background:"#00ff99",
                color:"black",
                padding:10,
                borderRadius:8,
                fontWeight:"bold"
              }}
            >
              {n} ({q}x)
            </div>

          ))}

        </div>

      </div>

      <div
        style={{
          background:"#111",
          marginTop:20,
          padding:20,
          borderRadius:10
        }}
      >

        <h2>🎲 LAST 100 NUMBERS</h2>

        <div
          style={{
            display:"flex",
            flexWrap:"wrap",
            gap:10
          }}
        >

          {numbers.map((n,i)=>(

            <div
              key={i}
              style={{
                width:45,
                height:45,
                borderRadius:8,
                background:getColor(n),
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                fontWeight:"bold"
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
