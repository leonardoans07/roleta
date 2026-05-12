'use client'

import { useState, useMemo } from 'react'

export default function Home() {
  const [number, setNumber] = useState('')
  const [history, setHistory] = useState([])
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)
  const [prediction, setPrediction] = useState('WAIT')

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
    return '#1f1f1f'
  }

  function addNumber() {
    const num = Number(number)

    if (isNaN(num) || num < 0 || num > 36) return

    // VALIDAR WIN/LOSS APENAS SE JÁ EXISTE PREVISÃO
    if (
      prediction !== 'WAIT' &&
      history.length >= 6
    ) {
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

    const hotNumbers = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // IA ANALISANDO PADRÕES
    let aiPrediction = 'WAIT'

    if (history.length >= 6) {
      const strongest = Object.entries(dozens).sort(
        (a, b) => b[1] - a[1]
      )[0]

      // SÓ ENTRA SE TIVER FORÇA
      if (strongest[1] >= 4) {
        aiPrediction = strongest[0]
      }
    }

    setTimeout(() => {
      setPrediction(aiPrediction)
    }, 0)

    return {
      reds,
      blacks,
      evens,
      odds,
      hotNumbers,
      dozens,
      aiPrediction
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
          marginBottom: 20
        }}
      >
        ⚡ Lightning Roulette AI
      </h1>

      {/* INPUT */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          flexWrap: 'wrap'
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
            fontWeight: 'bold',
            background: '#00ff99',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          ADD
        </button>

        <button
          onClick={() => {
            setHistory([])
            setWins(0)
            setLosses(0)
            setPrediction('WAIT')
          }}
          style={{
            padding: '15px 25px',
            fontWeight: 'bold',
            background: 'red',
            color: 'white',
            border: 'none',
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
          padding: 25,
          borderRadius: 12,
          marginBottom: 20
        }}
      >
        <h2>🤖 AI PREDICTION</h2>

        <h1
          style={{
            color:
              prediction === 'WAIT'
                ? '#999'
                : '#00ff99',
            fontSize: 60,
            marginTop: 10
          }}
        >
          {prediction}
        </h1>

        <p>
          AI analyzing dozens repetition and momentum
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
            borderRadius: 12
          }}
        >
          <h2>🔥 HOT NUMBERS</h2>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 15
            }}
          >
            {stats.hotNumbers.map(([n, freq]) => (
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
                {n} ({freq}x)
              </div>
            ))}
          </div>
        </div>

        {/* SCORE */}
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

        {/* DOZENS */}
        <div
          style={{
            background: '#111',
            padding: 20,
            borderRadius: 12
          }}
        >
          <h2>🎯 DOZENS</h2>

          <p>1ST 12: {stats.dozens['1ST 12']}</p>
          <p>2ND 12: {stats.dozens['2ND 12']}</p>
          <p>3RD 12: {stats.dozens['3RD 12']}</p>
          <p>ZERO: {stats.dozens['ZERO']}</p>
        </div>

        {/* COLORS */}
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

      {/* LAST 30 */}
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
                background: getColor(n),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
