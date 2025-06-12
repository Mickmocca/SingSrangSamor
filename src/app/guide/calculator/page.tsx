"use client"

import { useState } from "react"
import { ChevronDown, Plus, CheckCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function Calculator() {
  const [scores, setScores] = useState({
    // GPAX
    gpax: "",
    
    // TGAT
    tgat1: "", // English
    tgat2: "", // Reasoning
    tgat3: "", // General Aptitude
    
    // TPAT
    tpat1_1: "", // Intelligence
    tpat1_2: "", // Ethics
    tpat1_3: "", // Connection
    tpat2_1: "", // Visual Arts
    tpat2_2: "", // Music
    tpat2_3: "", // Dance
    tpat3: "", // Science-Engineering
    tpat4: "", // Architecture
    tpat5: "", // Education
    
    // A-Level
    math1: "",
    math2: "",
    science: "",
    physics: "",
    chemistry: "",
    biology: "",
    social: "",
    thai: "",
    english: "",
    french: "",
    german: "",
    japanese: "",
    korean: "",
    chinese: "",
    pali: "",
    spanish: "",
  })

  const handleInputChange = (field: string, value: string) => {
    // Special handling for GPAX
    if (field === "gpax") {
      const numValue = value === "" ? "" : Math.min(Number(value), 4).toString()
      setScores((prev) => ({ ...prev, [field]: numValue }))
      return
    }

    // Handle other scores
    const maxScore = 100
    const numValue = value === "" ? "" : Math.min(Number(value), maxScore).toString()
    setScores((prev) => ({ ...prev, [field]: numValue }))
  }

  const calculateScore = () => {
    // Check if required scores are filled
    const requiredScores = [
      'gpax',
      'tpat1_1', 'tpat1_2', 'tpat1_3',  // TPAT1 components
      'thai', 'social', 'english',       // Required A-Level
      'math1',                          // Required Math
      'physics', 'chemistry', 'biology'  // Required Science
    ]
    
    const hasRequiredScores = requiredScores.every(score => scores[score as keyof typeof scores] !== "")
    if (!hasRequiredScores) return null
  
    // Convert scores to numbers
    const numericScores = {
      // GPAX
      gpax: Number(scores.gpax),
      
      // TPAT1 Components
      tpat1_intelligence: Number(scores.tpat1_1),
      tpat1_ethics: Number(scores.tpat1_2),
      tpat1_connection: Number(scores.tpat1_3),
      
      // Required A-Level subjects
      thai: Number(scores.thai),
      social: Number(scores.social),
      english: Number(scores.english),
      math: Number(scores.math1),        // Using math1 for calculation
      physics: Number(scores.physics),
      chemistry: Number(scores.chemistry),
      biology: Number(scores.biology),
      
      // Optional scores for other programs
      tgat1: Number(scores.tgat1),
      tgat2: Number(scores.tgat2),
      tgat3: Number(scores.tgat3),
    }
  
    // Calculate TPAT1 total (all components equal weight)
    const tpat1Score = (
      (numericScores.tpat1_intelligence + 
       numericScores.tpat1_ethics + 
       numericScores.tpat1_connection) / 300
    ) * 30  // 30% weight
  
    // Rest of calculation remains the same...
    // Calculate A-Level scores (70%)
    const scienceScore = ((numericScores.physics + numericScores.chemistry + numericScores.biology) / 300) * 28
    const mathScore = (numericScores.math / 100) * 14
    const englishScore = (numericScores.english / 100) * 14
    const thaiScore = (numericScores.thai / 100) * 7
    const socialScore = (numericScores.social / 100) * 7

    // Calculate total score
    const totalScore = tpat1Score + scienceScore + mathScore + englishScore + thaiScore + socialScore

    return {
      total: totalScore.toFixed(2),
      breakdown: {
        tpat1: tpat1Score.toFixed(2),
        science: scienceScore.toFixed(2),
        math: mathScore.toFixed(2),
        english: englishScore.toFixed(2),
        thai: thaiScore.toFixed(2),
        social: socialScore.toFixed(2)
      }
    }
  }

  // Add state for displaying results
  const [results, setResults] = useState<null | {
    total: string;
    breakdown: {
      tpat1: string;
      science: string;
      math: string;
      english: string;
      thai: string;
      social: string;
    }
  }>(null)

  // Modify the calculate button click handler
  const handleCalculate = () => {
    const calculatedResults = calculateScore()
    setResults(calculatedResults)
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">คำนวณคะแนน กสพท</h1>
          <p className="text-gray-600 mt-2">คำนวณคะแนนสอบเข้าแพทย์ กสพท รอบที่ 3</p>
        </div>

        {/* Scoring Formula Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
          <h2 className="font-medium text-blue-800 mb-2">วิธีการคิดคะแนน</h2>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• TPAT1 30% (คะแนนเต็ม 300 คะแนน)</p>
            <p>• วิทยาศาสตร์ 28% (ฟิสิกส์ + เคมี + ชีวะ)</p>
            <p>• คณิตศาสตร์ 14%</p>
            <p>• ภาษาอังกฤษ 14%</p>
            <p>• ภาษาไทย 7%</p>
            <p>• สังคมศึกษา 7%</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* GPAX Section */}
          <div className="mb-6">
            <label className="block text-orange-500 font-medium mb-2">GPAX</label>
            <div className="max-w-xs">
              <input
                type="number"
                value={scores.gpax}
                onChange={(e) => handleInputChange("gpax", e.target.value)}
                max={4}
                step="0.01"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="คะแนนเต็ม 4.00"
              />
            </div>
          </div>

          {/* TGAT Section */}
          <div className="mb-6">
            <label className="block text-orange-500 font-medium mb-2">TGAT ความถนัดทั่วไป</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">TGAT1 ภาษาอังกฤษ</label>
                <input
                  type="number"
                  value={scores.tgat1}
                  onChange={(e) => handleInputChange("tgat1", e.target.value)}
                  max={100}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="คะแนนเต็ม 100"
                />
              </div>
              {/* Add similar inputs for TGAT2 and TGAT3 */}
            </div>
          </div>

          {/* TPAT Section */}
          <div className="mb-6">
            <label className="block text-orange-500 font-medium mb-2">TPAT ความถนัดเฉพาะทาง</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: "tpat1_1", label: "TPAT1.1 เชาว์" },
                { key: "tpat1_2", label: "TPAT1.2 จริยธรรม" },
                { key: "tpat1_3", label: "TPAT1.3 เชื่อมโยง" },
                { key: "tpat2_1", label: "TPAT2.1 ทัศนศิลป์" },
                { key: "tpat2_2", label: "TPAT2.2 ดนตรี" },
                { key: "tpat2_3", label: "TPAT2.3 นาฏศิลป์" },
                { key: "tpat3", label: "TPAT3 วิทย์-วิศวฯ" },
                { key: "tpat4", label: "TPAT4 สถาปัตย์" },
                { key: "tpat5", label: "TPAT5 ครู" }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-600 mb-1">{label}</label>
                  <input
                    type="number"
                    value={scores[key as keyof typeof scores]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    max={100}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="คะแนนเต็ม 100"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* A-Level Section */}
          <div className="mb-6">
            <label className="block text-orange-500 font-medium mb-2">A-Level</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: "math1", label: "คณิตศาสตร์ 1" },
                { key: "math2", label: "คณิตศาสตร์ 2" },
                { key: "science", label: "วิทยาศาสตร์ทั่วไป" },
                { key: "physics", label: "ฟิสิกส์" },
                { key: "chemistry", label: "เคมี" },
                { key: "biology", label: "ชีววิทยา" },
                { key: "social", label: "สังคมศึกษา" },
                { key: "thai", label: "ภาษาไทย" },
                { key: "english", label: "ภาษาอังกฤษ" },
                { key: "french", label: "ภาษาฝรั่งเศส" },
                { key: "german", label: "ภาษาเยอรมัน" },
                { key: "japanese", label: "ภาษาญี่ปุ่น" },
                { key: "korean", label: "ภาษาเกาหลี" },
                { key: "chinese", label: "ภาษาจีน" },
                { key: "pali", label: "ภาษาบาลี" },
                { key: "spanish", label: "ภาษาสเปน" }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-600 mb-1">{label}</label>
                  <input
                    type="number"
                    value={scores[key as keyof typeof scores]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    max={100}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="คะแนนเต็ม 100"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <button 
          onClick={handleCalculate}
          disabled={!Object.values(scores).every(score => score !== "")}
          className="w-full bg-orange-500 text-white rounded-lg py-3 font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          คำนวณคะแนน
        </button>

        {/* Results Display */}
        {results && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">ผลการคำนวณ</h3>
            <div className="text-3xl font-bold text-orange-500 mb-6 text-center">
              {results.total}%
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: "tpat1", label: "TPAT1", weight: "30%" },
                { key: "science", label: "วิทยาศาสตร์", weight: "28%" },
                { key: "math", label: "คณิตศาสตร์", weight: "14%" },
                { key: "english", label: "ภาษาอังกฤษ", weight: "14%" },
                { key: "thai", label: "ภาษาไทย", weight: "7%" },
                { key: "social", label: "สังคมศึกษา", weight: "7%" }
              ].map(({ key, label, weight }) => (
                <div key={key} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{label} ({weight})</p>
                  <p className="font-medium text-gray-900">{results.breakdown[key as keyof typeof results.breakdown]}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

