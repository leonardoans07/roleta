'use client'

import { useState } from 'react'

export default function Home() {
  const [input, setInput] = useState('')
  const [numbers, setNumbers] = useState([])
  const [prediction, setPrediction] = useState('WAIT')
  const [confidence, setConfidence] = useState(0)
  const [signalType, setSignalType] = useState('Waiting for pattern...')
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)
  const [lastPrediction, setLastPrediction] = useState(null)

  const europeanWheel = [
    0, 32, 15, 19, 4, 21, 2, 25,
    17, 34, 6, 27, 13, 36, 11, 30,
    8, 23, 10, 5, 24, 16, 33, 1,
    20, 14, 31, 9, 22, 18, 29, 7,
    28, 12, 35, 3, 26
  ]

  const redNumbers = [
    1,3,5,7,9,12,14,16,18,19,
    21,23,25,27,30,32,34,36
  ]

  function getColor(num) {
    if (num === 0) return 'green'
    return redNumbers.includes(num) ? 'red' : 'black'
  }

  function getDozen(num) {
    if (num >= 1 && num <= 12) return '1ST 12'
    if (num >= 13 && num <= 24) return '2ND 12'
    if (num >= 25 && num <= 36) return '3RD 12'
    return 'ZERO'
  }

  function getSector(num) {
    const voisins = [
      22,18,29,7,28,12,35,3,26,
      0,32,15,19,4,21,2,25
    ]

    const tiers = [
      27,13,36,11,30,8,
      23,10,5,24,16,33
    ]

    const orphelins = [
      1,20,14,31,9,17,34,6
    ]

    if (voisins.includes(num)) return 'VOISINS'
    if (tiers.includes(num)) return 'TIERS'
    if (orphelins.includes(num)) return 'ORPHELINS'
    return 'ZERO'
  }

  function analyzePatterns(list) {
    if (list.length < 6) {
      setPrediction('WAIT')
      setConfidence(0)
      setSignalType('Collecting data...')
      return
    }

    const recent = list.slice(0, 8)

    // DOZENS
    let dozenCount = {
      '1ST 12': 0,
      '2ND 12': 0,
      '3RD 12': 0
    }

    // SECTORS
    let sectorCount = {
      VOISINS: 0,
      TIERS: 0,
      ORPHELINS: 0
    }

    recent.forEach(n => {
      const dz = getDozen(n)
      const sector = getSector(n)

      if (dz !== 'ZERO') {
        dozenCount[dz]++
      }

      if (sector !== 'ZERO') {
        sectorCount[sector]++
      }
    })

    let bestDozen = Object.keys(dozenCount).reduce((a, b) =>
      dozenCount[a] > dozenCount[b] ? a : b
    )

    let bestSector = Object.keys(sectorCount).reduce((a, b) =>
      sectorCount[a] > sectorCount[b] ? a : b
    )

    let dozenScore = dozenCount[bestDozen]
    let sectorScore = sectorCount[bestSector]

    // PRIORIDADE MAIOR PARA SETORES
    if (sectorScore >= 4) {
      setPrediction(bestSector)
      setConfidence(85 + sectorScore)
      setSignalType('🔥 Strong wheel sector repetition')

      setLastPrediction({
        type: 'sector',
        value: bestSector
      })

      return
    }

    // DEZENAS
    if (dozenScore >= 5) {
      setPrediction(bestDozen)
      setConfidence(70 + dozenScore)
      setSignalType('📈 Dozen momentum detected')

      setLastPrediction({
        type: 'dozen',
        value: bestDozen
      })

      return
    }

    // ANALISE DE PROXIMIDADE NA RODA
    let closeHits = 0

    for (let i = 0; i < recent.length - 1; i++) {
      const current = europeanWheel.indexOf(recent[i])
      const next = europeanWheel.indexOf(recent[i + 1])

      let diff = Math.abs(current - next)

      if (diff <= 4 || diff >= 33) {
        closeHits++
      }
    }

    if (closeHits >= 4) {
      setPrediction('VOISINS')
      setConfidence(78)
      setSignalType('🎯 Wheel proximity detected')

      setLastPrediction({
        type: 'sector',
        value: 'VOISINS'
      })

      return
    }

    setPrediction('WAIT')
    setConfidence(0)
    setSignalType('No strong pattern')
  }

  function checkWin(newNumber) {
    if (!lastPrediction) return

    let isWin = false

    if (lastPrediction.type === 'dozen') {
      if (getDozen(newNumber) === lastPrediction.value) {
        isWin = true
      }
    }

    if (lastPrediction.type === 'sector') {
      if (getSector(newNumber) === lastPrediction.value) {
        isWin = true
      }
    }

    if (isWin) {
      setWins(prev => prev + 1)
    } else {
      setLosses(prev => prev + 1)
    }
  }

  function addNumber() {
    const num = parseInt(input)

    if (isNaN(num) || num < 0 || num > 36) return

    checkWin(num)

    const updated = [num, ...numbers].slice(0, 30)

    setNumbers(updated)

    analyzePatterns(updated)

    setInput('')
  }

  function resetAll() {
    setNumbers([])
    setPrediction('WAIT')
    setConfidence(0)
    setSignalType('Waiting...')
    setWins(0)
    setLosses(0)
    setLastPrediction(null)
  }

  const accuracy =
    wins + losses > 0
      ? ((wins / (wins + losses)) * 100).toFixed(1)
      : 0

  return (
    <main
      style={{
        background: '#000',
        minHeight: '100vh',
        color: 'white',
        padding: 20,
        fontFamily: 'Arial'
      }}
    >
      <h1 style={{ fontSize: 42 }}>
        ⚡ Lightning Roulette AI
      </h1>

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginTop: 20
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter roulette number"
          style={{
            padding: 15,
            fontSize: 18,
            width: 220,
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
          onClick={resetAll}
          style={{
            background: 'red',
            border: 'none',
            padding: '15px 25px',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          RESET
        </button>
      </div>

      <div
        style={{
          background: '#0a0a0a',
          marginTop: 30,
          padding: 25,
          borderRadius: 12
        }}
      >
        <h2>🤖 AI PREDICTION</h2>

        <div
          style={{
            fontSize: 55,
            color:
              prediction === 'WAIT'
                ? '#999'
                : '#00ff99',
            fontWeight: 'bold'
          }}
        >
          {prediction}
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 20,
            color: '#00ff99'
          }}
        >
          Confidence: {confidence}%
        </div>

        <div
          style={{
            marginTop: 10,
            color: '#ccc'
          }}
        >
          {signalType}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 20,
          marginTop: 20
        }}
      >
        <div
          style={{
            background: '#0a0a0a',
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
            Accuracy: {accuracy}%
          </h2>
        </div>

        <div
          style={{
            background: '#0a0a0a',
            padding: 20,
            borderRadius: 12
          }}
        >
          <h2>🎯 LAST SIGNAL</h2>

          <div style={{ fontSize: 28 }}>
            {prediction}
          </div>

          <div
            style={{
              marginTop: 10,
              color: '#999'
            }}
          >
            {signalType}
          </div>
        </div>

        <div
          style={{
            background: '#0a0a0a',
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
            {[...new Set(numbers)]
              .slice(0, 6)
              .map((n, i) => (
                <div
                  key={i}
                  style={{
                    background: '#00ff99',
                    color: 'black',
                    padding: '10px 15px',
                    borderRadius: 8,
                    fontWeight: 'bold'
                  }}
                >
                  {n}
                </div>
              ))}
          </div>
        </div>
      </div>

      <div
        style={{
          background: '#0a0a0a',
          marginTop: 20,
          padding: 20,
          borderRadius: 12
        }}
      >
        <h2>🎲 LAST 30 NUMBERS</h2>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 15
          }}
        >
          {numbers.map((num, i) => (
            <div
              key={i}
              style={{
                width: 50,
                height: 50,
                borderRadius: 10,
                background:
                  getColor(num) === 'red'
                    ? '#ff3355'
                    : getColor(num) === 'black'
                    ? '#222'
                    : 'green',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: 20
              }}
            >
              {num}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
