"use client"

export interface User {
  username: string
  password: string
  education_year?: string
  study_program?: string
  university?: string
  faculty?: string
  gpa?: string
  admission_rounds?: string[]
  profileImage?: string
  created_at: string
}

export interface CurrentUser {
  username: string
  profileImage?: string
  isLoggedIn: boolean
}

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") return null

  const currentUser = localStorage.getItem("currentUser")
  if (!currentUser) return null

  try {
    return JSON.parse(currentUser)
  } catch (error) {
    console.error("Error parsing current user:", error)
    return null
  }
}

export function getAllUsers(): { users: User[] } {
  if (typeof window === "undefined") return { users: [] }

  const users = localStorage.getItem("users")
  if (!users) return { users: [] }

  try {
    return JSON.parse(users)
  } catch (error) {
    console.error("Error parsing users:", error)
    return { users: [] }
  }
}

export function login(username: string, password: string): boolean {
  const allUsers = getAllUsers()
  const user = allUsers.users.find((u) => u.username === username && u.password === password)

  if (user) {
    const currentUser: CurrentUser = {
      username: user.username,
      profileImage: user.profileImage || "/placeholder.svg?height=40&width=40",
      isLoggedIn: true,
    }

    localStorage.setItem("currentUser", JSON.stringify(currentUser))
    return true
  }

  return false
}

export function logout(): void {
  localStorage.removeItem("currentUser")
}

export function register(userData: Omit<User, "created_at">): boolean {
  const allUsers = getAllUsers()

  // Check if username already exists
  if (allUsers.users.some((user) => user.username === userData.username)) {
    return false
  }

  const newUser: User = {
    ...userData,
    profileImage: userData.profileImage || "/placeholder.svg?height=40&width=40",
    created_at: new Date().toISOString(),
  }

  allUsers.users.push(newUser)
  localStorage.setItem("users", JSON.stringify(allUsers))

  // Auto login
  const currentUser: CurrentUser = {
    username: newUser.username,
    profileImage: newUser.profileImage,
    isLoggedIn: true,
  }

  localStorage.setItem("currentUser", JSON.stringify(currentUser))
  return true
}

export function updateUserProfile(username: string, updates: Partial<User>): boolean {
  const allUsers = getAllUsers()
  const userIndex = allUsers.users.findIndex((u) => u.username === username)

  if (userIndex === -1) return false

  allUsers.users[userIndex] = {
    ...allUsers.users[userIndex],
    ...updates,
  }

  localStorage.setItem("users", JSON.stringify(allUsers))

  // Update current user if profile image changed
  if (updates.profileImage) {
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.username === username) {
      currentUser.profileImage = updates.profileImage
      localStorage.setItem("currentUser", JSON.stringify(currentUser))
    }
  }

  return true
}

