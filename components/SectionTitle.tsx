type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

export default function SectionTitle({
  title,
  subtitle,
}: SectionTitleProps) {
  return (
    <div className="mb-16">

      {/* פס עליון */}
      <div className="flex items-center justify-center">

        <div
          className="w-24 md:w-40 h-[2px]"
          style={{
            background:
              "linear-gradient(to left, transparent, #D4AF37)",
          }}
        />

        <span className="mx-4 text-[#D4AF37] text-sm">◆</span>

        <span className="uppercase tracking-[8px] text-[#D4AF37] text-xs md:text-sm font-semibold whitespace-nowrap">
          Maestro Events
        </span>

        <span className="mx-4 text-[#D4AF37] text-sm">◆</span>

        <div
          className="w-24 md:w-40 h-[2px]"
          style={{
            background:
              "linear-gradient(to right, transparent, #D4AF37)",
          }}
        />

      </div>

      {/* כותרת */}
      <h2 className="mt-8 text-center text-4xl md:text-5xl font-bold text-[#D4AF37]">
        {title}
      </h2>

      {/* תיאור */}
      {subtitle && (
        <p className="mt-4 text-center text-gray-400 text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}

    </div>
  );
}