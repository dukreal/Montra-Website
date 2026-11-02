export default function IconTile({ tint, icon }) {
  return (
    <div className={`${tint} grid grid-cols-[_52px] grid-rows-[_52px] relative rounded-[16px] shrink-0 size-[52px]`}>
      <div className="col-1 justify-self-center relative row-1 self-center shrink-0 size-[24px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={icon} />
      </div>
    </div>
  )
}