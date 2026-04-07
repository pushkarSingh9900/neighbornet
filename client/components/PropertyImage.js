export default function PropertyImage({ src, alt, className = "", overlayLabel = "NeighborNet" }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover ${className}`.trim()}
      />
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-teal-500 via-cyan-400 to-emerald-300 ${className}`.trim()}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.22),transparent_36%)]" />
      <div className="relative flex h-full w-full items-end p-5">
        <div className="rounded-2xl bg-white/15 px-4 py-3 text-white backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80">
            {overlayLabel}
          </p>
          <p className="mt-1 text-lg font-semibold">{alt}</p>
        </div>
      </div>
    </div>
  );
}
