"use client"

import { useState, useEffect, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, Loader2, Save, Check, School, User, GraduationCap, BookOpen } from "lucide-react"
import { getUniversityOptions, getFacultyOptions } from "@/utils/tcas";

interface FacultyOption {
  id: string;
  name_th: string;
  name_en: string;
}

interface UniversityOption {
  id: string;
  name_th: string;
  name_en: string;
  campus_th: string;
  campus_en: string;
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState("info")
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    education_year: "",
    gpa: "",
    study_program: "",
    university: "",
    faculty: "",
    admission_rounds: [] as string[],
    profileImage: "/placeholder.svg?height=200&width=200",
  })

  // Universities and faculties tags
  const [universityTags, setUniversityTags] = useState<string[]>([])
  const [facultyTags, setFacultyTags] = useState<string[]>([])
  const [universityInput, setUniversityInput] = useState("")
  const [facultyInput, setFacultyInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [isSaveSuccess, setSaveSuccess] = useState(false)
  const { updateProfile } = useAuth()
  const [universityOptions, setUniversityOptions] = useState<UniversityOption[]>([]);
  const [showUniversityOptions, setShowUniversityOptions] = useState(false);
  const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([]);
  const [showFacultyOptions, setShowFacultyOptions] = useState(false);
  const universityInputRef = useRef<HTMLDivElement>(null);
  const facultyInputRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile")
        const data = await res.json()

        if (data.success) {
          setUserData({
            username: data.user.username,
            email: data.user.email || "",
            education_year: data.user.education_year || "",
            gpa: data.user.gpa || "",
            study_program: data.user.study_program || "",
            university: data.user.university || "",
            faculty: data.user.faculty || "",
            admission_rounds: data.user.admission_rounds || [],
            profileImage: data.user.profileImage || "/placeholder.svg?height=200&width=200",
          })

          // Set tags if they exist
          if (data.user.university) {
            setUniversityTags(data.user.university.split(",").map((tag: string) => tag.trim()))
          }

          if (data.user.faculty) {
            setFacultyTags(data.user.faculty.split(",").map((tag: string) => tag.trim()))
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }

    fetchProfile()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (universityInputRef.current && !universityInputRef.current.contains(event.target as Node)) {
        setShowUniversityOptions(false);
      }
      if (facultyInputRef.current && !facultyInputRef.current.contains(event.target as Node)) {
        setShowFacultyOptions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target

    if (name === "admission-round") {
      setUserData((prev) => {
        if (checked) {
          return { ...prev, admission_rounds: [...prev.admission_rounds, value] }
        } else {
          return { ...prev, admission_rounds: prev.admission_rounds.filter((item) => item !== value) }
        }
      })
    }
  }

  const handleUniversityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && universityInput.trim()) {
      e.preventDefault()
      setUniversityTags((prev) => [...prev, universityInput.trim()])
      setUniversityInput("")
    }
  }

  const handleFacultyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && facultyInput.trim()) {
      e.preventDefault()
      setFacultyTags((prev) => [...prev, facultyInput.trim()])
      setFacultyInput("")
    }
  }

  const removeUniversityTag = (tagToRemove: string) => {
    setUniversityTags((prev) => prev.filter((tag) => tag !== tagToRemove))
  }

  const removeFacultyTag = (tagToRemove: string) => {
    setFacultyTags((prev) => prev.filter((tag) => tag !== tagToRemove))
  }

  const saveProfile = async () => {
    setIsLoading(true)
    setSaveSuccess(false)
    setMessage({ text: "", type: "" })

    try {
      // If there's a selected image, upload it first
      let profileImageUrl = userData.profileImage

      if (selectedImage) {
        // Create a FormData object to send the file
        const formData = new FormData()
        formData.append('file', selectedImage)

        // Send the file to your API endpoint
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image")
        }

        const uploadResult = await uploadResponse.json()

        if (uploadResult.success) {
          profileImageUrl = uploadResult.url // This will be a path like /uploads/123_timestamp.jpg
        }
      }

      // Combine tags into comma-separated strings
      const updatedUserData = {
        ...userData,
        profileImage: profileImageUrl,
        university: universityTags.join(", "),
        faculty: facultyTags.join(", "),
      }

      const result = await updateProfile(updatedUserData)

      if (result.success) {
        setMessage({ text: "บันทึกข้อมูลสำเร็จ", type: "success" })
        setSaveSuccess(true)

        // Reset states
        setSelectedImage(null)

        // Reset success state after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false)
        }, 3000)
      } else {
        setMessage({ text: result.message, type: "error" })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ text: "เกิดข้อผิดพลาดในการบันทึกข้อมูล", type: "error" })
    } finally {
      setIsLoading(false)
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
    }
    setFacultyInput('');
    setShowFacultyOptions(false);
  };

  // Add this function to handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)

      // Create a preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Function to trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  }

  const tabVariants = {
    inactive: { boxShadow: "none", scale: 1 },
    active: {
      boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
      scale: 1.02,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  }

  // Tab content components
  const renderPersonalInfoTab = () => (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="space-y-2" variants={itemVariants}>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          ชื่อผู้ใช้
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User size={16} className="text-gray-400" />
          </div>
          <input
            id="username"
            name="username"
            type="text"
            value={userData.username}
            readOnly
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
          />
        </div>
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          อีเมล
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            id="email"
            name="email"
            type="email"
            value={userData.email}
            onChange={handleInputChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="your.email@example.com"
            disabled={isLoading}
          />
        </div>
      </motion.div>
    </motion.div>
  )

  const renderEducationTab = () => (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div className="space-y-2" variants={itemVariants}>
          <label htmlFor="education_year" className="block text-sm font-medium text-gray-700">
            ชั้นปีการศึกษา
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <GraduationCap size={16} className="text-gray-400" />
            </div>
            <select
              id="education_year"
              name="education_year"
              value={userData.education_year}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white"
              disabled={isLoading}
            >
              <option value="">เลือกชั้นปี</option>
              <option value="m4">มัธยมศึกษาปีที่ 4</option>
              <option value="m5">มัธยมศึกษาปีที่ 5</option>
              <option value="m6">มัธยมศึกษาปีที่ 6</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div className="space-y-2" variants={itemVariants}>
          <label htmlFor="gpa" className="block text-sm font-medium text-gray-700">
            เกรดเฉลี่ย (GPAX)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BookOpen size={16} className="text-gray-400" />
            </div>
            <input
              id="gpa"
              name="gpa"
              type="number"
              step="0.01"
              min="0"
              max="4"
              value={userData.gpa}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="0.00"
              disabled={isLoading}
            />
          </div>
        </motion.div>
      </div>

      <motion.div className="space-y-3" variants={itemVariants}>
        <label className="block text-sm font-medium text-gray-700">สายการเรียน</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: "science", label: "วิทย์-คณิต" },
            { value: "arts-math", label: "ศิลป์-คำนวณ" },
            { value: "arts-lang", label: "ศิลป์-ภาษา" }
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${userData.study_program === option.value
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:bg-gray-50"
                }`}
            >
              <input
                type="radio"
                name="study_program"
                value={option.value}
                checked={userData.study_program === option.value}
                onChange={handleRadioChange}
                className={`mr-2 h-4 w-4 ${userData.study_program === option.value
                  ? "text-primary focus:ring-primary"
                  : "text-gray-300"
                  }`}
                disabled={isLoading}
              />
              <span className={userData.study_program === option.value ? "font-medium" : ""}>{option.label}</span>
            </label>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )

  const renderInterestsTab = () => (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="space-y-3" variants={itemVariants}>
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
              onKeyDown={handleUniversityKeyDown}
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
      </motion.div>

      <motion.div className="space-y-3" variants={itemVariants}>
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
                <path d="M12 14l9-5-9-5-9 5-9-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
            </div>
            <input
              type="text"
              value={facultyInput}
              onChange={handleFacultyInputChange}
              onKeyDown={handleFacultyKeyDown}
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
      </motion.div>

      <motion.div className="space-y-3" variants={itemVariants}>
        <label className="block text-sm font-medium text-gray-700">รอบที่สนใจ</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { value: "1", label: "รอบที่ 1 Portfolio" },
            { value: "2", label: "รอบที่ 2 Quota" },
            { value: "3", label: "รอบที่ 3 Admission" },
            { value: "4", label: "รอบที่ 4 Direct Admission" }
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${userData.admission_rounds.includes(option.value)
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:bg-gray-50"
                }`}
            >
              <input
                type="checkbox"
                name="admission-round"
                value={option.value}
                checked={userData.admission_rounds.includes(option.value)}
                onChange={handleCheckboxChange}
                className={`mr-2 h-4 w-4 rounded ${userData.admission_rounds.includes(option.value)
                  ? "text-primary focus:ring-primary"
                  : "text-gray-300"
                  }`}
                disabled={isLoading}
              />
              <span className={userData.admission_rounds.includes(option.value) ? "font-medium" : ""}>{option.label}</span>
            </label>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header Card */}
          <div className="relative bg-white rounded-2xl shadow-md overflow-hidden mb-6">
            <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
            <div className="px-6 sm:px-8 pb-6">
              <div className="flex items-center space-x-4">
                <div className="relative -mt-12 w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white flex items-center justify-center group">
                  {previewUrl ? (
                    // Preview from local file selection
                    <Image src={previewUrl} alt="Profile" fill className="object-cover" />
                  ) : (
                    // Use userData.profileImage with fallback
                    <Image
                      src={userData.profileImage || "/avatar.png"}
                      alt="Profile"
                      fill
                      className="profile-img object-cover"
                      onError={() => {
                        // This will update the src to fallback if the original fails
                        const imgElement = document.querySelector('.profile-img') as HTMLImageElement;
                        if (imgElement && imgElement.src !== '/avatar.png') {
                          imgElement.src = '/avatar.png';
                        }
                      }}
                    />
                  )}

                  {/* Overlay that appears on hover */}
                  <div
                    onClick={triggerFileInput}
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera size={20} className="text-white" />
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </div>
                <div className="py-4">
                  <h2 className="text-xl sm:text-2xl font-bold">{userData.username}</h2>
                  <p className="text-gray-500 text-sm">
                    {userData.study_program === "science" ? "วิทย์-คณิต" :
                      userData.study_program === "arts-math" ? "ศิลป์-คำนวณ" :
                        userData.study_program === "arts-lang" ? "ศิลป์-ภาษา" : "ยังไม่ได้เลือกสายการเรียน"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Success Message */}
            <AnimatePresence>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                >
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto hide-scrollbar px-4 py-3 space-x-2 sm:space-x-4">
                <motion.button
                  onClick={() => setActiveTab("info")}
                  className={`flex items-center space-x-2 py-2 px-4 rounded-lg text-sm font-medium ${activeTab === "info"
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  variants={tabVariants}
                  animate={activeTab === "info" ? "active" : "inactive"}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <User size={16} />
                  <span>ข้อมูลส่วนตัว</span>
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab("education")}
                  className={`flex items-center space-x-2 py-2 px-4 rounded-lg text-sm font-medium ${activeTab === "education"
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  variants={tabVariants}
                  animate={activeTab === "education" ? "active" : "inactive"}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GraduationCap size={16} />
                  <span>การศึกษา</span>
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab("interests")}
                  className={`flex items-center space-x-2 py-2 px-4 rounded-lg text-sm font-medium ${activeTab === "interests"
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  variants={tabVariants}
                  animate={activeTab === "interests" ? "active" : "inactive"}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <School size={16} />
                  <span>ความสนใจ</span>
                </motion.button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === "info" && renderPersonalInfoTab()}
                {activeTab === "education" && renderEducationTab()}
                {activeTab === "interests" && renderInterestsTab()}
              </AnimatePresence>

              {/* Save Button */}
              <motion.div
                className="mt-8 flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  type="button"
                  onClick={saveProfile}
                  className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-white font-medium transition-all ${isSaveSuccess
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-primary hover:bg-primary/90"
                    }`}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : isSaveSuccess ? (
                    <>
                      <Check size={18} />
                      <span>บันทึกสำเร็จ</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>บันทึกข้อมูล</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}