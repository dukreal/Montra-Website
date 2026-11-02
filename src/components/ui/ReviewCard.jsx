import StarRating from '@/components/ui/StarRating'
import starIcon from '@/assets/icons/star.svg'

export default function ReviewCard({ quote, name, role, nameWidth }) {
  return (
    <article className="bg-[#141414] border border-[#242424] border-solid content-stretch flex flex-col items-start p-[28px] relative rounded-[24px] shrink-0 w-[368px]">
      <StarRating icon={starIcon} sizeClass="size-[16px]" className="w-full" />
      <blockquote className="content-stretch flex flex-col items-start pt-[16px] relative shrink-0 w-full">
        <p className="[word-break:break-word] font-normal leading-[24.375px] not-italic relative shrink-0 text-[15px] text-white w-[310px]">{quote}</p>
      </blockquote>
      <div className="content-stretch flex gap-[12px] h-[64px] items-center pt-[24px] relative shrink-0 w-[310px]">
        <div className="bg-[rgba(39,174,96,0.13)] grid grid-cols-[_40px] grid-rows-[_40px] relative rounded-[33554400px] shrink-0 size-[40px]">
          <p className="[word-break:break-word] col-1 font-bold justify-self-center leading-[24px] not-italic relative row-1 self-center shrink-0 text-[#2ecc71] text-[16px] whitespace-nowrap">{name.charAt(0)}</p>
        </div>
        <div className={`content-stretch flex flex-col items-start relative shrink-0 ${nameWidth}`}>
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
            <p className="[word-break:break-word] font-bold leading-[20px] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">{name}</p>
          </div>
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
            <p className="[word-break:break-word] font-normal leading-[16px] not-italic relative shrink-0 text-[#6f6f6f] text-[12px] whitespace-nowrap">{role}</p>
          </div>
        </div>
      </div>
    </article>
  )
}