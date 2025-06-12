"use client"

import { Navigation } from "@/components/navigation"
import { BookOpen, Calculator, GraduationCap } from "lucide-react"
import Link from "next/link"

export default function Guide() {
  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <div className="bg-primary/10 py-4 text-center font-medium">คู่มือการสอบ</div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TGAT Card */}
          <div className="rounded-lg shadow-md overflow-hidden bg-white">
            <div className="h-32 bg-blue-500 flex items-center justify-center">
              <BookOpen className="text-white h-12 w-12" />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-3">TGAT</h2>
              <p className="text-gray-600 mb-4">เนื้อหาการสอบ TGAT (Thai General Aptitude Test) รวมถึงบทที่ต้องเก็บ</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                <li>TGAT1: การสื่อสารภาษาอังกฤษ</li>
                <li>TGAT2: การคิดอย่างมีเหตุผล</li>
                <li>TGAT3: สมรรถนะการทำงาน</li>
              </ul>
              <button className="w-full py-2 mt-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                ดูรายละเอียด
              </button>
            </div>
          </div>

          {/* TPAT Card */}
          <div className="rounded-lg shadow-md overflow-hidden bg-white">
            <div className="h-32 bg-purple-500 flex items-center justify-center">
              <Calculator className="text-white h-12 w-12" />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-3">TPAT</h2>
              <p className="text-gray-600 mb-4">เนื้อหาการสอบ TPAT (Thai Professional Aptitude Test) แยกตามวิชาชีพ</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                <li>TPAT1: ความถนัดทางคณิตศาสตร์</li>
                <li>TPAT2: ความถนัดทางวิทยาศาสตร์</li>
                <li>TPAT3-5: ความถนัดเฉพาะสาขา</li>
              </ul>
              <button className="w-full py-2 mt-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors">
                ดูรายละเอียด
              </button>
            </div>
          </div>

          {/* A-LEVEL Card */}
          <div className="rounded-lg shadow-md overflow-hidden bg-white">
            <div className="h-32 bg-green-500 flex items-center justify-center">
              <GraduationCap className="text-white h-12 w-12" />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-3">A-LEVEL</h2>
              <p className="text-gray-600 mb-4">เนื้อหาการสอบ A-Level แยกตามรายวิชาที่ต้องเตรียมตัว</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                <li>คณิตศาสตร์ประยุกต์</li>
                <li>วิทยาศาสตร์ประยุกต์</li>
                <li>ภาษาอังกฤษ</li>
                <li>ความถนัดเฉพาะวิชา</li>
              </ul>
              <button className="w-full py-2 mt-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
                ดูรายละเอียด
              </button>
            </div>
          </div>

          {/* A-LEVEL Calculator Card */}
          <div className="rounded-lg shadow-md overflow-hidden bg-white">
            <div className="h-32 bg-orange-500 flex items-center justify-center">
              <Calculator className="text-white h-12 w-12" />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-3">โปรแกรมคำนวน A-LEVEL</h2>
              <p className="text-gray-600 mb-4">เครื่องมือช่วยคำนวณคะแนนและประเมินโอกาสในการสอบ A-Level</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                <li>คำนวณคะแนนรวม</li>
                <li>ประเมินโอกาสติดคณะที่ต้องการ</li>
                <li>เปรียบเทียบกับคะแนนปีที่ผ่านมา</li>
                <li>แนะนำการเตรียมตัวตามคะแนน</li>
              </ul>
                <Link 
                href="/guide/calculator" 
                className="w-full py-2 mt-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors inline-block text-center"
                >
                ใช้งานโปรแกรม
                </Link>
            </div>
          </div>
        </div>

        {/* Exam Schedule */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">ตารางสอบ</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    การสอบ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    วันที่
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    เวลา
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ลงทะเบียน
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">TGAT</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">10-12 ธันวาคม 2566</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">09:00 - 12:00 น.</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      เปิดรับสมัคร
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">TPAT</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">17-18 ธันวาคม 2566</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">09:00 - 12:00 น.</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      เปิดรับสมัคร
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">A-Level</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">22-25 ธันวาคม 2566</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">13:00 - 16:00 น.</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      กำลังเปิดรับสมัคร
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">หมายเหตุ:</span> ตารางการสอบอาจมีการเปลี่ยนแปลง
              โปรดติดตามประกาศอย่างเป็นทางการจาก ทปอ. และเว็บไซต์ mytcas.com
            </p>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">แหล่งเรียนรู้เพิ่มเติม</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <h3 className="font-medium">เตรียมสอบ TGAT/TPAT</h3>
              <p className="text-gray-600 text-sm mt-1">แนวข้อสอบ คลังโจทย์ และคอร์สเรียนออนไลน์</p>
            </div>
            <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <h3 className="font-medium">คลังข้อสอบ A-Level</h3>
              <p className="text-gray-600 text-sm mt-1">ข้อสอบเก่าย้อนหลัง พร้อมเฉลยละเอียด</p>
            </div>
            <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <h3 className="font-medium">วิดีโอติวสอบ</h3>
              <p className="text-gray-600 text-sm mt-1">บทเรียนออนไลน์จากติวเตอร์ชั้นนำ</p>
            </div>
            <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <h3 className="font-medium">เคล็ดลับการจัดการเวลา</h3>
              <p className="text-gray-600 text-sm mt-1">เทคนิคการอ่านหนังสือและเตรียมตัวสอบ</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

