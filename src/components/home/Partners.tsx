const partners = [
  { name: "Huawei", color: "#e31937" },
  { name: "Pure Storage", color: "#ff6600" },
  { name: "Commvault", color: "#0066cc" },
  { name: "VMware", color: "#607078" },
  { name: "Microsoft", color: "#0078d4" },
  { name: "Veeam", color: "#00b336" },
];

export default function Partners() {
  return (
    <section className="bg-[#0d1117] border-y border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-bold tracking-widest text-gray-500 uppercase mb-8">
          Unsere Partner
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10">
          {partners.map((p) => (
            <div key={p.name} className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
              <div
                className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: p.color }}
              >
                {p.name[0]}
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
