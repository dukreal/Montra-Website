import IconTile from '@/components/ui/IconTile'

export default function BenefitCard({ tint, icon, title, description }) {
  return (
    <article className="bg-[#141414] border border-[#242424] border-solid content-stretch flex flex-col h-[258.75px] items-start p-[28px] relative rounded-[24px] shrink-0 w-full max-xl:h-auto max-xl:flex-1">
      <IconTile tint={tint} icon={icon} />
      <div className="content-stretch flex flex-col h-[48px] items-start pt-[20px] relative shrink-0 w-[312.656px] max-xl:w-full">
        <h3 className="[word-break:break-word] font-bold leading-[28px] not-italic relative shrink-0 text-[20px] text-white whitespace-nowrap">{title}</h3>
      </div>
      <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-[312.656px] max-xl:w-full">
        <p className="[word-break:break-word] font-normal leading-[24.375px] not-italic relative shrink-0 text-[#a3a3a3] text-[15px] w-[313px] max-xl:w-full">{description}</p>
      </div>
    </article>
  )
}