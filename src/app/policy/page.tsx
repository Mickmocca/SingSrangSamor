"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { Send, Mic, GraduationCap, FileText, School, Bot, Menu, X, HelpCircle, UserCircle, Anchor } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function Educate() {
  const [activeTab, setActiveTab] = useState("general")
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "ai"; id: string }[]>([
    {
      text: "สวัสดีค่ะ 👋 ฉันเป็น AI ที่จะช่วยตอบคำถามเกี่ยวกับการเรียนต่อ การเตรียมตัวสอบ และแนะแนวการศึกษา คุณมีคำถามอะไรไหมคะ?",
      sender: "ai",
      id: "initial-message"
    },
  ])
  const [userInput, setUserInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([])
  

  // System prompt for the AI
  const systemPrompt = `คุณเป็น AI ที่เชี่ยวชาญด้านการแนะแนวการศึกษาในประเทศไทย
คุณมีความรู้เกี่ยวกับ:
- ระบบการศึกษาไทยและการสอบเข้ามหาวิทยาลัย
- ระบบ TCAS ทุกรอบ
- หลักสูตรและคณะต่างๆ ในมหาวิทยาลัย
- การเตรียมตัวสอบและการเรียน
- ทุนการศึกษาและโอกาสต่างๆ

คุณจะ:
1. ให้คำแนะนำที่เป็นประโยชน์และเป็นรูปธรรม
2. อธิบายอย่างละเอียดและเข้าใจง่าย
3. ให้ตัวอย่างและทางเลือกที่หลากหลาย
4. แนะนำแหล่งข้อมูลเพิ่มเติมที่น่าเชื่อถือ
5. ตอบคำถามด้วยข้อมูลที่ทันสมัยและถูกต้อง`
  
  // Close sidebar when window resizes to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Close sidebar when changing tabs on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }, [activeTab])

  const callTyphoonAPI = async (userMessage: string) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_TYPHOON_API_KEY
      const url = "https://api.opentyphoon.ai/v1/chat/completions"
      
      const newHistory = [...conversationHistory, { role: "user", content: userMessage }]
      setConversationHistory(newHistory)

      const messages = [
        { role: "system", content: systemPrompt },
        ...newHistory
      ]

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "typhoon-v2-70b-instruct",
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.95,
          repetition_penalty: 1.05
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const aiMessage = data.choices[0].message.content
      
      // Update conversation history with AI response
      setConversationHistory([...newHistory, { role: "assistant", content: aiMessage }])
      
      return aiMessage
    } catch (error) {
      console.error("Error calling Typhoon API:", error)
      return "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง"
    }
  }

  // Function to generate a unique ID
  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return
  
    // Add user message with unique ID
    const userMessageId = generateId();
    setMessages((prev) => [...prev, { text: userInput, sender: "user", id: userMessageId }])
    const currentInput = userInput
    setUserInput("")
    setIsTyping(true)
  
    try {
      const aiResponse = await callTyphoonAPI(currentInput)
      setIsTyping(false) // ปิดแอนิเมชันก่อนที่จะเพิ่มข้อความ AI
      setTimeout(() => {
        // Add AI message with unique ID
        const aiMessageId = generateId();
        setMessages((prev) => [...prev, { text: aiResponse, sender: "ai", id: aiMessageId }])
      }, 100) // เพิ่มการหน่วงเวลาเล็กน้อยเพื่อให้แน่ใจว่าแอนิเมชันหายไปก่อน
    } catch (error) {
      console.error("Error in handleSendMessage:", error)
      setIsTyping(false)
      setMessages((prev) => [...prev, { 
        text: "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง", 
        sender: "ai", 
        id: generateId() 
      }])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Speech recognition functionality
  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('ขออภัย เบราว์เซอร์ของคุณไม่รองรับการรับรู้เสียง');
      return;
    }
    
    setIsRecording(true);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'th-TH';
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(transcript);
      setIsRecording(false);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognition.onerror = () => {
      setIsRecording(false);
    };
    
    recognition.start();
  };

  // Animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  }

  const tabVariants = {
    inactive: { backgroundColor: "#f3f4f6", color: "#374151" },
    active: { backgroundColor: "#3b82f6", color: "#ffffff" }
  }

  // Page transitions
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  // Tab definitions for reuse
  const tabs = [
    {
      id: "general",
      icon: <Anchor size={20} />,
      title: "ข้อที่ 1",
      description: "การเรียน & การศึกษา"
    },
    {
      id: "policy_2",
      icon: <Anchor size={20} />,
      title: "ข้อที่ 2",
      description: "กิจกรรม & การสันทนาการ"
    },
    {
      id: "policy_3",
      icon: <Anchor size={20} />,
      title: "ข้อที่ 3",
      description: "ทัศนียภาพของโรงเรียน"
    },
    {
      id: "policy_4",
      icon: <Anchor size={20} />,
      title: "ข้อที่ 4",
      description: "กีฬา & การแข่งขัน"
    },
    {
      id: "policy_5",
      icon: <Anchor size={20} />,
      title: "ข้อที่ 5",
      description: "การบริหารทั่วไป"
    },
        {
      id: "policy_6",
      icon: <Anchor size={20} />,
      title: "ข้อที่ 6",
      description: "SCS (social cam SingSangSamor)"
    },
  ]

  return (
    <motion.main 
      className="min-h-screen flex flex-col bg-gray-50"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <Navigation />

      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 relative">
        {/* Mobile tab selector */}
        <div className="flex justify-between items-center mb-4 md:hidden">
          <h2 className="font-bold text-lg">{tabs.find(tab => tab.id === activeTab)?.title || "แนะแนวการศึกษา"}</h2>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg bg-white shadow-sm"
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <div className={`fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-medium text-lg">หัวข้อ</h3>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4 space-y-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left ${
                  activeTab === tab.id ? 'bg-primary text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div>{tab.icon}</div>
                <div>
                  <div className="font-medium">{tab.title}</div>
                  <div className="text-xs opacity-80">{tab.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {/* Desktop sidebar */}
          <div className="hidden md:block md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-20">
              <h3 className="font-medium text-lg mb-4">นโยบาย</h3>

              <div className="space-y-2">
                {tabs.map(tab => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-left"
                    variants={tabVariants}
                    animate={activeTab === tab.id ? "active" : "inactive"}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {tab.icon}
                    <div>
                      <div className="font-medium">{tab.title}</div>
                      <div className="text-xs opacity-80">{tab.description}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === "ai-guide" ? (
                <motion.div 
                  key="ai-guide"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden h-[500px] md:h-[600px] flex flex-col"
                >
                  <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-slate-50">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
                          variants={messageVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          {message.sender === "ai" && (
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 mr-2 flex-shrink-0 flex items-center justify-center">
                              <Bot size={20} className="text-white" />
                            </div>
                          )}

                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`max-w-[80%] sm:max-w-[70%] rounded-lg p-3 sm:p-4 ${
                              message.sender === "user"
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                                : "bg-white text-gray-800 border border-gray-200 shadow-sm"
                            }`}
                          >
                            <p className="whitespace-pre-line text-sm sm:text-base">{message.text}</p>
                          </motion.div>

                          {message.sender === "user" && (
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-green-500 to-teal-500 ml-2 flex-shrink-0 flex items-center justify-center">
                              <UserCircle size={20} className="text-white" />
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {isTyping && (
                        <motion.div 
                          className="flex justify-start mb-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          key="typing-indicator"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 mr-2 flex-shrink-0 flex items-center justify-center">
                            <Bot size={20} className="text-white" />
                          </div>
                          <div className="bg-white text-gray-800 rounded-lg p-4 border border-gray-200 shadow-sm">
                            <div className="flex space-x-2">
                              <motion.div 
                                className="w-2 h-2 bg-blue-500 rounded-full"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                              ></motion.div>
                              <motion.div 
                                className="w-2 h-2 bg-indigo-500 rounded-full"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                              ></motion.div>
                              <motion.div 
                                className="w-2 h-2 bg-purple-500 rounded-full"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                              ></motion.div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div ref={messagesEndRef} />
                    </AnimatePresence>
                  </div>

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 border-t border-gray-200 bg-white flex items-center space-x-2"
                  >
                    <motion.button 
                      className={`p-2 rounded-full ${
                        isRecording 
                          ? "bg-red-100 text-red-600" 
                          : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                      } transition-colors`}
                      whileHover={{ scale: isRecording ? 1 : 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={startSpeechRecognition}
                      title={isRecording ? "กำลังฟัง..." : "พูดข้อความ"}
                    >
                      <Mic size={20} className={`sm:w-5 sm:h-5 ${isRecording ? "animate-pulse" : ""}`} />
                    </motion.button>
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="พิมพ์ข้อความของคุณ..."
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    />
                    <motion.button
                      onClick={handleSendMessage}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-3 rounded-full ${
                        !userInput.trim() || isTyping
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:opacity-90"
                      } transition-all`}
                      disabled={!userInput.trim() || isTyping}
                    >
                      <Send size={18} className="sm:w-5 sm:h-5" />
                    </motion.button>
                  </motion.div>
                  
                  {/* Help Section */}
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center text-xs text-gray-500">
                      <HelpCircle size={14} className="mr-1" />
                      <span>คำแนะนำ:</span>
                      <div className="ml-2 flex flex-wrap gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setUserInput("ระบบ TCAS คืออะไร")}
                          className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors"
                        >
                          ระบบ TCAS
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setUserInput("คณะอะไรเหมาะกับคนชอบคณิตศาสตร์")}
                          className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors"
                        >
                          คณะที่เหมาะกับฉัน
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setUserInput("แนะนำทุนการศึกษาหน่อย")}
                          className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors"
                        >
                          ทุนการศึกษา
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : activeTab === "general" ? (
                <motion.div 
                  key="general"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg shadow-md p-4 sm:p-6"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">นโยบายที่ 1</h2>

                  <div className="prose max-w-none">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3">การเรียน และ การศึกษา</h3>

                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-6"
                    >
                      <h4 className="text-base sm:text-lg font-medium mb-2">จัดประกวดความสามารถการแข่งขัน</h4>
                      <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base">
                        <li>จัดประกวดความสามารถการแข่งขันในแต่ละวิชา เปิดรับสมัครด้านการเรียนในแต่ละวิชา และมีเกียรติบัตรสำหรับผู้เข้าร่วมทุกคน ไม่ว่าจะตอบคำถามในวันสำคัญหรือการเรียน พร้อมออกเกียรติบัตรให้ฟรีสำหรับผู้ที่เข้าร่วม และมีรางวัล</li>
                      </ul>
                      <h4 className="text-base sm:text-lg font-medium mb-2">Open house</h4>
                      <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base">
                        <li>แนะนำ open house มหาลัยต่างๆ ว่ามีการเปิดโอเพ่นเฮาส์ในวันไหนบ้าง สำหรับนักเรียนที่สนใจจะศึกษาต่อในมหาลัย</li>
                      </ul>
                      <h4 className="text-base sm:text-lg font-medium mb-2">ศิลปหัตถกรรม</h4>
                      <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base">
                        <li>มีรถตู้สำหรับส่งคนแข่งขันศิลปหัตถกรรม และเปิดรับคนเข้าแข่งขันใหม่ๆ</li>
                      </ul>
                      <h4 className="text-base sm:text-lg font-medium mb-2">โครงการ Apple for education สิทธิประโยชน์ที่มอบให้นักเรียน คุณครู และบุคลากร</h4>
                      <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base">
                        <li>ได้รับสิทธิ์เข้าร่วมอบรม online/onsite ในการประยุกต์ใช้สื่อการสอน</li>
                        <li>ได้รับคำปรึกษา แนะนำการใช้อุปกรณ์ ฟรี ที่สาขาตลอดเวลาทำการ</li>
                        <li>ได้รับสิทธิซื้อผลิตภัณฑ์แอปเปิ้ลในราคาเพื่อการศึกษา โดยเฉพาะ iPad, MAC books, and Apple pencil</li>
                      </ul>
                    </motion.div>
                  </div>
                </motion.div>

              ) : activeTab === "policy_2" ? (
                <motion.div 
                  key="policy_2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg shadow-md p-4 sm:p-6"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">นโยบายที่ 2</h2>

                  <div className="prose max-w-none">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3">กิจกรรม และ การสันทนาการ</h3>

                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-6"
                    >
                      <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base">
                        <li>ออกแบบปกสมุดของโรงเรียน สนับสนุนเหล่านักวาดตัวน้อยๆ เพื่อโชว์ผลงานของตัวเอง</li>
                        <li>เพิ่มจำนวนนักเรียนจิตอาสา และร่วมพัฒนาโรงเรียนในด้านต่างๆ</li>
                        <li>เรียน = รายได้ สนับสนุนโปรโมทให้นักเรียนสร้างรายได้ มีแบรนด์เป็นของตัวเอง และเราจะโปรโมทสินค้าทางสภาโรงเรียน</li>
                        <li>ส่งเสริมสนับสนุนค่าย/การแข่งขัน ทักษะทางวิชาการ เนื่องจากเห็นนักเรียนหลายคนทักษะความสามารถนั้นต่างๆ รวมไปถึง ความสามารถทางวิชาการ ทางพรรคจึงอยากจะส่งเสริมและสนับสนุนการจัดค่ายรวมไปถึงการแข่งขันทางวิชาการ</li>
                        <li>สนับสนุนกิจกรรม Cover Dance และ Sing Cover เพื่อให้นักเรียนได้โชว์ศักยภาพของตนเองและใช้เวลาว่างให้เป็นประโยชน์</li>
                        <li>ประกวดทำหนังสั้นของโรงเรียน Short film contest และเป็นเวทีสำหรับการแสดงความสามารถของน้องๆ เพื่อยกระดับ production ของโรงเรียน เพื่อให้ผลงานได้เฉิดฉาย สู่โลก Internet</li>
                        <li>มีกิจกรรม cosplay ในวันสถาปนาโรงเรียนและแสดงความสามารถในแบบของตนเอง</li>
                        <li>มีกิจกรรมในวันวาเลนไทน์ ฝากส่งของเขียนชื่อ และมี valentines box ให้เพื่อนสนิท หรือคนที่ตัวเองรู้จัก ส่งเสริมหารายได้ให้กับสภานักเรียน</li>
                        <li>จะมีการส่งนักดนตรีไปแข่งที่อื่น เพื่อโชว์ศักยภาพของตนเอง</li>
                        <li>จัดหาตัวแทนนักเรียนดีเด่น โครงการเด็กและเยาวชน</li>
                      </ul>
                    </motion.div>
                  </div>
                </motion.div>

              ) : activeTab === "policy_2" ? (
                <motion.div 
                  key="policy_2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg shadow-md p-4 sm:p-6"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">นโยบายที่ 2</h2>

                  <div className="prose max-w-none">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3">กิจกรรม และ การสันทนาการ</h3>

                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-6"
                    >
                      <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base">
                        <li>ออกแบบปกสมุดของโรงเรียน สนับสนุนเหล่านักวาดตัวน้อยๆ เพื่อโชว์ผลงานของตัวเอง</li>
                        <li>เพิ่มจำนวนนักเรียนจิตอาสา และร่วมพัฒนาโรงเรียนในด้านต่างๆ</li>
                        <li>เรียน = รายได้ สนับสนุนโปรโมทให้นักเรียนสร้างรายได้ มีแบรนด์เป็นของตัวเอง และเราจะโปรโมทสินค้าทางสภาโรงเรียน</li>
                        <li>ส่งเสริมสนับสนุนค่าย/การแข่งขัน ทักษะทางวิชาการ เนื่องจากเห็นนักเรียนหลายคนทักษะความสามารถนั้นต่างๆ รวมไปถึง ความสามารถทางวิชาการ ทางพรรคจึงอยากจะส่งเสริมและสนับสนุนการจัดค่ายรวมไปถึงการแข่งขันทางวิชาการ</li>
                        <li>สนับสนุนกิจกรรม Cover Dance และ Sing Cover เพื่อให้นักเรียนได้โชว์ศักยภาพของตนเองและใช้เวลาว่างให้เป็นประโยชน์</li>
                        <li>ประกวดทำหนังสั้นของโรงเรียน Short film contest และเป็นเวทีสำหรับการแสดงความสามารถของน้องๆ เพื่อยกระดับ production ของโรงเรียน เพื่อให้ผลงานได้เฉิดฉาย สู่โลก Internet</li>
                        <li>มีกิจกรรม cosplay ในวันสถาปนาโรงเรียนและแสดงความสามารถในแบบของตนเอง</li>
                        <li>มีกิจกรรมในวันวาเลนไทน์ ฝากส่งของเขียนชื่อ และมี valentines box ให้เพื่อนสนิท หรือคนที่ตัวเองรู้จัก ส่งเสริมหารายได้ให้กับสภานักเรียน</li>
                        <li>จะมีการส่งนักดนตรีไปแข่งที่อื่น เพื่อโชว์ศักยภาพของตนเอง</li>
                        <li>จัดหาตัวแทนนักเรียนดีเด่น โครงการเด็กและเยาวชน</li>
                      </ul>
                    </motion.div>
                  </div>
                </motion.div>

              ) : activeTab === "policy_3" ? (
                <motion.div 
                  key="policy_3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg shadow-md p-4 sm:p-6"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">นโยบายที่ 3</h2>

                  <div className="prose max-w-none">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3">กิจกรรม และ การสันทนาการ</h3>

                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-6"
                    >
                      <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base">
                        <li>มีการตรวจอุปกรณ์ในห้องน้ำ ตรวจอุปกรณ์ในที่นี้ไม่ได้จัดแค่อุปกรณ์ทำความสะอาด หรือสิ่งที่อำนวยความสะดวก แต่รวมไปถึงสิ่งก่อสร้าง ซ่อมแซม</li>
                        <li>ปรับทัศนียภาพให้กับโรงเรียน ไม่ว่าจะบริเวณหน้าโรงเรียนหรือภายในโรงเรียน จะมีการตัดหญ้า 1 ครั้งต่อ 3 เดือน</li>
                        <li>นำกระดาษที่ใช้แล้วมาเป็นกระดาษห่อผ้านามัย</li>
                        <li>ส่งเสริมสนับสนุนค่าย/การแข่งขัน ทักษะทางวิชาการ เนื่องจากเห็นนักเรียนหลายคนทักษะความสามารถนั้นต่างๆ รวมไปถึง ความสามารถทางวิชาการ ทางพรรคจึงอยากจะส่งเสริมและสนับสนุนการจัดค่ายรวมไปถึงการแข่งขันทางวิชาการ</li>
                        <li>มีการนำถุงหอมไว้ในห้องน้ำ</li>
                        <li>ซ่อมอุปกรณ์กีฬาให้ ทั้งม.ต้นและม.ปลาย</li>
                      </ul>
                    </motion.div>
                  </div>
                </motion.div>

              ) : activeTab === "policy_4" ? (
                <motion.div 
                  key="policy_4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg shadow-md p-4 sm:p-6"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">นโยบายที่ 4</h2>

                  <div className="prose max-w-none">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3">กิจกรรม และ การสันทนาการ</h3>

                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-6"
                    >
                      <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base">
                        <li>การแข่งขัน E-sport เราจะจัดการแข่งขัน เกมที่เป็นนิยมในขณะนี้ เพื่อส่งเสริมความชอบ ความสามารถของนักเรียน ในวันสถาปนาหน้าห้องสมุด</li>
                        <li>มีอุปกรณ์กีฬาเพิ่มมากขึ้น</li>
                        <li>มีรถตู้สำหรับส่งแข่งนักกีฬานอกโรงเรียน</li>
                        <li>มีบริการผ้าเย็นฟรีและน้ำเปล่าให้กิน</li>
                        <li>ในวันก่อนกีฬาสีนั้น จะปรับเปลี่ยนเนื้อเสื้อกีฬาสีจะใช้เนื้อผ้าแบบผ้าไมโคร เนื่องจากมีความสะดวกสบายกว่า มีลูกเล่น ระบายอากาศได้ดี และต้นทุนในการทำราคาถูกกว่า</li>
                        <li>เชิญชวนพี่น้องที่สนใจในการออกแบบ ร่วมประกอบ ตราสัญลักษณ์ และแบบเสื้อกีฬาสีภายใน</li>
                      </ul>
                    </motion.div>
                  </div>
                </motion.div>

              ) : activeTab === "policy_5" ? (
                <motion.div 
                  key="policy_5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg shadow-md p-4 sm:p-6"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">นโยบายที่ 5</h2>

                  <div className="prose max-w-none">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3">กิจกรรม และ การสันทนาการ</h3>

                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-6"
                    >
                      <h4 className="text-base sm:text-lg font-medium mb-2">การประชาสัมพันธ์ข่าว</h4>
                      <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base">
                        <li>การประชาสัมพันธ์ข่าวสารจะกว้างขวางมากขึ้น เนื่องด้วยเวลาประชาสัมพันธ์ข่าวสารนั้นก็จะมีเพียงในเพจโรงเรียนเท่านั้น จึงทำให้นักเรียนหลายคนไม่ค่อยได้รับข่าวสาร ในโยบายข้อนี้การกระจายข่าวสารประชาสัมพันธ์นั้นจะมีการช่วยกระจายภายในพรรคเช่นกัน โดยมีสมาชิกในพรรคช่วยเป็น กระบอกเสียง รวมถึงการประชาสัมพันธ์ออฟไลน์</li>
                      </ul>
                      <h4 className="text-base sm:text-lg font-medium mb-2">กล่องครัวซอง</h4>
                      <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base">
                        <li>กล่องครัวซอง สามารถเขียนคำ ร้องเรียน เรื่องต่างๆ ที่เป็นปัญหาลงไปในกล่องได้ โดยสามารถเขียนไม่ระบุตัวตนได้ และจะช่วยแก้ไข พัฒนาเอง โรงเรียน และทางสภาจะนำมาอ่านและสำรวจทุกๆสัปดาห์</li>
                      </ul>
                      <h4 className="text-base sm:text-lg font-medium mb-2">Zero Waste X </h4>
                      <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base">
                        <li>โครงการ Zero Waste X ขยะแลกแต้ม การสะสมแต้ม สภาจะเพิ่มคะแนนใน student care และออกใบเกียรติบัตรสำหรับคนที่สะสมคะแนน (คนเพิ่มคะแนนในระบบคือคณะกรรมการคุณครู zero waste) ขยะที่สามารถแลกได้</li>
                      </ul>
                      <ul className="pl-6 mb-4 space-y-1 text-sm sm:text-base">
                        <li>แก้วพลาสติก 5 ใบ : 1 แต้ม</li>
                        <li>กระดาษที่ใช้แล้ว 5 แผ่น : 1 แต้ม</li>
                        <li>กระป๋อง 1 ใบ : 1 แต้ม</li>
                        <li>ขวดน้ำ 1 ขวด : 1 แต้ม</li>
                        <li>หยีบย่อกระป๋องก่อนนำมาแลกแต้ม</li>
                        <li>กระดาษจากสมุด หนังสือ หรือกระดาษ A4 ที่ใช้แล้วทั้ง 2 หน้า</li>
                        <li>ขวดน้ำต้องแกะฉลากทุกครั้งเพื่อเพิ่มมูลค่าการชั่งขาย</li>
                      </ul>
                      <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base">
                        <li>ขอเพลงเปิดสำหรับตอนเช้าและตอนเย็นได้</li>
                        <li>มีเทศกาลดนตรีในศุกร์ต้นเดือนและศุกร์ท้ายเดือน เดือนละ 2 ครั้ง</li>
                        <li>หลังกีฬาสีจะให้ใส่ชุดกีฬาสีของตนเอง ในทุกๆวันศุกร์</li>
                        <li>แจ้งซ่อมสิ่งของในห้องเรียนผ่านทางสภา เพื่อเร่งการซ่อมหรือเปลี่ยนของให้เร็วขึ้น</li>
                        <li>ในทุกๆเช้าของการเข้าแถว โดมสงากับทางคุณครู ทางสภาจะตรวจสังเกตการณ์คุนโดดแถวตามบริเวณต่างๆ</li>
                      </ul>
                    </motion.div>
                  </div>
                </motion.div>

                              ) : activeTab === "policy_6" ? (
                <motion.div 
                  key="policy_6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg shadow-md p-4 sm:p-6"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">นโยบายที่ 6</h2>

                  <div className="prose max-w-none">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3">SCS (Social Cam SingSangSamor) </h3>

                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-6"
                    >
                      <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base">
                        <li>มีตากล้องถ่ายรูปฟรีตามงานต่าง ๆ และมีรับจ้างถ่ายรูปส่วนตัว ตามงานกิจกรรมต่าง ๆ</li>
                        <li>มีเพจสภาสำหรับลงรูปกิจกรรมต่าง ๆ ในช่องทาง Facebook หรือ เว็บไซต์ของโรงเรียน</li>
                        <li>มี content TikTok ให้ตลอดเวลา อาจมีการสัมภาษณ์ และมีกิจกรรม</li>
                        <li>มี YouTube รับฝากลงผลงานต่าง ๆ หรือในการโหวตสำหรับการแข่งขัน และจะทำคลิปกิจกรรมต่าง ๆ ให้กับทางโรงเรียน เพื่อให้โรงเรียนเป็นที่น่ารู้จักมากขึ้น</li>
                        <li>มี discord ไว้สำหรับแจ้งข่าวสารหรือหาเพื่อน พี่ น้องในสิงห์สมุทร</li>
                      </ul>
                    </motion.div>
                  </div>
                </motion.div>

              ) : (
                <motion.div
                  key="faculty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg shadow-md p-4 sm:p-6"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">คณะและสาขาวิชา</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <motion.div
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    >
                      <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <School size={36} className="sm:w-12 sm:h-12" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">คณะวิศวกรรมศาสตร์</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">ศึกษาเกี่ยวกับการออกแบบ พัฒนา และแก้ไขปัญหาทางวิศวกรรม</p>
                        <div className="text-xs text-gray-500">
                          <div className="mb-1">
                            <span className="font-medium">สาขายอดนิยม:</span> วิศวกรรมคอมพิวเตอร์, วิศวกรรมไฟฟ้า, วิศวกรรมโยธา
                          </div>
                          <div>
                            <span className="font-medium">อาชีพที่เกี่ยวข้อง:</span> วิศวกร, นักพัฒนาซอฟต์แวร์, ผู้จัดการโครงการ
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    >
                      <div className="h-32 sm:h-40 bg-gradient-to-r from-green-500 to-teal-600 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <GraduationCap size={36} className="sm:w-12 sm:h-12" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">คณะแพทยศาสตร์</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">ศึกษาเกี่ยวกับการรักษาและดูแลสุขภาพของมนุษย์</p>
                        <div className="text-xs text-gray-500">
                          <div className="mb-1">
                            <span className="font-medium">สาขายอดนิยม:</span> แพทยศาสตร์, รังสีวิทยา, วิสัญญีวิทยา
                          </div>
                          <div>
                            <span className="font-medium">อาชีพที่เกี่ยวข้อง:</span> แพทย์, นักวิจัยทางการแพทย์, อาจารย์แพทย์
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    >
                      <div className="h-32 sm:h-40 bg-gradient-to-r from-red-500 to-pink-600 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <FileText size={36} className="sm:w-12 sm:h-12" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">คณะบริหารธุรกิจ</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">ศึกษาเกี่ยวกับการบริหารจัดการองค์กรและธุรกิจ</p>
                        <div className="text-xs text-gray-500">
                          <div className="mb-1">
                            <span className="font-medium">สาขายอดนิยม:</span> การตลาด, การบัญชี, การจัดการทรัพยากรมนุษย์
                          </div>
                          <div>
                            <span className="font-medium">อาชีพที่เกี่ยวข้อง:</span> นักธุรกิจ, นักการตลาด, ผู้จัดการฝ่ายบุคคล
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    >
                      <div className="h-32 sm:h-40 bg-gradient-to-r from-yellow-500 to-amber-600 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <Bot size={36} className="sm:w-12 sm:h-12" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">คณะวิทยาศาสตร์</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">ศึกษาเกี่ยวกับทฤษฎีและการทดลองทางวิทยาศาสตร์</p>
                        <div className="text-xs text-gray-500">
                          <div className="mb-1">
                            <span className="font-medium">สาขายอดนิยม:</span> วิทยาการคอมพิวเตอร์, ชีววิทยา, เคมี
                          </div>
                          <div>
                            <span className="font-medium">อาชีพที่เกี่ยวข้อง:</span> นักวิทยาศาสตร์, นักวิจัย, นักพัฒนาซอฟต์แวร์
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="mt-6 sm:mt-8">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">กลุ่มคณะยอดนิยม</h3>

                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                        <table className="min-w-full bg-white border border-gray-200 text-sm">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="py-2 sm:py-3 px-3 sm:px-4 text-left border-b font-medium">กลุ่มคณะ</th>
                              <th className="py-2 sm:py-3 px-3 sm:px-4 text-left border-b font-medium">วิชาสอบที่เกี่ยวข้อง</th>
                              <th className="py-2 sm:py-3 px-3 sm:px-4 text-left border-b font-medium">คะแนนเฉลี่ย</th>
                              <th className="py-2 sm:py-3 px-3 sm:px-4 text-left border-b font-medium">แนวโน้มตลาดงาน</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="hover:bg-gray-50">
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">วิศวกรรมศาสตร์</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">TGAT, TPAT3, A-Level (คณิตศาสตร์, ฟิสิกส์)</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">16,000 - 22,000</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">สูง</span>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">แพทยศาสตร์</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">TGAT, TPAT1, TPAT2, A-Level (ชีววิทยา, เคมี, ฟิสิกส์)</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">20,000 - 25,000</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">สูงมาก</span>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">บริหารธุรกิจ</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">TGAT, A-Level (คณิตศาสตร์, ภาษาอังกฤษ)</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">12,000 - 18,000</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">ปานกลาง</span>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">วิทยาศาสตร์</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">TGAT, TPAT2, A-Level (ตามสาขา)</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">13,000 - 19,000</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">ปานกลางถึงสูง</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.main>
  );
}