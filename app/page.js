'use client'

import { useState, useEffect } from 'react'

const redNumbers = [
  1,3,5,7,9,12,14,16,18,19,
  21,23,25,27,30,32,34,36
]

const wheel = [
  0,32,15,19,4,21,2,25,17,34,6,
  27,13,36,11,30,8,23,10,5,24,
  16,33,1,20,14,31,9,22,18,29,
  7,28,12,35,3,26
]

export default function Home() {

  const [input, setInput] = useState('')
  const [numbers, setNumbers] = useState([])
  const [prediction, setPrediction] = useState('Waiting data...')
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)
  const [lastPrediction, setLastPrediction] = useState(null)
  const [hotNumbers, setHotNumbers] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('roulette_numbers')

    if(saved){
      setNumbers(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      'roulette_numbers',
      JSON.stringify(numbers)
    )
  }, [numbers])

  const getColor = (n) => {
    if(n === 0) return 'green'
    return redNumbers.includes(n) ? 'red' : 'black'
  }

  const getRegion = (n) => {
    if(n >= 1 && n <= 12) return '1-12'
    if(n >= 13 && n <= 24) return '13-24'
    if(n >= 25 && n <= 36) return '25-36'
    return 'ZERO'
  }

  const getSector = (n) => {

    const index = wheel.indexOf(n)

    if(index <= 12) return 'Voisins'
    if(index <= 24) return 'Tiers'

    return 'Orphelins'
  }

  const detectPattern = (arr) => {

    if(arr.length < 6){
      return 'Collecting spins...'
    }

    const lastThree = arr.slice(0,3)

    const sameRegion =
      getRegion(lastThree[0]) === getRegion(lastThree[1])

    if(sameRegion){
      return `🔥 Pattern detected: ${getRegion(lastThree[0])}`
    }

    const sameSector =
      getSector(lastThree[0]) === getSector(lastThree[1])

    if(sameSector){
      return `⚡ Sector repeating: ${getSector(lastThree[0])}`
    }

    const evenPattern =
      lastThree.every(n => n % 2 === 0)

    if(evenPattern){
      return '🟢 Even streak detected'
    }

    return 'No strong pattern'
  }

  const generatePrediction = (arr) => {

    if(arr.length < 5){
      return 'Waiting more numbers...'
    }

    const latest = arr[0]

    const region = getRegion(latest)

    if(region === '1-12'){
      return 'Possible move → 13-24'
    }

    if(region === '13-24'){
      return 'Possible move → 25-36'
    }

    if(region === '25-36'){
      return 'Possible move → 1-12'
    }

    return 'Watch table'
  }

  const updateHotNumbers = (arr) => {

    const freq = {}

    arr.forEach(n => {
      freq[n] = (freq[n] || 0) + 1
    })

    const sorted = Object.entries(freq)
      .sort((a,b) => b[1] - a[1])
      .slice(0,5)

    setHotNumbers(sorted)
  }

  const addNumber = () => {

    if(input === '') return

    const num = parseInt(input)

    if(num < 0 || num > 36) return

    const updated = [num, ...numbers].slice(0,30)

    if(lastPrediction){

      const predictedRegion =
        lastPrediction.split('→ ')[1]

      if(predictedRegion){

        if(getRegion(num) === predictedRegion){

          setWins(prev => prev + 1)

        } else {

          setLosses(prev => prev + 1)

        }
      }
    }

    const newPrediction =
      generatePrediction(updated)

    setLastPrediction(newPrediction)

    setPrediction(
      detectPattern(updated) +
      ' | ' +
      newPrediction
    )

    updateHotNumbers(updated)

    setNumbers(updated)

    setInput('')
  }

  const resetAll = () => {

    setNumbers([])
    setWins(0)
    setLosses(0)
    setPrediction('Waiting data...')
    setHotNumbers([])

    localStorage.removeItem('roulette_numbers')
  }

  return (

    <main style={{
      background:'#111',
      minHeight:'100vh',
      color:'white',
      padding:'30px',
      fontFamily:'Arial'
    }}>

      <h1 style={{
        fontSize:'42px',
        marginBottom:'10px'
      }}>
        ⚡ Roulette AI Tracker
      </h1>

      <h2>
        WINS: 🟢 {wins}
        {' | '}
        LOSSES: 🔴 {losses}
      </h2>

      <div style={{
        marginTop:'20px',
        display:'flex',
        gap:'10px'
      }}>

        <input
          type="number"
          placeholder="0-36"
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          style={{
            padding:'12px',
            fontSize:'18px',
            width:'120px'
          }}
        />

        <button
          onClick={addNumber}
          style={{
            padding:'12px 20px',
            cursor:'pointer',
            fontWeight:'bold'
          }}
        >
          ADD
        </button>

        <button
          onClick={resetAll}
          style={{
            padding:'12px 20px',
            cursor:'pointer',
            background:'red',
            color:'white',
            border:'none'
          }}
        >
          RESET
        </button>

      </div>

      <div style={{
        marginTop:'30px',
        background:'#1c1c1c',
        padding:'20px',
        borderRadius:'12px'
      }}>

        <h2>🤖 AI Detection</h2>

        <p style={{
          color:'#00ff99',
          fontSize:'24px'
        }}>
          {prediction}
        </p>

      </div>

      <div style={{
        marginTop:'30px'
      }}>

        <h2>🔥 HOT NUMBERS</h2>

        <div style={{
          display:'flex',
          gap:'10px',
          flexWrap:'wrap'
        }}>

          {hotNumbers.map(([num,count],i)=>(

            <div
              key={i}
              style={{
                background:'#222',
                padding:'15px',
                borderRadius:'12px',
                textAlign:'center',
                minWidth:'80px'
              }}
            >
              <div style={{
                fontSize:'24px'
              }}>
                {num}
              </div>

              <div>
                {count}x
              </div>
            </div>

          ))}

        </div>

      </div>

      <div style={{
        marginTop:'40px'
      }}>

        <h2>🎯 Last 30 Spins</h2>

        <div style={{
          display:'flex',
          gap:'10px',
          flexWrap:'wrap'
        }}>

          {numbers.map((n,i)=>(

            <div
              key={i}
              style={{
                width:'60px',
                height:'60px',
                borderRadius:'50%',
                background:getColor(n),
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                fontWeight:'bold',
                fontSize:'20px',
                border:'2px solid white'
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
