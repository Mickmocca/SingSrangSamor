"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"
import { useRouter } from "next/navigation"

interface UserRegistrationData {
  username: string
  password: string
  education_year?: string
  study_program?: string
  university?: string
  faculty?: string
  gpa?: string
  admission_rounds?: string[]
  profileImage?: string
}

interface UserProfileUpdateData {
  email?: string
  education_year?: string
  study_program?: string
  university?: string
  faculty?: string
  gpa?: string
  admission_rounds?: string[]
  profileImage?: string
}

interface User {
  id: string
  username: string
  profileImage?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (userData: UserRegistrationData) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  updateProfile: (userData: UserProfileUpdateData) => Promise<{ success: boolean; message: string }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false, message: "" }),
  register: async () => ({ success: false, message: "" }),
  logout: async () => {},
  updateProfile: async () => ({ success: false, message: "" }),
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/user/profile")
        const data = await res.json()

        if (data.success) {
          setUser({
            id: data.user.id,
            username: data.user.username,
            profileImage: data.user.profileImage,
          })
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (data.success) {
        setUser({
          id: data.user.id,
          username: data.user.username,
          profileImage: data.user.profileImage,
        })
      }

      return { success: data.success, message: data.message }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" }
    }
  }


  const register = async (userData: UserRegistrationData) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await res.json()

      if (data.success) {
        setUser({
          id: data.user.id,
          username: data.user.username,
          profileImage: data.user.profileImage,
        })
      }

      return { success: data.success, message: data.message }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, message: "เกิดข้อผิดพลาดในการลงทะเบียน" }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const updateProfile = async (userData: UserProfileUpdateData) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await res.json()

      if (data.success && data.user.profileImage) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                profileImage: data.user.profileImage,
              }
            : null,
        )
      }

      return { success: data.success, message: data.message }
    } catch (error) {
      console.error("Update profile error:", error)
      return { success: false, message: "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์" }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

