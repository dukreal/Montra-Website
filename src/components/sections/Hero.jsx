import heroPhone from '@/assets/images/hero-phone.png'
import heroCardLocation from '@/assets/images/hero-card-location.png'
import heroCardSummary from '@/assets/images/hero-card-summary.png'
import heroCardSaved from '@/assets/images/hero-card-saved.png'
import heroCardFood from '@/assets/images/hero-card-food.png'
import downloadIcon from '@/assets/icons/download.svg'
import webGreenIcon from '@/assets/icons/web-green.svg'

export default function Hero() {
  return (
    <section id="home" className="h-[1468.188px] relative shrink-0 w-full">
      <div className="absolute h-[1468.188px] left-0 overflow-clip top-0 w-full">
        <div className="absolute bg-[#27ae60] blur-[140px] h-[560px] left-1/2 -translate-x-1/2 opacity-25 rounded-[33554400px] top-[-128px] w-[900px]"></div>
      </div>

      <div className="absolute content-stretch flex flex-col items-start left-1/2 -translate-x-1/2 max-w-[1200px] pb-[32px] pt-[112px] px-[24px] top-0 w-[1200px]">
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
          <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
            <div className="content-stretch flex flex-col items-center max-w-[896px] relative shrink-0 w-[896px]">
              <h1 className="[word-break:break-word] font-black leading-[0] not-italic relative shrink-0 text-[80px] text-center text-white tracking-[-2px] whitespace-nowrap">
                <span className="block leading-[81.6px] mb-0">Track every peso.</span>
                <span className="block leading-[81.6px]">Spend with clarity.</span>
              </h1>
            </div>
          </div>

          <div className="content-stretch flex flex-col items-center pt-[28px] relative shrink-0 w-full">
            <p className="[word-break:break-word] font-normal leading-[32.5px] not-italic relative shrink-0 text-[20px] text-center text-white w-[576px]">Motra makes it effortless to log income and expenses with analytics, receipt photos and location tagging, all in your pocket.</p>
          </div>

          <div className="content-stretch flex gap-[16px] h-[94px] items-start justify-center pt-[36px] relative shrink-0 w-[1152px]">
            <button type="button" className="bg-[#27ae60] content-stretch drop-shadow-[0px_12px_17px_rgba(39,174,96,0.27)] flex gap-[10px] h-full items-center px-[32px] py-[16px] relative rounded-[33554400px] shrink-0">
              <span className="relative shrink-0 size-[20px]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={downloadIcon} />
              </span>
              <span className="[word-break:break-word] font-bold leading-[24px] not-italic relative shrink-0 text-[#03130a] text-[16px] text-center whitespace-nowrap">Download App</span>
            </button>
            <button type="button" className="bg-[#191919] border border-[#242424] border-solid content-stretch flex gap-[10px] h-full items-center px-[32px] py-[16px] relative rounded-[33554400px] shrink-0">
              <span className="relative shrink-0 size-[20px]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={webGreenIcon} />
              </span>
              <span className="[word-break:break-word] font-bold leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Web Version</span>
            </button>
          </div>

          <div className="content-stretch flex flex-col h-[32px] items-center pt-[12px] relative shrink-0 w-[1152px]">
            <p className="[word-break:break-word] font-normal leading-[19.5px] not-italic relative shrink-0 text-[13px] text-center text-white whitespace-nowrap">Coming soon to Android, iOS &amp; web</p>
          </div>
        </div>

        <div className="content-stretch flex h-[844px] items-start justify-center pt-[64px] relative shrink-0 w-[1152px]">
          <div className="h-[780px] relative shrink-0 w-[494px]">
            <div className="absolute h-[1128px] left-0 overflow-clip top-0 w-[494px]">
              <div className="absolute h-[1039px] left-[-752.5px] top-[-130px] w-[2000px]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="Motra app home screen" className="absolute h-[144.37%] left-0 max-w-none top-0 w-full" src={heroPhone} />
                </div>
              </div>
            </div>
            <div className="absolute h-[288px] left-[247.5px] top-[579px] w-[556px]">
              <img alt="Location tag: Banilad, Cebu City" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={heroCardLocation} />
            </div>
            <div className="absolute h-[274px] left-[319.5px] top-[102px] w-[484px]">
              <img alt="Monthly summary of income, expense and balance" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={heroCardSummary} />
            </div>
            <div className="absolute h-[287px] left-[-239.5px] top-[119px] w-[460px]">
              <img alt="Transaction saved confirmation" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={heroCardSaved} />
            </div>
            <div className="absolute h-[274px] left-[-289.5px] top-[593px] w-[501px]">
              <img alt="Food and dining expense of ₱340" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={heroCardFood} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}