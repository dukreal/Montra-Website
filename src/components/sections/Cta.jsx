import downloadIcon from '@/assets/icons/download.svg'
import webDarkIcon from '@/assets/icons/web-dark.svg'
import ctaPhone from '@/assets/images/cta-phone.png'

const CTA_BG = 'linear-gradient(133.28541469119173deg, rgb(39, 174, 96) 7.735%, rgb(30, 122, 68) 92.265%)'

export default function Cta() {
  return (
    <section className="content-stretch flex flex-col items-center pb-[32px] px-[24px] relative shrink-0 w-[1337px]">
      <div
        style={{ backgroundImage: CTA_BG }}
        className="h-[735.578px] max-w-[1200px] overflow-clip relative rounded-[32px] shrink-0 w-[1200px]"
      >
        <div aria-hidden="true" className="absolute content-stretch flex flex-col items-start left-[1049.17px] opacity-10 top-[555.58px]">
          <p className="[word-break:break-word] font-black leading-[220px] not-italic relative shrink-0 text-[#03130a] text-[220px] whitespace-nowrap">₱</p>
        </div>

        <div className="absolute gap-x-[40px] gap-y-[40px] grid-cols-[__516px_516px] grid-rows-[_575.58px] inline-grid left-[64px] top-[80px]">
          <div className="col-1 content-stretch flex flex-col h-[322.281px] items-start justify-self-stretch relative row-1 self-center shrink-0">
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
              <p className="[word-break:break-word] font-semibold leading-[20px] not-italic relative shrink-0 text-[#04220f] text-[14px] whitespace-nowrap">Join the money-clarity movement</p>
            </div>
            <div className="content-stretch flex flex-col items-start pt-[12px] relative shrink-0 w-full">
              <h2 className="[word-break:break-word] font-black leading-[50.4px] not-italic relative shrink-0 text-[#03130a] text-[48px] w-[516px]">Start tracking smarter today.</h2>
            </div>
            <div className="content-stretch flex flex-col items-start pt-[16px] relative shrink-0">
              <p className="[word-break:break-word] font-normal leading-[28px] not-italic relative shrink-0 text-[#053b1c] text-[18px] w-[448px]">Free, offline-first, and built for the way you actually spend.</p>
            </div>
            <div className="content-stretch flex flex-col gap-[8px] h-[118px] items-start pt-[32px] relative shrink-0 w-[516px]">
              <div className="content-stretch flex gap-[12px] items-start relative shrink-0">
                <button type="button" className="bg-white content-stretch drop-shadow-[0px_14px_20px_rgba(0,0,0,0.25)] flex gap-[10px] items-center px-[32px] py-[16px] relative rounded-[33554400px] self-stretch shrink-0">
                  <span className="relative shrink-0 size-[20px]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={downloadIcon} />
                  </span>
                  <span className="[word-break:break-word] font-bold leading-[24px] not-italic relative shrink-0 text-[#03130a] text-[16px] text-center whitespace-nowrap">Download App</span>
                </button>
                <button type="button" className="border border-[rgba(3,19,10,0.35)] border-solid content-stretch flex gap-[10px] items-center px-[32px] py-[16px] relative rounded-[33554400px] self-stretch shrink-0">
                  <span className="relative shrink-0 size-[20px]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={webDarkIcon} />
                  </span>
                  <span className="[word-break:break-word] font-bold leading-[24px] not-italic relative shrink-0 text-[#03130a] text-[16px] whitespace-nowrap">Web Version</span>
                </button>
              </div>
              <p className="[word-break:break-word] font-medium leading-[19.5px] not-italic relative shrink-0 text-[#04220f] text-[13px] whitespace-nowrap">Coming soon to Android, iOS &amp; web</p>
            </div>
          </div>

          <div className="col-2 content-stretch flex h-[575.578px] items-start justify-end justify-self-stretch relative row-1 self-center shrink-0">
            <div className="h-full relative shrink-0 w-[230px]">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute flex h-[1025.492px] items-center justify-center left-[calc(50%-68.5px)] top-[calc(50%+62.29px)] w-[1278.152px]">
                <div className="flex-none rotate-[6.34deg]">
                  <div className="h-[900px] relative w-[1186px]">
                    <img alt="Motra app on a phone" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={ctaPhone} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}