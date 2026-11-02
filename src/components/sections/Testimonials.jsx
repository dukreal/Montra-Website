import StarRating from '@/components/ui/StarRating'
import ReviewCard from '@/components/ui/ReviewCard'
import starLgIcon from '@/assets/icons/star-lg.svg'
import arrowRightIcon from '@/assets/icons/arrow-right.svg'
import { REVIEWS } from '@/constants/content'

export default function Testimonials() {
  return (
    <section id="reviews" className="border-[#242424] border-solid border-t content-stretch flex flex-col items-start relative shrink-0 w-full">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
        <div className="content-stretch flex flex-col items-start max-w-[1200px] px-[24px] py-[128px] relative shrink-0 w-[1200px] max-xl:w-full max-md:py-[80px]">
          <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-[480.969px] max-md:w-full">
              <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                <h2 className="[word-break:break-word] font-black leading-[0] not-italic relative shrink-0 text-[52px] text-white tracking-[-1.3px] whitespace-nowrap max-md:text-[40px] max-md:text-balance max-md:whitespace-normal">
                  <span className="leading-[54.6px]">What our </span>
                  <span className="leading-[54.6px] text-[#6f6f6f]">users say</span>
                </h2>
              </div>
              <div className="content-stretch flex gap-[8px] h-[36px] items-center pt-[16px] relative shrink-0 w-[480.969px] max-md:w-full">
                <StarRating icon={starLgIcon} sizeClass="size-[18px]" />
                <div className="content-stretch flex flex-col items-start relative shrink-0">
                  <p className="[word-break:break-word] font-semibold leading-[20px] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">4.9</p>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0">
                  <p className="[word-break:break-word] font-normal leading-[20px] not-italic relative shrink-0 text-[#6f6f6f] text-[14px] whitespace-nowrap">· 1,200+ reviews</p>
                </div>
              </div>
            </div>

            <div className="content-stretch flex gap-[12px] items-start relative shrink-0 max-md:hidden">
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
            <div className="content-stretch flex flex-col h-[227.125px] items-start overflow-clip relative shrink-0 w-full max-xl:h-auto max-xl:overflow-x-auto max-xl:overflow-y-hidden max-xl:snap-x max-xl:snap-mandatory max-xl:[scrollbar-width:none] max-xl:[&::-webkit-scrollbar]:hidden">
              <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full max-xl:items-stretch">
                {REVIEWS.map((review) => (
                  <ReviewCard key={review.name} {...review} />
                ))}
              </div>
            </div>
          </div>

          <div className="content-stretch flex flex-col items-start pt-[40px] relative shrink-0 w-full">
            <div className="bg-[#242424] content-stretch flex flex-col h-[4px] items-start overflow-clip relative rounded-[33554400px] shrink-0 w-full">
              <div className="bg-[#27ae60] h-[4px] relative rounded-[33554400px] shrink-0 w-[691.188px] max-xl:w-[60%]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}