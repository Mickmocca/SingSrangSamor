"use client"

import type React from "react"
import { useRef } from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/hooks/use-auth"
import { motion, AnimatePresence } from "framer-motion"
import { getUniversityOptions, getFacultyOptions } from "@/utils/tcas"
import { School } from "lucide-react"

interface UniversityOption {
  id: string;
  name_th: string;
  name_en: string;
  campus_th: string;
  campus_en: string;
}

interface FacultyOption {
  id: string;
  name_th: string;
  name_en: string;
}

export default function Signup() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { register } = useAuth()

  // Form data
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    education_year: "",
    study_program: "",
    university: "",
    faculty: "",
    gpa: "",
    admission_rounds: [] as string[],
  })

  const [universityTags, setUniversityTags] = useState<string[]>([])
  const [facultyTags, setFacultyTags] = useState<string[]>([])
  const [universityInput, setUniversityInput] = useState("")
  const [facultyInput, setFacultyInput] = useState("")
  const [universityOptions, setUniversityOptions] = useState<UniversityOption[]>([])
  const [showUniversityOptions, setShowUniversityOptions] = useState(false)
  const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([])
  const [showFacultyOptions, setShowFacultyOptions] = useState(false)
  const universityInputRef = useRef<HTMLDivElement>(null)
  const facultyInputRef = useRef<HTMLDivElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target

    if (name === "admission-round") {
      setFormData((prev) => {
        if (checked) {
          return { ...prev, admission_rounds: [...prev.admission_rounds, value] }
        } else {
          return { ...prev, admission_rounds: prev.admission_rounds.filter((item) => item !== value) }
        }
      })
    } else {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    }
  }

  const handleUniversityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUniversityInput(value);
    const options = getUniversityOptions(value);
    setUniversityOptions(options);
    setShowUniversityOptions(true);
  };

  const handleSelectUniversity = (option: UniversityOption) => {
    const tag = `${option.name_th} (${option.campus_th})`;
    if (!universityTags.includes(tag)) {
      setUniversityTags(prev => [...prev, tag]);
      setFormData(prev => ({ ...prev, university: [...universityTags, tag].join(", ") }));
      // Update faculty options when university is selected
      const faculties = getFacultyOptions(option.name_th, option.campus_th);
      setFacultyOptions(faculties);
    }
    setUniversityInput('');
    setShowUniversityOptions(false);
  };

  const handleFacultyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFacultyInput(value);
    setShowFacultyOptions(true);
  };

  const handleSelectFaculty = (option: FacultyOption) => {
    const tag = option.name_th;
    if (!facultyTags.includes(tag)) {
      setFacultyTags(prev => [...prev, tag]);
      setFormData(prev => ({ ...prev, faculty: [...facultyTags, tag].join(", ") }));
    }
    setFacultyInput('');
    setShowFacultyOptions(false);
  };

  const removeUniversityTag = (tagToRemove: string) => {
    setUniversityTags(prev => {
      const newTags = prev.filter(tag => tag !== tagToRemove);
      setFormData(prev => ({ ...prev, university: newTags.join(", ") }));
      return newTags;
    });
  };

  const removeFacultyTag = (tagToRemove: string) => {
    setFacultyTags(prev => {
      const newTags = prev.filter(tag => tag !== tagToRemove);
      setFormData(prev => ({ ...prev, faculty: newTags.join(", ") }));
      return newTags;
    });
  };

  const validateStep1 = () => {
    if (!formData.username) {
      setError("กรุณากรอกชื่อผู้ใช้")
      return false
    }

    if (formData.password.length < 8) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน")
      return false
    }

    return true
  }

  const validateStep2 = () => {
    if (!formData.education_year) {
      setError("กรุณาเลือกชั้นปีการศึกษา")
      return false
    }

    if (!formData.study_program) {
      setError("กรุณาเลือกสายการเรียน")
      return false
    }

    return true
  }

  const nextStep = () => {
    setError("")

    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await register({
        username: formData.username,
        password: formData.password,
        education_year: formData.education_year,
        study_program: formData.study_program,
        university: formData.university,
        faculty: formData.faculty,
        gpa: formData.gpa,
        admission_rounds: formData.admission_rounds,
      })

      if (result.success) {
        router.push("/")
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("เกิดข้อผิดพลาดในการลงทะเบียน")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex mb-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex-1">
                <div className={`h-2 rounded-full mx-2 ${step >= item ? "bg-primary" : "bg-gray-200"}`}></div>
                <div
                  className={`text-center mt-2 text-sm ${step >= item ? "text-primary font-medium" : "text-gray-500"}`}
                >
                  {item === 1 ? "ข้อมูลบัญชี" : item === 2 ? "ข้อมูลการศึกษา" : "ข้อมูลเพิ่มเติม"}
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">สร้างบัญชีผู้ใช้</h2>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium">
                      ชื่อผู้ใช้ *
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="ตั้งชื่อผู้ใช้ของคุณ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">ใช้ตัวอักษรภาษาอังกฤษและตัวเลข 6-20 ตัว</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium">
                      รหัสผ่าน *
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="ตั้งรหัสผ่าน"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-gray-500">ใช้ตัวอักษรผสมตัวเลขอย่างน้อย 8 ตัว</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium">
                      ยืนยันรหัสผ่าน *
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
                      disabled={isLoading}
                    >
                      ถัดไป
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label htmlFor="education_year" className="block text-sm font-medium">
                      ชั้นปีการศึกษา *
                    </label>
                    <select
                      id="education_year"
                      name="education_year"
                      value={formData.education_year}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      required
                      disabled={isLoading}
                    >
                      <option value="">เลือกชั้นปี</option>
                      <option value="m4">มัธยมศึกษาปีที่ 4</option>
                      <option value="m5">มัธยมศึกษาปีที่ 5</option>
                      <option value="m6">มัธยมศึกษาปีที่ 6</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">สายการเรียน *</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="study_program"
                          value="science"
                          checked={formData.study_program === "science"}
                          onChange={handleChange}
                          className="mr-2"
                          required
                          disabled={isLoading}
                        />
                        <span>วิทย์-คณิต</span>
                      </label>
                      <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="study_program"
                          value="arts-math"
                          checked={formData.study_program === "arts-math"}
                          onChange={handleChange}
                          className="mr-2"
                          disabled={isLoading}
                        />
                        <span>ศิลป์-คำนวณ</span>
                      </label>
                      <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="study_program"
                          value="arts-lang"
                          checked={formData.study_program === "arts-lang"}
                          onChange={handleChange}
                          className="mr-2"
                          disabled={isLoading}
                        />
                        <span>ศิลป์-ภาษา</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-70"
                      disabled={isLoading}
                    >
                      ย้อนกลับ
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
                      disabled={isLoading}
                    >
                      ถัดไป
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">มหาวิทยาลัยที่สนใจ</label>
                    <div className="border border-gray-300 rounded-lg p-3">
                      <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
                        {universityTags.map((tag, index) => (
                          <div
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center text-sm"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeUniversityTag(tag)}
                              className="ml-2 text-blue-500 hover:text-blue-700"
                              disabled={isLoading}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="relative" ref={universityInputRef}>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <School size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={universityInput}
                          onChange={handleUniversityInputChange}
                          placeholder="พิมพ์ชื่อมหาวิทยาลัย"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          disabled={isLoading}
                        />
                        {showUniversityOptions && universityOptions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {universityOptions.map((option) => (
                              <button
                                key={option.id}
                                onClick={() => handleSelectUniversity(option)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex flex-col"
                              >
                                <span className="font-medium">{option.name_th}</span>
                                <span className="text-sm text-gray-500">{option.campus_th}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">คณะที่สนใจ</label>
                    <div className="border border-gray-300 rounded-lg p-3">
                      <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
                        {facultyTags.map((tag, index) => (
                          <div
                            key={index}
                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center text-sm"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeFacultyTag(tag)}
                              className="ml-2 text-green-500 hover:text-green-700"
                              disabled={isLoading}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="relative" ref={facultyInputRef}>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={facultyInput}
                          onChange={handleFacultyInputChange}
                          placeholder="พิมพ์ชื่อคณะ"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          disabled={isLoading || universityTags.length === 0}
                        />
                        {showFacultyOptions && facultyOptions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {facultyOptions
                              .filter(option => 
                                option.name_th.toLowerCase().includes(facultyInput.toLowerCase()) ||
                                option.name_en.toLowerCase().includes(facultyInput.toLowerCase())
                              )
                              .map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => handleSelectFaculty(option)}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex flex-col"
                                >
                                  <span className="font-medium">{option.name_th}</span>
                                  <span className="text-sm text-gray-500">{option.name_en}</span>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="gpa" className="block text-sm font-medium">
                      เกรดเฉลี่ย
                    </label>
                    <input
                      id="gpa"
                      name="gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData.gpa}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">รอบที่สนใจ</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <label className="flex items-center p-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          name="admission-round"
                          value="1"
                          checked={formData.admission_rounds.includes("1")}
                          onChange={handleCheckboxChange}
                          className="mr-2"
                          disabled={isLoading}
                        />
                        <span>รอบที่ 1 Portfolio</span>
                      </label>
                      <label className="flex items-center p-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          name="admission-round"
                          value="2"
                          checked={formData.admission_rounds.includes("2")}
                          onChange={handleCheckboxChange}
                          className="mr-2"
                          disabled={isLoading}
                        />
                        <span>รอบที่ 2 Quota</span>
                      </label>
                      <label className="flex items-center p-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          name="admission-round"
                          value="3"
                          checked={formData.admission_rounds.includes("3")}
                          onChange={handleCheckboxChange}
                          className="mr-2"
                          disabled={isLoading}
                        />
                        <span>รอบที่ 3 Admission</span>
                      </label>
                      <label className="flex items-center p-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          name="admission-round"
                          value="4"
                          checked={formData.admission_rounds.includes("4")}
                          onChange={handleCheckboxChange}
                          className="mr-2"
                          disabled={isLoading}
                        />
                        <span>รอบที่ 4 Direct Admission</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-70"
                      disabled={isLoading}
                    >
                      ย้อนกลับ
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70"
                      disabled={isLoading}
                    >
                      {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="text-center mt-6 text-sm">
            <span>มีบัญชีอยู่แล้ว? </span>
            <Link href="/login" className="text-primary hover:underline">
              เข้าสู่ระบบ
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

