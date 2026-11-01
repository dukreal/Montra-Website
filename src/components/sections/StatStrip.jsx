const STATS = [
  { col: 'col-1', value: '100%', label: 'Offline-first' },
  { col: 'col-2', value: '₱', label: 'Peso native' },
  { col: 'col-3', value: '12', label: 'Categories' },
  { col: 'col-4', value: '2', label: 'Languages' },
]

export default function StatStrip() {
  return (
    <div className="bg-[#0b0b0b] border-[#242424] border-b border-solid border-t content-stretch flex flex-col items-start relative shrink-0 w-full">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
        <div className="gap-x-[32px] gap-y-[32px] grid-cols-[____264px_264px_264px_264px] grid-rows-[_66px] inline-grid max-w-[1200px] px-[24px] py-[40px] relative shrink-0">
          {STATS.map((stat) => (
            <div key={stat.label} className={`${stat.col} content-stretch flex flex-col items-start justify-self-stretch relative row-1 self-stretch shrink-0`}>
              <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
                <p className="[word-break:break-word] font-black leading-[40px] not-italic relative shrink-0 text-[36px] text-center text-white whitespace-nowrap">{stat.value}</p>
              </div>
              <div className="content-stretch flex flex-col h-[26px] items-center pt-[6px] relative shrink-0 w-[264px]">
                <p className="[word-break:break-word] font-normal leading-[20px] not-italic relative shrink-0 text-[#6f6f6f] text-[14px] text-center whitespace-nowrap">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}