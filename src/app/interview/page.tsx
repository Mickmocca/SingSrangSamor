"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { 
  MessageCircle, 
  Send, 
  Mic, 
  Bot, 
  Menu, 
  X, 
  Settings, 
  HelpCircle,
  UserCircle,
  BookUser,
  Sliders,
  Share2,
  Heart,
  Loader2,
  Trash2 
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"

export default function Interview() {
  interface Post {
    id: string;
    content: string;
    createdAt: string;
    likes: number;
    user: {
      username: string;
      profileImage: string;
    };
  }
  
  const [activeTab, setActiveTab] = useState("human")
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "ai"; timestamp: number; id: string }[]>([
    {
      text: "สวัสดีค่ะ ฉันคือผู้สัมภาษณ์ของมหาวิทยาลัยที่คุณกำลังสมัคร ยินดีที่ได้รู้จักนะคะ เราจะเริ่มการสัมภาษณ์กันเลยนะคะ ช่วยแนะนำตัวคุณเองหน่อยค่ะ",
      sender: "ai",
      timestamp: Date.now(),
      id: "initial-message"
    },
  ])
  const [userInput, setUserInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [intensity, setIntensity] = useState(2)
  const [isDynamicMode, setIsDynamicMode] = useState(false)
  const [isRandomMode, setIsRandomMode] = useState(false)
  const [isRecording, setIsRecording] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([])

  // Post-related state
  const [posts, setPosts] = useState<Post[]>([])
  const [postContent, setPostContent] = useState("")
  const [isPostingLoading, setIsPostingLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const { user } = useAuth()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])


  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
  
      if (data.success) {
        // Refresh posts after deletion
        await fetchPosts(currentPage)
        
        // Optional: Show a success toast or notification
        // You can use a toast library or a simple state-based notification
      } else {
        // Handle error (show error message)
        console.error(data.message)
        // Optional: Show error toast or notification
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      // Optional: Show error toast or notification
    }
  }

  // Fetch posts
  const fetchPosts = async (page = 1) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/posts?page=${page}`)
      const data = await response.json()

      if (data.success) {
        setPosts(data.posts)
        setCurrentPage(data.pagination.currentPage)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Create post
  const handleCreatePost = async () => {
    if (!postContent.trim()) return

    setIsPostingLoading(true)
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: postContent }),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh posts or add new post to the top
        await fetchPosts(1)
        setPostContent("") // Clear textarea
      } else {
        // Handle error
        console.error(data.message)
      }
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsPostingLoading(false)
    }
  }

  // Fetch posts on mount and when component becomes active
  useEffect(() => {
    if (activeTab === 'human') {
      fetchPosts()
    }
  }, [activeTab])

  // Helper function to format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} วันที่แล้ว`
    if (hours > 0) return `${hours} ชั่วโมงที่แล้ว`
    if (minutes > 0) return `${minutes} นาทีที่แล้ว`
    return 'เมื่อสักครู่'
  }

  // Rest of the existing methods from the previous implementation
  const callTyphoonAPI = async (userMessage: string) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_TYPHOON_API_KEY
      const url = "https://api.opentyphoon.ai/v1/chat/completions"
      
      const newHistory = [...conversationHistory, { role: "user", content: userMessage }]
      setConversationHistory(newHistory)

      const systemPrompt = getSystemPrompt();
      
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
    
    setMessages((prev) => [...prev, { 
      text: userInput, 
      sender: "user",
      timestamp: Date.now(),
      id: userMessageId
    }])
    
    const currentInput = userInput
    setUserInput("")
    setIsTyping(true)

    try {
      // Call API
      const aiResponse = await callTyphoonAPI(currentInput)
      
      setIsTyping(false)
      setTimeout(() => {
        setMessages((prev) => [...prev, { 
          text: aiResponse, 
          sender: "ai",
          timestamp: Date.now(),
          id: generateId()
        }])
      }, 100)
      
      // If in dynamic mode, adjust intensity based on response
      if (isDynamicMode) {
        // Logic to adjust intensity based on conversation flow
        // For example, increase intensity if user responses are very good
        // This could be more sophisticated in a real app
        const responseLength = aiResponse.length
        if (responseLength > 300) {
          setIntensity(prev => Math.min(prev + 1, 3))
        } else if (responseLength < 100) {
          setIntensity(prev => Math.max(prev - 1, 1))
        }
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error)
      setIsTyping(false)
      setMessages((prev) => [...prev, { 
        text: "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง", 
        sender: "ai",
        timestamp: Date.now(),
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

  const getSystemPrompt = () => {
    const currentIntensity = intensity;
    const effectiveIntensity = isRandomMode ? Math.floor(Math.random() * 3) + 1 : currentIntensity;
    
    const basePrompt = `คุณเป็นอาจารย์ผู้สัมภาษณ์ระดับมหาวิทยาลัยที่มีประสบการณ์สูง มีหน้าที่คัดเลือกนักศึกษาที่มีศักยภาพที่สุด`;
    
    const intensityPrompts: Record<number, string> = {
      1: `คุณจะสัมภาษณ์ด้วยท่าทีเป็นมิตร ให้คำแนะนำที่สร้างสรรค์ และช่วยให้ผู้สมัครรู้สึกผ่อนคลาย`,
      2: `คุณจะทำการสัมภาษณ์อย่างมืออาชีพ ถามคำถามที่ท้าทาย และวิเคราะห์คำตอบอย่างละเอียด`,
      3: `คุณจะสัมภาษณ์อย่างเข้มข้น กดดันเมื่อเห็นจุดอ่อน และตั้งคำถามที่ยากเพื่อทดสอบการรับมือความกดดัน`
    };
    
    return `${basePrompt}
${intensityPrompts[effectiveIntensity]}
คุณจะให้คำแนะนำที่เป็นประโยชน์หลังจากกล่าวคำอำลากันจะถือว่าจบการสำภาษณ์เพื่อให้ผู้สมัครพัฒนาตัวเองก่อนการสัมภาษณ์จริง`;
  };

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
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  // Tab content
  const tabVariants = {
    initial: { y: 10, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: { y: -10, opacity: 0, transition: { duration: 0.2 } }
  };

  // Message variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  // If user is not authenticated, redirect or show login prompt
  if (!user) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg mb-4">กรุณาเข้าสู่ระบบเพื่อใช้งานฟีเจอร์นี้</p>
            <a href="/login" className="px-4 py-2 bg-primary text-white rounded-md">
              เข้าสู่ระบบ
            </a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <motion.main 
      className="min-h-screen flex flex-col bg-slate-50"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <Navigation />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="md:max-w-5xl mx-auto">
          {/* Gradient Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg"
          >
            <h1 className="text-xl sm:text-2xl font-bold">🎓 ฝึกสัมภาษณ์</h1>
            <p className="mt-2 text-blue-100 text-sm sm:text-base max-w-2xl">
              ฝึกทักษะการสัมภาษณ์เข้าคณะและมหาวิทยาลัยในฝันของคุณ เตรียมพร้อมก่อนการสัมภาษณ์จริง 
              พัฒนาการตอบคำถามและเพิ่มความมั่นใจ
            </p>
          </motion.div>

          {/* Mobile Header with Menu Toggle */}
          <div className="flex justify-between items-center mb-4 md:hidden">
            <h2 className="font-bold text-lg">
              {activeTab === "human" ? "โพสต์กระทู้" : "สัมภาษณ์กับ AI"}
            </h2>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-white shadow-sm"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-md p-4 mb-4 md:hidden"
              >
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => {
                      setActiveTab("human");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg ${
                      activeTab === "human" 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" 
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <BookUser size={18} />
                    <span>โพสต์กระทู้</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("ai");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg ${
                      activeTab === "ai" 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" 
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <Bot size={18} />
                    <span>สัมภาษณ์กับ AI</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Tabs */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="hidden md:flex space-x-4 mb-6"
          >
            <button
              onClick={() => setActiveTab("human")}
              className={`flex items-center space-x-2 px-5 py-3 rounded-lg transition-all ${
                activeTab === "human" 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BookUser size={18} />
              <span>โพสต์กระทู้</span>
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex items-center space-x-2 px-5 py-3 rounded-lg transition-all ${
                activeTab === "ai" 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Bot size={18} />
              <span>สัมภาษณ์กับ AI</span>
            </button>
            
            {activeTab === "ai" && (
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`flex items-center space-x-2 px-3 py-3 rounded-lg ml-auto transition-all
                  ${isSettingsOpen 
                    ? "bg-indigo-100 text-indigo-700" 
                    : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <Settings size={18} />
                <span>ตั้งค่า</span>
              </button>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "human" && (
              <motion.div 
                key="human-tab"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
              >
                <div className="p-5 sm:p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold mb-2">แชร์ประสบการณ์หรือตั้งคำถาม</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    แบ่งปันประสบการณ์การสัมภาษณ์ของคุณหรือถามคำถามกับรุ่นพี่ที่มีประสบการณ์
                  </p>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="แชร์ประสบการณ์หรือถามคำถามเกี่ยวกับการเรียนต่อ..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 min-h-[120px] resize-y text-sm sm:text-base"
                    disabled={isPostingLoading}
                  ></textarea>
                  <div className="flex justify-end mt-3">
                    <motion.button 
                      onClick={handleCreatePost}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-colors shadow-sm disabled:opacity-50"
                      disabled={isPostingLoading || postContent.trim() === ''}
                    >
                      {isPostingLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>กำลังโพสต์...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>โพสต์</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <h3 className="text-lg font-semibold mb-4">โพสต์ล่าสุด</h3>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 size={32} className="animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {posts.map((post) => (
  <motion.div 
    key={post.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow relative"
  >
    {/* Add delete button for user's own posts */}
    {user && user.username === post.user.username && (
      <button
        onClick={() => handleDeletePost(post.id)}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
        title="ลบโพสต์"
      >
        <Trash2 size={16} />
      </button>
    )}

    {/* Rest of the existing post rendering code remains the same */}
    <div className="flex items-center space-x-3 mb-4">
      <div className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-white flex items-center justify-center">
        <Image
          src={post.user.profileImage || "/avatar.png"}
          alt={post.user.username}
          fill
          className="profile-img object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "/avatar.png";
          }}
        />
      </div>
      <div>
        <h3 className="font-medium text-sm sm:text-base">{post.user.username}</h3>
        <span className="text-xs sm:text-sm text-gray-500">
          {formatRelativeTime(new Date(post.createdAt))}
        </span>
      </div>
    </div>
                          <p className="mb-4 text-sm sm:text-base">{post.content}</p>
                          <div className="flex flex-wrap gap-3 sm:gap-4 pt-3 border-t border-gray-100">
                            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 text-xs sm:text-sm transition-colors">
                              <MessageCircle size={14} className="sm:w-4 sm:h-4" />
                              <span>ตอบกลับ</span>
                            </button>
                            <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 text-xs sm:text-sm transition-colors">
                              <Heart size={14} className="sm:w-4 sm:h-4" />
                              <span>ถูกใจ ({post.likes || 0})</span>
                            </button>
                            <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 text-xs sm:text-sm transition-colors">
                              <Share2 size={14} className="sm:w-4 sm:h-4" />
                              <span>แชร์</span>
                            </button>
                          </div>
                        </motion.div>
                      ))}

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex justify-center space-x-2 mt-6">
                          {[...Array(totalPages)].map((_, index) => (
                            <button
                              key={index}
                              onClick={() => fetchPosts(index + 1)}
                              className={`w-3 h-3 rounded-full ${
                                currentPage === index + 1 
                                  ? 'bg-primary' 
                                  : 'bg-gray-300 hover:bg-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "ai" && (
              // Rest of the AI interview tab implementation
              <motion.div 
                key="ai-tab"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
              >
                {/* Settings section */}
                <AnimatePresence>
                  {(isSettingsOpen || (activeTab === "ai" && !isSettingsOpen && window.innerWidth < 768)) && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-indigo-800 flex items-center">
                          <Sliders size={18} className="mr-2" />
                          ตั้งค่าการสัมภาษณ์
                        </h3>
                        {window.innerWidth >= 768 && (
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsSettingsOpen(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X size={18} />
                          </motion.button>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-xs sm:text-sm font-medium text-indigo-800 mb-2">ระดับความเข้มข้น:</label>
                        <div className="flex space-x-2">
                          {[1, 2, 3].map((level) => (
                            <motion.button
                              key={level}
                              onClick={() => setIntensity(level)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-3 py-2 rounded-lg text-xs sm:text-sm flex-1 ${
                                intensity === level 
                                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" 
                                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                              }`}
                            >
                              <div className="flex items-center justify-center">
                                {level === 1 && <span className="mr-1">😊</span>}
                                {level === 2 && <span className="mr-1">🧐</span>}
                                {level === 3 && <span className="mr-1">😰</span>}
                                ระดับ {level}
                              </div>
                              <div className="text-xs mt-1 text-center opacity-80">
                                {level === 1 && "ผู้สัมภาษณ์จะมีท่าทีเป็นมิตร เหมาะสำหรับผู้เริ่มต้นฝึกสัมภาษณ์"}
                                {level === 2 && "ผู้สัมภาษณ์จะถามคำถามที่ท้าทาย คล้ายการสัมภาษณ์จริง"}
                                {level === 3 && "ผู้สัมภาษณ์จะกดดันและตั้งคำถามยาก เหมาะสำหรับการเตรียมตัวสัมภาษณ์คณะที่มีการแข่งขันสูง"}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                        <div className="text-xs text-indigo-800/70 mt-2">
                          {intensity === 1 && "ผู้สัมภาษณ์จะมีท่าทีเป็นมิตร เหมาะสำหรับผู้เริ่มต้นฝึกสัมภาษณ์"}
                          {intensity === 2 && "ผู้สัมภาษณ์จะถามคำถามที่ท้าทาย คล้ายการสัมภาษณ์จริง"}
                          {intensity === 3 && "ผู้สัมภาษณ์จะกดดันและตั้งคำถามยาก เหมาะสำหรับการเตรียมตัวสัมภาษณ์คณะที่มีการแข่งขันสูง"}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                        <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-white/50">
                          <input
                            type="checkbox"
                            checked={isDynamicMode}
                            onChange={(e) => {
                              setIsDynamicMode(e.target.checked)
                              if (e.target.checked) setIsRandomMode(false)
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs sm:text-sm text-indigo-800">โหมดปรับระดับอัตโนมัติ</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-white/50">
                          <input
                            type="checkbox"
                            checked={isRandomMode}
                            onChange={(e) => {
                              setIsRandomMode(e.target.checked)
                              if (e.target.checked) setIsDynamicMode(false)
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs sm:text-sm text-indigo-800">สุ่มระดับความยาก</span>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Chat Area */}
                <div className="h-[450px] sm:h-[500px] overflow-y-auto p-4 sm:p-5 bg-slate-50">
                  {/* Show settings toggle button on mobile */}
                  {activeTab === "ai" && window.innerWidth < 768 && (
                    <div className="mb-4 flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className="flex items-center space-x-1 bg-white text-indigo-600 border border-indigo-200 px-3 py-1 rounded-lg text-xs shadow-sm"
                      >
                        <Settings size={14} />
                        <span>{isSettingsOpen ? "ซ่อนตั้งค่า" : "ตั้งค่า"}</span>
                      </motion.button>
                    </div>
                  )}
                  
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={`message-${message.id}`}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
                        variants={messageVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        custom={message.sender === "user" ? 1 : -1}
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
                  </AnimatePresence>

                  {isTyping && (
                    <motion.div 
                      className="flex justify-start mb-4" 
                      key="typing-indicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
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
                </div>

                {/* Input Area */}
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
                        onClick={() => setUserInput("สวัสดีครับ ผม/ดิฉันชื่อ...")}
                        className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors"
                      >
                        แนะนำตัว
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setUserInput("ผม/ดิฉันเลือกคณะนี้เพราะ...")}
                        className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors"
                      >
                        ทำไมถึงเลือกคณะนี้
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setUserInput("จุดแข็งของผม/ดิฉันคือ...")}
                        className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors"
                      >
                        จุดแข็งของคุณ
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.main>
  )
}