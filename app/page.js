'use client'

import { useState, useMemo } from 'react'

export default function Home() {
  const [number, setNumber] = useState('')
  const [history, setHistory] = useState([])
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)
  const [lastPrediction, setLastPrediction] = useState(null)

  // Ordem real da roleta europeia
  const wheel = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34,
    6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
    24, 16, 33, 1, 20, 14, 31, 9, 22, 18,
    29, 7, 28, 12, 35, 3, 26
  ]

  const voisins = [
    22,18,29,7,28,12,35,3,26,0,32,15,19,4,21,2,25
  ]

  const tiers = [
    27,13,36,11,30,8,23,10,5,24,16,33
  ]

  const orphelins = [
    1,20,14,31,9,17,34,6
  ]

  const redNumbers = [
    1,3,5,7,9,12,14,16,18,19,
    21,23,25,27,30,32,34,36
  ]

  const blackNumbers = [
    2,4,6,8,10,11,13,15,17,20,
    22,24,26,28,29,31,33,35
  ]

  function getSector(num) {
    if (voisins.includes(num)) return 'VOISINS'
    if (tiers.includes(num)) return 'TIERS'
    if (orphelins.includes(num)) return 'ORPHELINS'
    return 'ZERO'
  }

  function addNumber() {
    const num = Number(number)

    if (isNaN(num) || num < 0 || num > 36) return

    const updated = [num, ...history].slice(0, 100)

    // verificar win/loss da previsão anterior
    if (lastPrediction) {
      const sector = getSector(num)

      if (sector === lastPrediction) {
        setWins(prev => prev + 1)
      } else {
        setLosses(prev => prev + 1)
      }
    }

    setHistory(updated)
    setNumber('')
  }

  const stats = useMemo(() => {
    const last30 = history.slice(0, 30)

    let reds = 0
    let blacks = 0
    let evens = 0
    let odds = 0

    const sectorCount = {
      VOISINS: 0,
      TIERS: 0,
      ORPHELINS: 0,
      ZERO: 0
    }

    const frequency = {}

    last30.forEach(n => {
      if (redNumbers.includes(n)) reds++
      if (blackNumbers.includes(n)) blacks++

      if (n !== 0 && n % 2 === 0) evens++
      if (n % 2 !== 0) odds++

      const sector = getSector(n)
      sectorCount[sector]++

      frequency[n] = (frequency[n] || 0) + 1
    })

    const hotNumbers = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // previsão IA simples
    let prediction = 'WAIT'

    const strongestSector = Object.entries(sectorCount).sort(
      (a, b) => b[1] - a[1]
    )[0]

    if (strongestSector[1] >= 6) {
      prediction = strongestSector[0]
    }

    setTimeout(() => {
      setLastPrediction(prediction)
    }, 0)

    return {
      reds,
      blacks,
      evens,
      odds,
      hotNumbers,
      prediction,
      sectorCount
    }
  }, [history])

  const accuracy =
    wins + losses === 0
      ? 0
      : ((wins / (wins + losses)) * 100).toFixed(1)

  return (
    <main
      style={{
        background: '#050505',
        minHeight: '100vh',
        color: 'white',
        padding: 20,
        fontFamily: 'Arial'
      }}
    >
      <h1
        style={{
          fontSize: 48,
          fontWeight: 'bold',
          marginBottom: 20
        }}
      >
        ⚡ Lightning Roulette AI
      </h1>

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20
        }}
      >
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Enter roulette number"
          style={{
            padding: 15,
            fontSize: 20,
            width: 250,
            color: 'black'
          }}
        />

        <button
          onClick={addNumber}
          style={{
            padding: '15px 25px',
            fontSize: 18,
            cursor: 'pointer',
            background: '#00ff99',
            border: 'none',
            fontWeight: 'bold'
          }}
        >
          ADD
        </button>

        <button
          onClick={() => {
            setHistory([])
            setWins(0)
            setLosses(0)
          }}
          style={{
            padding: '15px 25px',
            fontSize: 18,
            cursor: 'pointer',
            background: 'red',
            color: 'white',
            border: 'none',
            fontWeight: 'bold'
          }}
        >
          RESET
        </button>
      </div>

      <div
        style={{
          background: '#111',
          padding: 20,
          borderRadius: 12,
          marginBottom: 20
        }}
      >
        <h2 style={{ fontSize: 32 }}>
          🤖 AI Prediction:
        </h2>

        <h1
          style={{
            color: '#00ff99',
            fontSize: 50,
            marginTop: 10
          }}
        >
          {stats.prediction}
        </h1>

        <p style={{ marginTop: 10 }}>
          Based on sector repetition analysis
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2,1fr)',
          gap: 20
        }}
      >
        <div
          style={{
            background: '#111',
            padding: 20,
            borderRadius: 12
          }}
        >
          <h2>🔥 HOT NUMBERS</h2>

          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              marginTop: 15
            }}
          >
            {stats.hotNumbers.map(([n, freq]) => (
              <div
                key={n}
                style={{
                  background: '#00ff99',
                  color: 'black',
                  padding: 15,
                  borderRadius: 10,
                  fontWeight: 'bold'
                }}
              >
                {n} ({freq}x)
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: '#111',
            padding: 20,
            borderRadius: 12
          }}
        >
          <h2>📊 SCORE</h2>

          <h1 style={{ color: '#00ff99' }}>
            WINS: {wins}
          </h1>

          <h1 style={{ color: 'red' }}>
            LOSSES: {losses}
          </h1>

          <h2>
            ACCURACY: {accuracy}%
          </h2>
        </div>

        <div
          style={{
            background: '#111',
            padding: 20,
            borderRadius: 12
          }}
        >
          <h2>🎯 SECTORS</h2>

          <p>VOISINS: {stats.sectorCount.VOISINS}</p>
          <p>TIERS: {stats.sectorCount.TIERS}</p>
          <p>ORPHELINS: {stats.sectorCount.ORPHELINS}</p>
          <p>ZERO: {stats.sectorCount.ZERO}</p>
        </div>

        <div
          style={{
            background: '#111',
            padding: 20,
            borderRadius: 12
          }}
        >
          <h2>🎨 COLORS</h2>

          <p>🔴 RED: {stats.reds}</p>
          <p>⚫ BLACK: {stats.blacks}</p>
          <p>⚪ EVEN: {stats.evens}</p>
          <p>⚫ ODD: {stats.odds}</p>
        </div>
      </div>

      <div
        style={{
          background: '#111',
          padding: 20,
          borderRadius: 12,
          marginTop: 20
        }}
      >
        <h2>🕒 LAST 30 NUMBERS</h2>

        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            marginTop: 15
          }}
        >
          {history.slice(0, 30).map((n, i) => (
            <div
              key={i}
              style={{
                width: 55,
                height: 55,
                borderRadius: 10,
                background:
                  n === 0
                    ? 'green'
                    : redNumbers.includes(n)
                    ? '#ff2d55'
                    : '#222',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 'bold',
                fontSize: 22
              }}
            >
              {n}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
