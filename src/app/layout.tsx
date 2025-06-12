import type React from "react"
import type { Metadata } from "next"
import { Kanit } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-kanit",
})

export const metadata: Metadata = {
  title: "SSS - SingSrangSamor",
  description: "แพลตฟอร์มสำหรับนักเรียนที่ต้องการศึกษาต่อในระดับมหาวิทยาลัย",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={`${kanit.variable} font-sans`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

