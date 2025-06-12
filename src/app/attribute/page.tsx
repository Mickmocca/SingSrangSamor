"use client"

import { useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function Attribute() {
  const router = useRouter()
  const { user, loading } = useAuth()
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

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
        คุณสมบัติ ของคณะที่เราเลือกไว้ - ตัวอย่างต่างๆ และ ทุนต่างๆ
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-6"
        >
          คณะ (สาขา)
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <motion.div 
              key={item}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
                  <span className="text-2xl text-white">📚</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">สาขา</h3>
                <p className="text-gray-600 text-sm">
                  คุณสมบัติที่จำเป็นสำหรับการเข้าศึกษาในสาขานี้ รวมถึงข้อกำหนดและเกณฑ์ในการสมัครเข้าศึกษาต่อ
                </p>
                <div className="mt-4 text-right">
                  <button className="text-primary font-medium text-sm hover:underline">
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-10">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-6"
          >
            ทุนการศึกษา
          </motion.h2>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                ทุนการศึกษาจากมหาวิทยาลัยและหน่วยงานภายนอกที่เกี่ยวข้องกับคณะและสาขาที่คุณสนใจ
              </p>
              
              <div className="space-y-4">
                {[
                  { name: "ทุนเรียนดี", description: "สำหรับนักเรียนที่มีผลการเรียนดีเยี่ยม" },
                  { name: "ทุนขาดแคลนทุนทรัพย์", description: "สำหรับนักเรียนที่มีความจำเป็นทางการเงิน" },
                  { name: "ทุนความสามารถพิเศษ", description: "สำหรับนักเรียนที่มีความสามารถโดดเด่นด้านต่างๆ" }
                ].map((scholarship, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (index * 0.1) }}
                    className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-lg">{scholarship.name}</h3>
                    <p className="text-gray-600 mt-1">{scholarship.description}</p>
                    <div className="mt-2 text-right">
                      <button className="text-primary font-medium text-sm hover:underline">
                        อ่านเพิ่มเติม
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}