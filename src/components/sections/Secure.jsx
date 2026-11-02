import secureCardEncrypted from '@/assets/images/secure-card-encrypted.png'
import securePhone from '@/assets/images/secure-phone.png'
import shieldCheckIcon from '@/assets/icons/shield-check.svg'
import globeIcon from '@/assets/icons/globe.svg'
import giftIcon from '@/assets/icons/gift.svg'

function SecureItem({ icon, text, className }) {
  return (
    <li className={`content-stretch flex gap-[12px] items-center relative shrink-0 ${className}`}>
      <div className="bg-[rgba(39,174,96,0.12)] grid grid-cols-[_30px] grid-rows-[_30px] relative rounded-[33554400px] shrink-0 size-[30px]">
        <div className="col-1 justify-self-center relative row-1 self-center shrink-0 size-[16px]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={icon} />
        </div>
      </div>
      <div className="content-stretch flex flex-col items-start relative shrink-0">
        <p className="[word-break:break-word] font-normal leading-[22.5px] not-italic relative shrink-0 text-[15px] text-white whitespace-nowrap">{text}</p>
      </div>
    </li>
  )
}

export default function Secure() {
  return (
    <section className="border-[#242424] border-solid border-t content-stretch flex flex-col items-start relative shrink-0 w-full">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
        <div className="gap-x-[56px] gap-y-[56px] grid-cols-[__548px_548px] grid-rows-[_701.48px] inline-grid max-w-[1200px] px-[24px] py-[128px] relative shrink-0">
          <div className="col-1 content-stretch flex items-start justify-center justify-self-stretch relative row-1 self-center shrink-0">
            <div className="h-[982px] relative shrink-0 w-[1261px]">
              <div className="absolute h-[803px] left-0 top-[179px] w-[1261px]">
                <img alt="Motra profile screen" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={securePhone} />
              </div>
              <div className="absolute h-[230px] left-[625px] top-[172.82px] w-[363px]">
                <img alt="Encrypted, on-device storage" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={secureCardEncrypted} />
              </div>
            </div>
          </div>

          <div className="col-2 content-stretch flex flex-col h-[391.594px] items-start justify-self-stretch relative row-1 self-center shrink-0">
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
              <h2 className="[word-break:break-word] font-black leading-[0] not-italic relative shrink-0 text-[46px] text-white tracking-[-1.15px] w-[548px]">
                <span className="leading-[48.3px]">Your money data is </span>
                <span className="leading-[48.3px] text-[#27ae60]">safe with Motra</span>
              </h2>
            </div>
            <div className="content-stretch flex flex-col items-start pt-[24px] relative shrink-0">
              <p className="[word-break:break-word] font-normal leading-[29.25px] not-italic relative shrink-0 text-[#a3a3a3] text-[18px] w-[448px]">Everything is stored locally on your device first. No account is required to get started, and your records never leave your phone unless you choose to back them up.</p>
            </div>
            <ul className="content-stretch flex flex-col h-[154px] items-start pt-[32px] relative shrink-0 w-[548px]">
              <SecureItem icon={shieldCheckIcon} text="Offline-first, on-device storage" className="w-full" />
              <SecureItem icon={globeIcon} text="Available in English and Filipino" className="h-[46px] pt-[16px] w-[548px]" />
              <SecureItem icon={giftIcon} text="Completely free to use" className="h-[46px] pt-[16px] w-[548px]" />
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}