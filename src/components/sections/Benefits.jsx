import IconTile from '@/components/ui/IconTile'
import BenefitCard from '@/components/ui/BenefitCard'
import walletIcon from '@/assets/icons/wallet.svg'
import chartIcon from '@/assets/icons/chart.svg'
import boltIcon from '@/assets/icons/bolt.svg'
import pinPinkIcon from '@/assets/icons/pin-pink.svg'
import pinGreenSmIcon from '@/assets/icons/pin-green-sm.svg'
import pinGreenLgIcon from '@/assets/icons/pin-green-lg.svg'
import paletteIcon from '@/assets/icons/palette.svg'

// Green glow in the top-right corner of the "Make it yours" card (kept exactly as exported from Figma)
const CUSTOMIZE_CARD_BG = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 370.66 260.75' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(0 -31.29 -44.479 0 370.66 0)'><stop stop-color='rgba(39,174,96,0.133)' offset='0'/><stop stop-color='rgba(33,123,71,0.18719)' offset='0.034375'/><stop stop-color='rgba(29,94,57,0.24137)' offset='0.06875'/><stop stop-color='rgba(25,64,42,0.34975)' offset='0.1375'/><stop stop-color='rgba(23,48,34,0.45812)' offset='0.20625'/><stop stop-color='rgba(22,38,29,0.5665)' offset='0.275'/><stop stop-color='rgba(21,27,23,0.78325)' offset='0.4125'/><stop stop-color='rgba(20,20,20,1)' offset='0.55'/></radialGradient></defs></svg>")`

const ACCENT_SWATCHES = ['bg-[#27ae60]', 'bg-[#3b7dd8]', 'bg-[#e67e22]', 'bg-[#e05282]']

