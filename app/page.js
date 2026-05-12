'use client'

import { useState } from 'react'
import Tesseract from 'tesseract.js'

export default function Home() {

  const [image, setImage] = useState(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [numbers, setNumbers] = useState([])

  const extractNumbers = async (file) => {

    setLoading(true)

    const result = await Tesseract.recognize(
      file,
      'eng'
    )

    const detectedText = result.data.text

    setText(detectedText)

    // PEGAR APENAS NÚMEROS
    const foundNumbers =
      detectedText.match(/\d+/g)

    if (foundNumbers) {

      const cleanNumbers =
        foundNumbers
          .map(n => Number(n))
          .filter(
            n => n >= 0 && n <= 36
          )

      setNumbers(cleanNumbers)
    }

    setLoading(false)
  }

  return (

    <main style={{
      background:'#050505',
      minHeight:'100vh',
      color:'white',
      padding:'30px',
      fontFamily:'Arial'
    }}>

      <h1 style={{
        fontSize:'48px',
        marginBottom:'20px'
      }}>
        ⚡ Roulette OCR AI
      </h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e)=>{

          const file = e.target.files[0]

          if(file){

            setImage(
              URL.createObjectURL(file)
            )

            extractNumbers(file)
          }
        }}
      />

      {loading && (

        <h2 style={{
          marginTop:'20px',
          color:'#00ff99'
        }}>
          Reading roulette numbers...
        </h2>

      )}

      {image && (

        <div style={{
          marginTop:'30px'
        }}>

          <img
            src={image}
            alt="roulette"
            style={{
              width:'350px',
              borderRadius:'12px'
            }}
          />

        </div>

      )}

      <div style={{
        marginTop:'30px',
        background:'#111',
        padding:'20px',
        borderRadius:'12px'
      }}>

        <h2>🎯 Detected Numbers</h2>

        <div style={{
          display:'flex',
          gap:'10px',
          flexWrap:'wrap',
          marginTop:'15px'
        }}>

          {numbers.map((n,i)=>(

            <div
              key={i}
              style={{
                width:'55px',
                height:'55px',
                background:'#00ff99',
                color:'black',
                borderRadius:'10px',
                display:'flex',
                justifyContent:'center',
                alignItems:'center',
                fontWeight:'bold',
                fontSize:'22px'
              }}
            >
              {n}
            </div>

          ))}

        </div>

      </div>

      <div style={{
        marginTop:'30px',
        background:'#111',
        padding:'20px',
        borderRadius:'12px'
      }}>

        <h2>📝 OCR RAW TEXT</h2>

        <p style={{
          color:'#aaa',
          marginTop:'10px',
          whiteSpace:'pre-wrap'
        }}>
          {text}
        </p>

      </div>

    </main>
  )
}
