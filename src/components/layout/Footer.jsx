import logo from '@/assets/images/logo.png'

function FooterColumn({ colClass, title, links, listWidth }) {
  return (
    <div className={`${colClass} content-stretch flex flex-col items-start justify-self-stretch relative row-1 self-stretch shrink-0`}>
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
        <p className="[word-break:break-word] font-bold leading-[16px] not-italic relative shrink-0 text-[#6f6f6f] text-[12px] tracking-[2.16px] uppercase whitespace-nowrap">{title}</p>
      </div>
      <ul className={`content-stretch flex flex-col h-[132px] items-start pt-[16px] relative shrink-0 ${listWidth}`}>
        {links.map((link, index) => (
          <li
            key={link}
            className={
              index === 0
                ? 'content-stretch flex flex-col items-start relative shrink-0 w-full'
                : `content-stretch flex flex-col h-[32px] items-start pt-[12px] relative shrink-0 ${listWidth}`
            }
          >
            <p className="[word-break:break-word] font-normal leading-[20px] not-italic relative shrink-0 text-[#a3a3a3] text-[14px] whitespace-nowrap">{link}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="border-[#242424] border-solid border-t content-stretch flex flex-col items-start relative shrink-0 w-full">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
        <div className="gap-x-[40px] gap-y-[40px] grid grid-cols-[___441.41px_315.30px_315.28px] grid-rows-[_164px] max-w-[1200px] px-[24px] py-[56px] relative shrink-0 w-[1200px]">
          <div className="col-1 content-stretch flex flex-col items-start justify-self-stretch relative row-1 self-stretch shrink-0">
            <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full">
              <div className="bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] border-solid grid grid-cols-[_38px] grid-rows-[_38px] relative rounded-[12px] shrink-0 size-[40px]">
                <div className="col-1 justify-self-center relative row-1 self-center shrink-0 size-[26px]">
                  <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={logo} />
                </div>
              </div>
              <div className="content-stretch flex flex-col items-start relative shrink-0">
                <p className="[word-break:break-word] font-black leading-[37.5px] not-italic relative shrink-0 text-[25px] text-white tracking-[-0.625px] whitespace-nowrap">Motra</p>
              </div>
            </div>
            <div className="content-stretch flex flex-col items-start pt-[16px] relative shrink-0">
              <p className="[word-break:break-word] font-normal leading-[20px] not-italic relative shrink-0 text-[#a3a3a3] text-[14px] w-[320px]">Money clarity, one tap at a time. A personal money tracker built for real, everyday spending.</p>
            </div>
          </div>

          <FooterColumn
            colClass="col-2"
            title="Product"
            links={['Features', 'How it works', 'Benefits', 'Reviews']}
            listWidth="w-[315.297px]"
          />
          <FooterColumn
            colClass="col-3"
            title="Company"
            links={['About', 'Privacy Policy', 'Terms', 'Contact']}
            listWidth="w-[315.281px]"
          />
        </div>
      </div>

      <div className="border-[#242424] border-solid border-t content-stretch flex flex-col items-start relative shrink-0 w-full">
        <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
          <div className="content-stretch flex items-center justify-between max-w-[1200px] p-[24px] relative shrink-0 w-[1200px]">
            <div className="content-stretch flex flex-col items-start relative shrink-0">
              <p className="[word-break:break-word] font-normal leading-[16px] not-italic relative shrink-0 text-[#6f6f6f] text-[12px] whitespace-nowrap">© 2026 Motra. All rights reserved.</p>
            </div>
            <div className="content-stretch flex flex-col items-start relative shrink-0">
              <p className="[word-break:break-word] font-normal leading-[16px] not-italic relative shrink-0 text-[#6f6f6f] text-[12px] whitespace-nowrap">Rent by clarity. Rewards in savings.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}