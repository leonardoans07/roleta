'use client'

import { useState, useMemo } from 'react'

export default function Home() {
  const [number, setNumber] = useState('')
  const [history, setHistory] = useState([])

  const [prediction, setPrediction] = useState('WAIT')
  const [confidence, setConfidence] = useState(0)

  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)

  const redNumbers = [
    1,3,5,7,9,12,14,16,18,
    19,21,23,25,27,30,32,34,36
  ]

  const blackNumbers = [
    2,4,6,8,10,11,13,15,
    17,20,22,24,26,28,29,31,33,35
  ]

  function getDozen(num) {
    if (num >= 1 && num <= 12) return '1ST 12'
    if (num >= 13 && num <= 24) return '2ND 12'
    if (num >= 25 && num <= 36) return '3RD 12'
    return 'ZERO'
  }

  function getColor(num) {
    if (num === 0) return '#00ff99'
    if (redNumbers.includes(num)) return '#ff2d55'
    return '#1a1a1a'
  }

  function addNumber() {
    const num = Number(number)

    if (isNaN(num) || num < 0 || num > 36) return

    // VALIDAR WIN/LOSS
    if (prediction !== 'WAIT') {
      const result = getDozen(num)

      if (result === prediction) {
        setWins(prev => prev + 1)
      } else {
        setLosses(prev => prev + 1)
      }
    }

    const updated = [num, ...history].slice(0, 100)

    setHistory(updated)
    setNumber('')
  }

  const stats = useMemo(() => {
    const last30 = history.slice(0, 30)
    const last8 = history.slice(0, 8)

    let reds = 0
    let blacks = 0
    let evens = 0
    let odds = 0

    const dozens = {
      '1ST 12': 0,
      '2ND 12': 0,
      '3RD 12': 0,
      ZERO: 0
    }

    const frequency = {}

    last30.forEach(n => {
      if (redNumbers.includes(n)) reds++
      if (blackNumbers.includes(n)) blacks++

      if (n !== 0 && n % 2 === 0) evens++
      if (n % 2 !== 0) odds++

      const dozen = getDozen(n)
      dozens[dozen]++

      frequency[n] = (frequency[n] || 0) + 1
    })

    // HOT NUMBERS
    const hotNumbers = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // IA MELHORADA
    let aiPrediction = 'WAIT'
    let aiConfidence = 0

    if (last8.length >= 8) {
      const recentDozens = {
        '1ST 12': 0,
        '2ND 12': 0,
        '3RD 12': 0
      }

      last8.forEach(n => {
        const d = getDozen(n)

        if (d !== 'ZERO') {
          recentDozens[d]++
        }
      })

      const sorted = Object.entries(recentDozens)
        .sort((a, b) => b[1] - a[1])

      const strongest = sorted[0]
      const second = sorted[1]

      const strongestName = strongest[0]
      const strongestCount = strongest[1]
      const secondCount = second[1]

      // DOMINÂNCIA
      const dominance =
        strongestCount / 8

      // SEQUÊNCIA
      const last3 = last8
        .slice(0, 3)
        .map(n => getDozen(n))

      const streak =
        last3.every(v => v === strongestName)

      // IA DECISÃO
      if (
        strongestCount >= 5 &&
        dominance >= 0.60
      ) {
        aiPrediction = strongestName
        aiConfidence = Math.floor(
          dominance * 100
        )
      }

      // BOOST POR STREAK
      if (streak) {
        aiPrediction = strongestName
        aiConfidence += 15
      }

      // EVITAR ENTRADA FRACA
      if (
        strongestCount - secondCount <= 1
      ) {
        aiPrediction = 'WAIT'
        aiConfidence = 0
      }
    }

    setTimeout(() => {
      setPrediction(aiPrediction)
      setConfidence(aiConfidence)
    }, 0)

    return {
      reds,
      blacks,
      evens,
      odds,
      dozens,
      hotNumbers
    }
  }, [history])

  const accuracy =
    wins + losses === 0
      ? 0
      : (
          (wins / (wins + losses)) *
          100
        ).toFixed(1)

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
          fontSize: 50,
          marginBottom: 20
        }}
      >
        ⚡ Lightning Roulette AI PRO
      </h1>

      {/* INPUT */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 20
        }}
      >
        <input
          value={number}
          onChange={(e) =>
            setNumber(e.target.value)
          }
          placeholder="Enter roulette number"
          style={{
            padding: 15,
            width: 250,
            fontSize: 18,
            color: 'black'
          }}
        />

        <button
          onClick={addNumber}
          style={{
            background: '#00ff99',
            border: 'none',
            padding: '15px 25px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ADD
        </button>

        <button
          onClick={() => {
            setHistory([])
            setPrediction('WAIT')
            setWins(0)
            setLosses(0)
            setConfidence(0)
          }}
          style={{
            background: 'red',
            color: 'white',
            border: 'none',
            padding: '15px 25px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          RESET
        </button>
      </div>

      {/* AI */}
      <div
        style={{
          background: '#111',
          padding: 30,
          borderRadius: 14,
          marginBottom: 20
        }}
      >
        <h2>🤖 AI PREDICTION</h2>

        <h1
          style={{
            fontSize: 70,
            color:
              prediction === 'WAIT'
                ? '#888'
                : '#00ff99',
            marginBottom: 10
          }}
        >
          {prediction}
        </h1>

        <h2
          style={{
            color: '#ffaa00'
          }}
        >
          CONFIDENCE: {confidence}%
        </h2>

        <p
          style={{
            marginTop: 10,
            color: '#aaa'
          }}
        >
          AI analyzing dominance, streaks and momentum
        </p>
      </div>

      {/* GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(300px,1fr))',
          gap: 20
        }}
      >
        {/* HOT */}
        <div
          style={{
            background: '#111',
            padding: 20,
            borderRadius: 14
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
            {stats.hotNumbers.map(([n, f]) => (
              <div
                key={n}
                style={{
                  background: '#00ff99',
                  color: 'black',
                  padding: 12,
                  borderRadius: 10,
                  fontWeight: 'bold'
                }}
              >
                {n} ({f}x)
              </div>
            ))}
          </div>
        </div>

        {/* SCORE */}
        <div
          style={{
            background: '#111',
            padding: 20,
            borderRadius: 14
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

        {/* DOZENS */}
        <div
          style={{
            background: '#111',
            padding: 20,
            borderRadius: 14
          }}
        >
          <h2>🎯 DOZENS</h2>

          <p>
            1ST 12: {stats.dozens['1ST 12']}
          </p>

          <p>
            2ND 12: {stats.dozens['2ND 12']}
          </p>

          <p>
            3RD 12: {stats.dozens['3RD 12']}
          </p>

          <p>
            ZERO: {stats.dozens['ZERO']}
          </p>
        </div>

        {/* COLORS */}
        <div
          style={{
            background: '#111',
            padding: 20,
            borderRadius: 14
          }}
        >
          <h2>🎨 COLORS</h2>

          <p>🔴 RED: {stats.reds}</p>
          <p>⚫ BLACK: {stats.blacks}</p>
          <p>⚪ EVEN: {stats.evens}</p>
          <p>⚫ ODD: {stats.odds}</p>
        </div>
      </div>

      {/* HISTORY */}
      <div
        style={{
          background: '#111',
          padding: 20,
          borderRadius: 14,
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
          {history
            .slice(0, 30)
            .map((n, i) => (
              <div
                key={i}
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 10,
                  background: getColor(n),
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
