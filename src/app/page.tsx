"use client"

import { useState, useEffect, useRef } from "react"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const autoSlideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const AUTO_SLIDE_INTERVAL = 5000
  const MANUAL_INTERACTION_DELAY = 7000 // Longer delay after manual interaction
  
  // Featured news/content data
  const featuredContent = [
    {
      title: "นโยบายของพวกเรามาแล้วว มาดูได้ที่นี่เลย!!",
      description: "พี่ๆน้องๆชาวสิงห์สมุทร สามารธมาอ่าน นโยบายพวกเราได้เลยครับ บอกเลยมีแต่ความสร้างสรรค์ และ แปลกใหม่ แน่นอนว่าใช้ได้จริงด้วย!",
      image: "DJI_0315_egsseg.jpg",
      link: "/policy"
    },
    {
      title: "Coming soon kub",
      description: "ตากล้องกำลัง ขี้เกียจตัด",
      image: "/Gallery.jpg",
      link: ""
    },
    // {
    //   title: "แนวข้อสอบ TGAT/TPAT ปี 2567 มีอะไรเปลี่ยนแปลง",
    //   description: "เจาะลึกโครงสร้างข้อสอบและเนื้อหาที่ควรเตรียมตัวสำหรับการสอบเข้ามหาวิทยาลัย",
    //   image: "https://www.camphub.in.th/wp-content/uploads/2025/02/FE_CampHub.jpg",
    //   link: "/educate"
    // }
  ]

  // Auto-advance slider
 // Start or restart auto slide timer
 const startAutoSlideTimer = (delay = AUTO_SLIDE_INTERVAL) => {
  if (autoSlideTimeoutRef.current) {
    clearTimeout(autoSlideTimeoutRef.current)
  }
  
  autoSlideTimeoutRef.current = setTimeout(() => {
    setCurrentSlide((prevSlide) => 
      prevSlide === featuredContent.length - 1 ? 0 : prevSlide + 1
    )
    // Continue with regular interval after first advance
    startAutoSlideTimer(AUTO_SLIDE_INTERVAL)
  }, delay)
}

// Initialize auto slide on component mount
useEffect(() => {
    startAutoSlideTimer()
    
    // Clean up on unmount
    return () => {
      if (autoSlideTimeoutRef.current) {
        clearTimeout(autoSlideTimeoutRef.current)
      }
    }
  }, [featuredContent.length, startAutoSlideTimer])

// Handle manual navigation
const nextSlide = () => {
  setCurrentSlide((prevSlide) => 
    prevSlide === featuredContent.length - 1 ? 0 : prevSlide + 1
  )
  // Reset timer with longer delay after manual interaction
  startAutoSlideTimer(MANUAL_INTERACTION_DELAY)
}

const prevSlide = () => {
  setCurrentSlide((prevSlide) => 
    prevSlide === 0 ? featuredContent.length - 1 : prevSlide - 1
  )
  // Reset timer with longer delay after manual interaction
  startAutoSlideTimer(MANUAL_INTERACTION_DELAY)
}

