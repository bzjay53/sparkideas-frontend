import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'IdeaSpark - AI 기반 갈증포인트 분석 플랫폼',
  description: '실시간 갈증포인트 수집과 AI 분석으로 비즈니스 기회를 자동 발굴하는 혁신적인 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="ideaspark-theme">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}