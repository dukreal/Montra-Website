export default function IconTile({ icon, tint }: { icon: React.ReactNode; tint: string }) {
  return (
    <span className="grid place-items-center rounded-2xl" style={{ width: 52, height: 52, background: tint + "1f" }}>
      {icon}
    </span>
  );
}
