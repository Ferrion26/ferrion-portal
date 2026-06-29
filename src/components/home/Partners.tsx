const partners = [
  { name: "Huawei", logo: "/logos/Huawei_Standard_logo.svg.png" },
  { name: "Pure Storage", logo: "/logos/Pure Storage Bug Orange_undefined.PNG" },
  { name: "Commvault", logo: "/logos/cropped-favicon-commvault-1.png" },
];

export default function Partners() {
  return (
    <section className="bg-[#0d1117] border-y border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-bold tracking-widest text-gray-500 uppercase mb-8">
          Unsere Partner
        </p>
        <div className="flex flex-wrap items-center justify-center gap-16">
          {partners.map((p) => (
            <div key={p.name} className="opacity-60 hover:opacity-100 transition-opacity">
              <img
                src={p.logo}
                alt={p.name}
                className="h-10 w-auto object-contain"
                style={{ mixBlendMode: "screen" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
