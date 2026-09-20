import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: '趣買購物 AI 營運與行銷輔導顧問',
  description: '專為趣買購物同仁打造的網路行銷、電商訂單處理及實體門市虛實整合專屬AI老闆級教練系統。',
  openGraph: {
    title: '趣買購物 AI 營運與行銷輔導顧問',
    description: '專為趣買購物同仁打造的網路行銷、電商訂單處理及實體門市虛實整合專屬AI老闆級教練系統。',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '趣買購物 AI 營運與行銷輔導顧問',
    description: '專為趣買購物同仁打造的網路行銷、電商訂單處理及實體門市虛實整合專屬AI老闆級教練系統。',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="zh-TW">
      <body suppressHydrationWarning className="antialiased min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
