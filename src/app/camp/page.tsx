"use client"

import { Navigation } from "@/components/navigation"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import React, { useRef, useCallback } from 'react';
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function Camp() {
  const { user, loading } = useAuth()
  
  // Use an array of refs directly
  const scrollContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Mock camp data for universities
  const universities = [
    {
      name: "CU",
      fullName: "จุฬาลงกรณ์มหาวิทยาลัย",
      camps: [
        {
          title: "CEDT INNOVATION SUMMIT 2025 HACKATHON",
          dates: "10-15 มิถุนายน 2566",
          description: "ค่ายเรียนรู้วิทยาศาสตร์และเทคโนโลยีสำหรับนักเรียนระดับมัธยมศึกษาตอนปลาย",
          image: "https://www.camphub.in.th/wp-content/uploads/2025/02/posters-750x394.jpg",
          link: "https://www.camphub.in.th/camp/satit-camp-2566/"
        },
        {
          title: "Medical Engineering Camp",
          dates: "1-5 กรกฎาคม 2566",
          description: "ค่ายวิศวกรรมการแพทย์สำหรับนักเรียนสายวิทย์-คณิต",
          image: "https://www.camphub.in.th/wp-content/uploads/2025/02/FE_CampHub.jpg",
          link: "https://www.camphub.in.th/camp/medical-engineering-2566/"
        },
        {
          title: "Business Leader Camp",
          dates: "15-20 กรกฎาคม 2566",
          description: "ค่ายฝึกทักษะผู้นำทางธุรกิจและการบริหารจัดการสำหรับนักเรียนมัธยมปลาย",
          image: "https://www.camphub.in.th/wp-content/uploads/2025/02/FE_CampHub.jpg",
          link: "https://www.camphub.in.th/camp/business-leader-2566/"
        },
        {
          title: "Digital Technology Camp",
          dates: "22-26 กรกฎาคม 2566",
          description: "ค่ายเทคโนโลยีดิจิทัลสำหรับนักเรียนที่สนใจด้านคอมพิวเตอร์และเทคโนโลยี",
          image: "https://www.camphub.in.th/wp-content/uploads/2025/02/FE_CampHub.jpg",
          link: "https://www.camphub.in.th/camp/digital-tech-2566/"
        },
        {
          title: "Science Innovation Camp",
          dates: "5-9 สิงหาคม 2566",
          description: "ค่ายนวัตกรรมวิทยาศาสตร์สำหรับนักเรียนที่สนใจการทำโครงงานวิทยาศาสตร์",
          image: "https://www.camphub.in.th/wp-content/uploads/2025/02/FE_CampHub.jpg",
          link: "https://www.camphub.in.th/camp/science-innovation-2566/"
        }
      ]
    },
    {
      name: "KMITL",
      fullName: "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง",
      camps: [
        {
          title: "IT Gen Next",
          dates: "20-23 มิถุนายน 2566",
          description: "ค่ายเทคโนโลยีสารสนเทศสำหรับนักเรียนที่สนใจด้านคอมพิวเตอร์และเทคโนโลยี",
          image: "https://www.camphub.in.th/wp-content/uploads/2025/02/FE_CampHub.jpg",
          link: "https://www.camphub.in.th/camp/it-gen-next-2566/"
        },
        {
          title: "KMITL Engineering Camp",
          dates: "25-30 มิถุนายน 2566",
          description: "ค่ายวิศวกรรมศาสตร์สำหรับนักเรียนที่สนใจเรียนต่อด้านวิศวกรรม",
          image: "https://www.camphub.in.th/wp-content/uploads/2025/02/FE_CampHub.jpg",
          link: "https://www.camphub.in.th/camp/kmitl-engineering-2566/"
        },
        {
          title: "Creative Design Camp",
          dates: "5-10 สิงหาคม 2566",
          description: "ค่ายออกแบบสร้างสรรค์สำหรับนักเรียนที่สนใจด้านการออกแบบและสถาปัตยกรรม",
          image: "https://www.camphub.in.th/wp-content/uploads/2025/02/FE_CampHub.jpg",
          link: "https://www.camphub.in.th/camp/creative-design-2566/"
        },
        {
          title: "Data Science Bootcamp",
          dates: "12-16 สิงหาคม 2566",
          description: "ค่ายวิทยาศาสตร์ข้อมูลสำหรับนักเรียนที่สนใจด้านการวิเคราะห์ข้อมูล",
          image: "https://www.camphub.in.th/wp-content/uploads/2025/02/FE_CampHub.jpg",
          link: "https://www.camphub.in.th/camp/data-science-2566/"
        }
      ]
    }
  ]

  // Scroll functions
  const scrollLeft = useCallback((index: number) => {
    const container = scrollContainerRefs.current[index];
    if (container) {
      // Get the first child element (camp card) to calculate scroll width
      const firstChild = container.firstElementChild as HTMLElement;
      if (firstChild) {
        // Scroll by the width of the first card plus any gap
        const scrollAmount = firstChild.offsetWidth + 24; // 24 is the gap (assuming gap-6 is 6 * 4 = 24px)
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  }, []);
  
  const scrollRight = useCallback((index: number) => {
    const container = scrollContainerRefs.current[index];
    if (container) {
      // Get the first child element (camp card) to calculate scroll width
      const firstChild = container.firstElementChild as HTMLElement;
      if (firstChild) {
        // Scroll by the width of the first card plus any gap
        const scrollAmount = firstChild.offsetWidth + 24; // 24 is the gap (assuming gap-6 is 6 * 4 = 24px)
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }, []);

  // Check if scroll buttons should be shown
  const shouldShowScrollButtons = (campsLength: number) => {
    return campsLength > 3;
  };

  // If still loading or no user, show minimal content
  if (loading || !user) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">กำลังโหลด...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      
      <div className="bg-primary/10 py-4 text-center font-medium">
        ค่าย (สายที่เลือก) เรียงจาก ค่ายใหญ่ๆ ไป ค่ายเล็กๆ โดยขึ้น มหาลัยที่ เจ้าตัวเลือก บนสุด
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {universities.map((university, index) => (
          <motion.section 
            key={university.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-bold">{university.name}</h2>
              <span className="ml-3 text-gray-500 text-sm">{university.fullName}</span>
            </div>
            
            <div className="relative">
              {/* Scroll buttons - only show when camps > 3 */}
              {shouldShowScrollButtons(university.camps.length) && (
                <>
                  <button 
                    onClick={() => scrollLeft(index)}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-4 z-10 p-2 rounded-full bg-white/80 shadow-md hover:bg-white transition-colors"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={24} className="text-gray-700" />
                  </button>
                  <button 
                    onClick={() => scrollRight(index)}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-4 z-10 p-2 rounded-full bg-white/80 shadow-md hover:bg-white transition-colors"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={24} className="text-gray-700" />
                  </button>
                </>
              )}
              
              {/* Scrollable container */}
              <div 
                ref={el => {
                  scrollContainerRefs.current[index] = el;
                }}
                className={`flex gap-6 ${shouldShowScrollButtons(university.camps.length) ? 'overflow-x-auto pb-4 scroll-smooth hide-scrollbar' : 'grid grid-cols-1 md:grid-cols-3'}`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {university.camps.map((camp, campIndex) => (
                  <motion.div 
                    key={campIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (index * 0.2) + (campIndex * 0.1) }}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer flex-shrink-0"
                    whileHover={{ y: -5 }}
                    onClick={() => window.open(camp.link, '_blank')}
                    style={{ width: shouldShowScrollButtons(university.camps.length) ? 'calc(33.333% - 16px)' : 'auto', minWidth: shouldShowScrollButtons(university.camps.length) ? '300px' : 'auto' }}
                  >
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={camp.image}
                        alt={camp.title}
                        fill
                        className="object-cover"
                        unoptimized // Using unoptimized for external images
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "/placeholder.svg?height=200&width=300";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <h3 className="text-white font-bold p-4">{camp.title}</h3>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium mb-2">
                        {camp.dates}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{camp.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">รับสมัคร: เร็วๆ นี้</span>
                        <a 
                          href="https://www.camphub.in.th" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-sm rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                          onClick={(e) => e.stopPropagation()} // Prevent the parent onClick from firing
                        >
                          ดูรายละเอียด
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        ))}
        
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-6 bg-white rounded-lg shadow-md"
        >
          <h3 className="text-xl font-bold mb-4">ไม่พบค่ายที่คุณสนใจ?</h3>
          <p className="text-gray-600 mb-4">
            ลองค้นหาค่ายเพิ่มเติมหรือตั้งการแจ้งเตือนเมื่อมีค่ายใหม่ที่ตรงกับความสนใจของคุณ
          </p>
          <div className="flex flex-wrap gap-3">
            <input 
              type="text" 
              placeholder="ชื่อมหาวิทยาลัยหรือคณะที่สนใจ" 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
            <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
              ค้นหาค่าย
            </button>
          </div>
        </motion.section>
      </div>
    </main>
  )
}