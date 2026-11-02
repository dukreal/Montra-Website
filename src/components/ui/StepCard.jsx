export default function StepCard({ label, title, description }) {
  return (
    <article className="bg-[#141414] border border-[#242424] border-solid content-stretch flex flex-col items-start max-w-[320px] p-[24px] relative rounded-[16px] shrink-0 w-[320px]">
      <div className="h-[24px] relative shrink-0 w-full">
        <p className="[word-break:break-word] absolute font-bold leading-[16.5px] left-0 not-italic text-[#27ae60] text-[11px] top-[4px] tracking-[1.98px] whitespace-nowrap">{label}</p>
      </div>
      <div className="content-stretch flex flex-col h-[36px] items-start pt-[8px] relative shrink-0 w-[270px]">
        <h3 className="[word-break:break-word] font-bold leading-[28px] not-italic relative shrink-0 text-[18px] text-white whitespace-nowrap">{title}</h3>
      </div>
      <div className="content-stretch flex flex-col items-start pt-[6px] relative shrink-0 w-full">
        <p className="[word-break:break-word] font-normal leading-[22.75px] not-italic relative shrink-0 text-[#a3a3a3] text-[14px] w-[270px]">{description}</p>
      </div>
    </article>
  )
}