export default function Benefits() {
  return (
    <section id="benefits" className="border-[#242424] border-solid border-t content-stretch flex flex-col items-start relative shrink-0 w-full">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
        <div className="content-stretch flex flex-col items-start max-w-[1200px] px-[24px] py-[128px] relative shrink-0 w-[1200px] max-xl:w-full max-md:py-[80px]">
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
            <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
              <h2 className="[word-break:break-word] font-black leading-[0] not-italic relative shrink-0 text-[52px] text-center text-white tracking-[-1.3px] whitespace-nowrap max-md:text-[40px]">
                <span className="leading-[54.6px]">Key </span>
                <span className="leading-[54.6px] text-[#6f6f6f]">benefits</span>
              </h2>
            </div>
            <div className="content-stretch flex flex-col h-[44px] items-center pt-[16px] relative shrink-0 w-[1152px] max-xl:w-full max-md:h-auto">
              <p className="[word-break:break-word] font-normal leading-[28px] not-italic relative shrink-0 text-[#a3a3a3] text-[18px] text-center whitespace-nowrap max-md:whitespace-normal">Everything you need to understand your money.</p>
            </div>
          </div>

          <div className="content-stretch flex flex-col items-start pt-[56px] relative shrink-0 w-full">
            <div className="gap-x-[20px] gap-y-[20px] grid grid-cols-[___370.66px_370.67px_370.66px] grid-rows-[__258.75px_260.75px] relative shrink-0 w-full max-xl:grid-cols-2 max-xl:grid-rows-none max-xl:grid-flow-dense max-md:grid-cols-1">
              <div className="col-1 content-stretch flex flex-col items-start justify-self-stretch relative row-1 self-stretch shrink-0 max-xl:col-auto max-xl:row-auto">
                <BenefitCard
                  tint="bg-[rgba(39,174,96,0.12)]"
                  icon={walletIcon}
                  title="Track every peso"
                  description="Log income and expenses in seconds and always know your daily balance."
                />
              </div>

              <div className="col-2 content-stretch flex flex-col items-start justify-self-stretch relative row-1 self-stretch shrink-0 max-xl:col-auto max-xl:row-auto">
                <article className="bg-[#141414] border border-[#242424] border-solid content-stretch flex flex-col h-[258.75px] items-start p-[28px] relative rounded-[24px] shrink-0 w-full max-xl:h-auto max-xl:flex-1">
                  <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
                    <IconTile tint="bg-[rgba(74,144,226,0.12)]" icon={chartIcon} />
                    <div className="content-stretch flex flex-col items-start relative shrink-0 size-[92px]">
                      <div className="h-[92px] relative rounded-[33554400px] shrink-0 w-full"></div>
                      <div className="absolute bg-[#191919] grid grid-cols-[_54px] grid-rows-[_54px] left-[19px] rounded-[33554400px] size-[54px] top-[19px]">
                        <div className="col-1 content-stretch flex flex-col h-[16.5px] items-start justify-self-center relative row-1 self-center shrink-0 w-[32.297px]">
                          <p className="[word-break:break-word] font-bold leading-[16.5px] not-italic relative shrink-0 text-[11px] text-white whitespace-nowrap">₱8.4k</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col h-[52px] items-start pt-[24px] relative shrink-0 w-[312.672px] max-xl:w-full">
                    <h3 className="[word-break:break-word] font-bold leading-[28px] not-italic relative shrink-0 text-[20px] text-white whitespace-nowrap">Visual analytics</h3>
                  </div>
                  <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full">
                    <p className="[word-break:break-word] font-normal leading-[24.375px] not-italic relative shrink-0 text-[#a3a3a3] text-[15px] w-[313px] max-xl:w-full">See exactly where your money goes with weekly, monthly and yearly breakdowns.</p>
                  </div>
                </article>
              </div>

              <div className="col-3 content-stretch flex flex-col items-start justify-self-stretch relative row-1 self-stretch shrink-0 max-xl:col-auto max-xl:row-auto">
                <BenefitCard
                  tint="bg-[rgba(245,166,35,0.12)]"
                  icon={boltIcon}
                  title="Instant capture"
                  description="Snap a receipt and attach up to three photos to any transaction."
                />
              </div>

              <div className="col-[1/span_2] content-stretch flex flex-col items-start justify-self-stretch relative row-2 self-stretch shrink-0 max-xl:col-span-2 max-xl:row-auto max-md:col-span-1">
                <article className="bg-[#141414] border border-[#242424] border-solid content-stretch flex gap-[24px] h-[260.75px] items-center p-[28px] relative rounded-[24px] shrink-0 w-[761.328px] max-xl:h-auto max-xl:w-full max-md:flex-col max-md:items-stretch">
                  <div className="content-stretch flex flex-[423.328_0_0] flex-col items-start min-w-px relative max-md:w-full max-md:flex-none">
                    <IconTile tint="bg-[rgba(224,82,130,0.12)]" icon={pinPinkIcon} />
                    <div className="content-stretch flex flex-col h-[48px] items-start pt-[20px] relative shrink-0 w-[423.328px] max-xl:w-full">
                      <h3 className="[word-break:break-word] font-bold leading-[28px] not-italic relative shrink-0 text-[20px] text-white whitespace-nowrap">Location tagging</h3>
                    </div>
                    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 max-xl:w-full">
                      <p className="[word-break:break-word] font-normal leading-[24.375px] not-italic relative shrink-0 text-[#a3a3a3] text-[15px] w-[384px] max-xl:w-full">Pin each spend to a place — remember exactly where it happened, right on the map.</p>
                    </div>
                  </div>
                  <div className="bg-[#191919] border border-[#242424] border-solid content-stretch flex flex-col items-start p-[16px] relative rounded-[16px] shrink-0 w-[256px] max-md:w-full">
                    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
                      <div className="relative shrink-0 size-[16px]">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={pinGreenSmIcon} />
                      </div>
                      <div className="content-stretch flex flex-col items-start relative shrink-0">
                        <p className="[word-break:break-word] font-semibold leading-[19.5px] not-italic relative shrink-0 text-[13px] text-white whitespace-nowrap">Current location</p>
                      </div>
                    </div>
                    <div className="content-stretch flex flex-col items-start pt-[12px] relative shrink-0 w-full">
                      <div className="bg-[#0f0f0f] border border-[#242424] border-solid grid grid-cols-[_220px] grid-rows-[_78px] h-[80px] relative rounded-[12px] shrink-0 w-full">
                        <div className="col-1 justify-self-center relative row-1 self-center shrink-0 size-[22px]">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={pinGreenLgIcon} />
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex flex-col h-[28px] items-start pt-[10px] relative shrink-0 w-[222px] max-md:w-full">
                      <p className="[word-break:break-word] font-normal leading-[18px] not-italic relative shrink-0 text-[#a3a3a3] text-[12px] whitespace-nowrap">9W37+4QQ, Cebu City</p>
                    </div>
                  </div>
                </article>
              </div>

              <div className="col-3 content-stretch flex flex-col items-start justify-self-stretch relative row-2 self-stretch shrink-0 max-xl:col-auto max-xl:row-auto">
                <article
                  style={{ backgroundImage: CUSTOMIZE_CARD_BG }}
                  className="border border-[rgba(39,174,96,0.2)] border-solid content-stretch flex flex-col h-[260.75px] items-start p-[28px] relative rounded-[24px] shrink-0 w-full max-xl:h-auto max-xl:flex-1"
                >
                  <IconTile tint="bg-[rgba(46,204,113,0.12)]" icon={paletteIcon} />
                  <div className="content-stretch flex flex-col h-[48px] items-start pt-[20px] relative shrink-0 w-[312.656px] max-xl:w-full">
                    <h3 className="[word-break:break-word] font-bold leading-[28px] not-italic relative shrink-0 text-[20px] text-white whitespace-nowrap">Make it yours</h3>
                  </div>
                  <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full">
                    <p className="[word-break:break-word] font-normal leading-[24.375px] not-italic relative shrink-0 text-[#a3a3a3] text-[15px] w-[313px] max-xl:w-full">Dark mode, four accent themes, text sizing, and English or Filipino.</p>
                  </div>
                  <div className="content-stretch flex gap-[10px] h-[46px] items-start pt-[20px] relative shrink-0 w-[312.656px] max-xl:w-full">
                    {ACCENT_SWATCHES.map((color) => (
                      <div key={color} className={`${color} border-2 border-[rgba(255,255,255,0.15)] border-solid relative rounded-[33554400px] shrink-0 size-[26px]`}></div>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}