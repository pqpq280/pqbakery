/** @type {import('tailwindcss').Config} */
export default {
  // 1. Vite가 이 파일들을 샅샅이 뒤져서 CSS를 만들도록 지시
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // 2. 🚨 핵심: 빌드할 때 절대 지우면 안 되는 동적 클래스들 목록 (보호막)
  safelist: [
    'bg-[#F4C2C2]',
    'bg-[#90e0ef]',
    'bg-[#6c757d]',
    'bg-[#a5a58d]',
    'bg-[#f4a261]',
    'bg-[#81b29a]',
    'bg-[#3d2b1f]',
    'bg-[#7209b7]',
    'bg-slate-900',
    'bg-[#4a4e69]',
    'bg-[#f28482]',
    'bg-red-600',
    'bg-yellow-400',
    'bg-green-400',
    'animate-bounce',
    'animate-pulse',
    'animate-ping',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}