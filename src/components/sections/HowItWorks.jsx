import StepCard from '@/components/ui/StepCard'
import howItWorksPhone from '@/assets/images/how-it-works-phone.png'
import shieldPrivacyIcon from '@/assets/icons/shield-privacy.svg'

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="content-stretch flex flex-col items-center relative shrink-0 w-full">
      <div className="content-stretch flex flex-col items-start max-w-[1200px] px-[24px] py-[128px] relative shrink-0 w-[1200px] max-xl:w-full max-md:py-[80px]">
        <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
          <h2 className="[word-break:break-word] font-black leading-[0] not-italic relative shrink-0 text-[52px] text-center text-white tracking-[-1.3px] whitespace-nowrap max-md:text-[40px]">
            <span className="leading-[54.6px]">How it </span>
            <span className="leading-[54.6px] text-[#27ae60]">works</span>
          </h2>
        </div>

        <div className="content-stretch flex flex-col items-start pt-[64px] relative shrink-0 w-full">
          <div className="gap-x-[40px] gap-y-[40px] grid grid-cols-[___386px_300px_386px] grid-rows-[_754.62px] relative shrink-0 w-full max-xl:grid-cols-2 max-xl:grid-rows-none max-md:grid-cols-1 max-md:gap-y-[20px]">
            <div className="col-2 h-[1500px] relative row-1 self-center shrink-0 w-[300px] max-xl:col-span-2 max-xl:row-auto max-xl:h-[742px] max-xl:w-full max-xl:overflow-clip max-md:col-span-1 max-md:h-[620px]">
              <div className="absolute h-[1004px] left-[-518.5px] top-[315.5px] w-[1338px] max-xl:left-1/2 max-xl:-translate-x-1/2 max-xl:top-[-57.5px] max-md:h-[825px] max-md:w-[1100px] max-md:top-[-45px]">
                <img alt="Motra add transaction screen" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={howItWorksPhone} />
              </div>
            </div>

            <div className="col-1 content-stretch flex flex-col gap-[20px] items-end justify-self-stretch relative row-1 self-center shrink-0 max-xl:col-auto max-xl:row-auto max-xl:items-stretch max-xl:self-start">
              <StepCard
                label="STEP 1"
                title="Add a transaction"
                description="Tap the + button, choose expense or income, and enter the amount in seconds."
              />
              <StepCard
                label="STEP 2"
                title="Tag it with context"
                description="Pick a category and sub-category, drop a location, and attach a receipt photo."
              />
            </div>

            <div className="col-3 content-stretch flex flex-col gap-[20px] items-start justify-self-stretch relative row-1 self-center shrink-0 max-xl:col-auto max-xl:row-auto max-xl:items-stretch max-xl:self-start">
              <StepCard
                label="STEP 3"
                title="Watch it add up"
                description="Motra rolls everything into daily balances and monthly analytics automatically."
              />
              <div className="bg-[#191919] border border-[#242424] border-solid content-stretch flex flex-col items-start max-w-[320px] p-[24px] relative rounded-[16px] shrink-0 w-[320px] max-xl:w-full max-xl:max-w-none">
                <div className="relative shrink-0 size-[26px]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={shieldPrivacyIcon} />
                </div>
                <div className="content-stretch flex flex-col h-[36px] items-start pt-[12px] relative shrink-0 w-[270px] max-xl:w-full">
                  <h3 className="[word-break:break-word] font-bold leading-[24px] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">Private by default</h3>
                </div>
                <div className="content-stretch flex flex-col items-start pt-[6px] relative shrink-0 w-full">
                  <p className="[word-break:break-word] font-normal leading-[22.75px] not-italic relative shrink-0 text-[#a3a3a3] text-[14px] w-[270px] max-xl:w-full">Your data lives on your device first — no account required to start.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}