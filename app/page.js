'use client'

import { useState } from 'react'

export default function Home() {
  const [numbers, setNumbers] = useState([])
  const [input, setInput] = useState('')

  const addNumber = () => {
    if (input === '') return

    setNumbers([parseInt(input), ...numbers.slice(0, 29)])
    setInput('')
  }

  const getPrediction = () => {
    if (numbers.length < 5) {
      return 'Add more roulette numbers...'
    }

    const last = numbers[0]

    if (last >= 1 && last <= 12) {
      return 'Possible region: 13-24'
    }

    if (last >= 13 && last <= 24) {
      return 'Possible region: 25-36'
    }

    if (last >= 25 && last <= 36) {
      return 'Possible region: 1-12'
    }

    return 'Watch next spin carefully'
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#111',
        color: 'white',
        padding: '40px',
        fontFamily: 'Arial'
      }}
    >
      <h1 style={{ fontSize: '42px' }}>
        ⚡ Lightning Roulette Tracker
      </h1>

      <p>
        Add roulette results and track possible regions.
      </p>

      <div style={{ marginTop: '20px' }}>
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter number"
          style={{
            padding: '12px',
            fontSize: '18px',
            width: '200px',
            marginRight: '10px'
          }}
        />

        <button
          onClick={addNumber}
          style={{
            padding: '12px 20px',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          Add
        </button>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Prediction:</h2>
        <p style={{ color: '#00ff99', fontSize: '24px' }}>
          {getPrediction()}
        </p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Last Numbers:</h2>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          {numbers.map((n, i) => (
            <div
              key={i}
              style={{
                background: '#222',
                padding: '12px',
                borderRadius: '10px',
                minWidth: '50px',
                textAlign: 'center'
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
