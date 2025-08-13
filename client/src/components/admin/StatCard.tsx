interface StatCardProps {
  title: string;
  value: string;
  status?: string;
  icon?: string;
  isGradient?: boolean;
}


export default function StatCard({ title, value, status, icon, isGradient = false }: StatCardProps) {
  return (
    <div
      className={`rounded-xl p-5 text-white transition-all duration-300 ${
        isGradient
          ? "bg-gradient-to-br from-[#001C30] to-[#176B87]"
          : "bg-[#071822] border border-gray-700 hover:bg-gradient-to-br hover:from-[#001C30] hover:to-[#176B87]"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs font-semibold select-text">{title}</p>
        <button
          aria-label={`Open ${title.toLowerCase()} details`}
          className="text-white text-xs border border-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-white hover:text-[#001C30] transition"
        >
          <i className="fas fa-arrow-up-right"></i>
        </button>
      </div>
      <p className="text-3xl font-bold select-text">{value}</p>
      {status && (
        <div
          className={`flex items-center gap-1 mt-2 text-xs font-semibold rounded-md px-2 py-1 w-max ${
            isGradient ? "bg-[#144E63]" : "text-[#176B87]"
          }`}
        >
          {icon && <i className={icon}></i>}
          <span>{status}</span>
        </div>
      )}
    </div>
  );
}