interface PlanCardProps {
  id: string;
  title: string;
  emoji: string;
  time: string;
}

export default function PlanCard({ id, title, emoji, time }: PlanCardProps) {
  return (
    <a
      href={`/plan/${id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col items-center justify-center text-center p-3 active:scale-[0.97] transition-transform hover:shadow-md"
    >
      <div className="text-4xl mb-2">{emoji}</div>
      <h2 className="font-semibold text-sm truncate">{title}</h2>
      <p className="text-gray-400 text-xs mt-1">{time}</p>
    </a>
  );
}