// // Handle indicator click
// const goToSlide = (index: number) => {
//   setCurrentSlide(index)
//   // Reset timer with longer delay after manual interaction
//   startAutoSlideTimer(MANUAL_INTERACTION_DELAY)
// }


  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      {/* News Banner */}
      <div className="bg-primary/10 py-3 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <span className="font-bold text-primary mr-4 flex-shrink-0">Announcements:</span>
            <div className="overflow-hidden relative w-full">
              <div className="whitespace-nowrap animate-marquee inline-block">
                <span className="inline-block mx-4">วันนี้เป็นวันแรกทีพวกเรามาหาเสียง เบอร์ 1</span>
                <span className="inline-block mx-4">พวกเรามีนโยบายพรรคให้ทุกคนอ่านน้ากด policy ได้เลย</span>
                <span className="inline-block mx-4">อยากรู้รึป่าวว ใครคือ spiderman เมื่อปีที่แล้ว</span>
                <span className="inline-block mx-4">เลือกพวกเราได้ในวันเลือกตั้งที่ 24 มิ.ย ที่จะถึงเลยยย<div className=""></div></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-xl shadow-lg">
            {/* Carousel */}
            <div className="relative h-[300px] md:h-[400px] lg:h-[500px] w-full">
              {featuredContent.map((content, index) => (
                <motion.div 
                  key={index}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${content.image})` }}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: currentSlide === index ? 1 : 0,
                    zIndex: currentSlide === index ? 10 : 0
                  }}
                  transition={{ duration: 0.5 }}
                >

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
                    <div className="max-w-3xl">
                      <motion.h2 
                        className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: currentSlide === index ? 1 : 0,
                          y: currentSlide === index ? 0 : 20
                        }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        {content.title}
                      </motion.h2>
                      <motion.p 
                        className="text-white/80 mb-4 max-w-2xl hidden md:block"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: currentSlide === index ? 1 : 0,
                          y: currentSlide === index ? 0 : 20
                        }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        {content.description}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: currentSlide === index ? 1 : 0,
                          y: currentSlide === index ? 0 : 20
                        }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <Link
                          href={content.link}
                          className="inline-flex items-center px-5 py-2.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                        >
                          อ่านเพิ่มเติม
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Carousel Controls */}
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white rounded-full p-2 backdrop-blur-sm transition-all"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white rounded-full p-2 backdrop-blur-sm transition-all"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center space-x-2">
                {featuredContent.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2.5 h-2.5 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-white/50'}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">About us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center p-6">
                <img src="/anchor.svg" alt="Anchor Icon" className="h-16 w-16" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2 text-center">Sing</h3>
                <p className="text-gray-600 mb-4 text-center">สิงห์ มาจากตัวแทนของพวกเราทุกคนจากโรงเรียนสิงห์สมุทร</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
            >
               <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center p-6">
                <img src="/anchor.svg" alt="Anchor Icon" className="h-16 w-16" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2 text-center">Srang</h3>
                <p className="text-gray-600 mb-4 text-center">สร้าง นั้นสื่อถึงความตั้งใจที่จะช่วยกันสร้างสิ่งดี ๆ ให้กับโรงเรียนของเรา</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center p-6">
                <img src="/anchor.svg" alt="Anchor Icon" className="h-16 w-16" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2 text-center">Samor</h3>
                <p className="text-gray-600 mb-4 text-center">สมอ นั้นเปรียบเหมือนพวกเราทุกคน ทั้งพี่ทั้งน้อง ที่เป็นกำลังใจและแรงสนับสนุนให้กันและกันเหมือนสมอที่ยึดให้เรายืนหยัดมั่นคงไปด้วยกัน</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Latest News & Updates */}
      <section className="py-8 md:py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">ข่าวสารล่าสุด</h2>
            <Link href="#" className="text-primary font-medium hover:underline">ดูทั้งหมด</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1].map((item) => (
              <motion.div 
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: item * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="relative h-48">
                  <Image 
                    src="https://jobbkk.com/upload/variety/goverment/20181211_5312.png" 
                    alt="News image" 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-5">
                  <div className="text-xs font-medium text-gray-500 mb-2">13 มิถุนายน 2568</div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">การหาเสียงครั้งแรกของพรรคเรา</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    วันนี้เป็นวันแรกทีพวกเรามาหาเสียงนะทุกคน อย่าลืมมาตั้งใจฟังพวกเราและพวกเราจะไปหาเสียงตามตึกต่างๆด้วยนา เจอกันที่ โดม 61 ตอนเช้า
                  </p>
                  <Link href="#" className="text-primary font-medium hover:underline">อ่านต่อ</Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} SSS - SingSrangSamor แพลตฟอร์มพรรคสิงห์สร้างสมอ | ข้อมูลทั้งหมดมีวัตถุประสงค์เพื่อประกาศให้ชาวสิงห์สมุทรได้รับรู้ข่าวสาร By Kittirat Witchuprasittikorn
          </div>
        </div>
      </footer>
    </main>
  )
}