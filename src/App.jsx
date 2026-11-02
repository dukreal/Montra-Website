import LandingPage from '@/pages/LandingPage'

export default function App() {
  return (
    <div className="bg-[#050505] content-stretch flex flex-col items-start relative size-full">
      <div className="content-stretch flex flex-col h-[903px] items-start relative shrink-0 w-[1337px]">
        <LandingPage />
      </div>
    </div>
  )
}