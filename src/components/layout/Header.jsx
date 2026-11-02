import { useState } from 'react'
import logo from '@/assets/images/logo.png'
import navWebIcon from '@/assets/icons/nav-web.svg'
import navDownloadIcon from '@/assets/icons/nav-download.svg'
import menuIcon from '@/assets/icons/menu.svg'
import closeIcon from '@/assets/icons/close.svg'
import { NAV_LINKS } from '@/constants/content'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="content-stretch flex flex-col h-[76px] items-center pt-[16px] px-[16px] relative shrink-0 w-full z-50">
      <div className="backdrop-blur-[24px] bg-[rgba(20,20,20,0.82)] border border-[#242424] border-solid content-stretch flex items-center justify-between max-w-[1200px] pl-[20px] pr-[8px] py-[8px] relative rounded-[33554400px] shrink-0 w-[1200px] max-xl:w-full">
        <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
          <div className="bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] border-solid grid grid-cols-[_38px] grid-rows-[_38px] relative rounded-[12px] shrink-0 size-[40px]">
            <div className="col-1 justify-self-center relative row-1 self-center shrink-0 size-[26px]">
              <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={logo} />
            </div>
          </div>
          <div className="content-stretch flex flex-col items-start relative shrink-0">
            <p className="[word-break:break-word] font-black leading-[37.5px] not-italic relative shrink-0 text-[25px] text-white tracking-[-0.625px] whitespace-nowrap">Motra</p>
          </div>
        </div>

        <nav className="content-stretch flex gap-[32px] items-center relative shrink-0 max-lg:hidden">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="content-stretch flex flex-col items-start relative shrink-0">
              <p className="[word-break:break-word] font-medium leading-[22.5px] not-italic relative shrink-0 text-[#a3a3a3] text-[15px] whitespace-nowrap">{link.label}</p>
            </a>
          ))}
        </nav>

        <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
          <button type="button" className="bg-[#191919] border border-[#242424] border-solid content-stretch flex gap-[10px] items-center px-[20px] py-[10px] relative rounded-[33554400px] shrink-0 max-md:hidden">
            <span className="relative shrink-0 size-[17px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={navWebIcon} />
            </span>
            <span className="[word-break:break-word] font-bold leading-[20px] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">Web Version</span>
          </button>
          <button type="button" className="bg-[#27ae60] content-stretch drop-shadow-[0px_12px_17px_rgba(39,174,96,0.27)] flex gap-[10px] items-center px-[20px] py-[10px] relative rounded-[33554400px] shrink-0 max-md:hidden">
            <span className="relative shrink-0 size-[17px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={navDownloadIcon} />
            </span>
            <span className="[word-break:break-word] font-bold leading-[20px] not-italic relative shrink-0 text-[#03130a] text-[14px] text-center whitespace-nowrap">Download App</span>
          </button>
        </div>
      </div>
    </header>
  )
}