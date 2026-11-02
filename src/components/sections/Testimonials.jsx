import StarRating from '@/components/ui/StarRating'
import ReviewCard from '@/components/ui/ReviewCard'
import starLgIcon from '@/assets/icons/star-lg.svg'
import arrowRightIcon from '@/assets/icons/arrow-right.svg'

const REVIEWS = [
  {
    quote: "“Motra made budgeting effortless. Logging a jeepney fare takes two taps and the monthly view is gorgeous.”",
    name: 'Maya Collins',
    role: 'Financial Consultant',
    nameWidth: 'w-[115px]',
  },
  {
    quote: "“Fast, clean, and genuinely useful. The location tagging is a small thing that I now can't live without.”",
    name: 'Daniel Cruz',
    role: 'Small Business Owner',
    nameWidth: 'w-[126px]',
  },
  {
    quote: "“I've tried every tracker out there. This is the first one I've actually kept using past a week.”",
    name: 'Lara Whitmore',
    role: 'Freelance Designer',
    nameWidth: 'w-[110px]',
  },
  {
    quote: '“The analytics breakdown finally showed me where my salary was quietly disappearing each month.”',
    name: 'Paolo Reyes',
    role: 'Software Engineer',
    nameWidth: 'w-[104px]',
  },
  {
    quote: "“Works perfectly offline on my commute. Everything syncs the moment I'm back online.”",
    name: 'Bea Santos',
    role: 'Nurse',
    nameWidth: 'w-[77px]',
  },
]

export default function Testimonials() {
  return (
    <section id="reviews" className="border-[#242424] border-solid border-t content-stretch flex flex-col items-start relative shrink-0 w-full">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
        <div className="content-stretch flex flex-col items-start max-w-[1200px] px-[24px] py-[128px] relative shrink-0 w-[1200px]">
          <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-[480.969px]">
              <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                <h2 className="[word-break:break-word] font-black leading-[0] not-italic relative shrink-0 text-[52px] text-white tracking-[-1.3px] whitespace-nowrap">
                  <span className="leading-[54.6px]">What our </span>
                  <span className="leading-[54.6px] text-[#6f6f6f]">users say</span>
                </h2>
              </div>
              <div className="content-stretch flex gap-[8px] h-[36px] items-center pt-[16px] relative shrink-0 w-[480.969px]">
                <StarRating icon={starLgIcon} sizeClass="size-[18px]" />
                <div className="content-stretch flex flex-col items-start relative shrink-0">
                  <p className="[word-break:break-word] font-semibold leading-[20px] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">4.9</p>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0">
                  <p className="[word-break:break-word] font-normal leading-[20px] not-italic relative shrink-0 text-[#6f6f6f] text-[14px] whitespace-nowrap">· 1,200+ reviews</p>
                </div>
              </div>
            </div>

            <div className="content-stretch flex gap-[12px] items-start relative shrink-0">
              <button type="button" aria-label="Previous reviews" disabled className="bg-[#141414] border border-[#242424] border-solid grid grid-cols-[_44px] grid-rows-[_44px] opacity-30 relative rounded-[33554400px] shrink-0 size-[46px]">
                <span className="col-1 content-stretch flex flex-col items-start justify-self-center relative row-1 self-center shrink-0 size-[19px]">
                  <span className="absolute flex items-center justify-center left-0 size-[19px] top-0">
                    <span className="flex-none rotate-180">
                      <span className="content-stretch flex items-start relative size-[19px]">
                        <span className="relative shrink-0 size-[19px]">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={arrowRightIcon} />
                        </span>
                      </span>
                    </span>
                  </span>
                </span>
              </button>
              <button type="button" aria-label="Next reviews" className="bg-[#141414] border border-[#242424] border-solid grid grid-cols-[_44px] grid-rows-[_44px] relative rounded-[33554400px] shrink-0 size-[46px]">
                <span className="col-1 content-stretch flex items-start justify-self-center relative row-1 self-center shrink-0">
                  <span className="relative shrink-0 size-[19px]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={arrowRightIcon} />
                  </span>
                </span>
              </button>
            </div>
          </div>

          <div className="content-stretch flex flex-col items-start pt-[48px] relative shrink-0 w-full">
            <div className="content-stretch flex flex-col h-[227.125px] items-start overflow-clip relative shrink-0 w-full">
              <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full">
                {REVIEWS.map((review) => (
                  <ReviewCard key={review.name} {...review} />
                ))}
              </div>
            </div>
          </div>

          <div className="content-stretch flex flex-col items-start pt-[40px] relative shrink-0 w-full">
            <div className="bg-[#242424] content-stretch flex flex-col h-[4px] items-start overflow-clip relative rounded-[33554400px] shrink-0 w-full">
              <div className="bg-[#27ae60] h-[4px] relative rounded-[33554400px] shrink-0 w-[691.188px]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}