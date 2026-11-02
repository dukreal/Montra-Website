const STARS = [0, 1, 2, 3, 4]

export default function StarRating({ icon, sizeClass, className = '' }) {
  return (
    <div className={`content-stretch flex gap-[2px] items-start relative shrink-0 ${className}`}>
      {STARS.map((star) => (
        <div key={star} className={`relative shrink-0 ${sizeClass}`}>
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={icon} />
        </div>
      ))}
    </div>
  )
}