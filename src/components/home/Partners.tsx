const partners = [
  { name: "Huawei", logo: "/logos/huawei.svg" },
  { name: "Pure Storage", logo: "/logos/purestorage.svg" },
  { name: "Commvault", logo: "/logos/commvault.svg" },
];

export default function Partners() {
  return (
    <section className="bg-[#0d1117] border-y border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-bold tracking-widest text-gray-500 uppercase mb-8">
          Unsere Partner
        </p>
        <div className="flex flex-wrap items-center justify-center gap-14">
          {partners.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity"
            >
              <div className="bg-white rounded p-1.5 w-10 h-10 flex items-center justify-center">
                <img src={p.logo} alt={p.name} className="w-8 h-8 object-contain" />
              </div>
              <span className="text-gray-300 font-bold text-sm tracking-wide uppercase">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
