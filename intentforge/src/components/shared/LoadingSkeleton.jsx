export default function LoadingSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-violet-100 rounded-full animate-pulse"
          style={{ width: `${60 + Math.random() * 40}%` }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-violet-100 rounded-2xl p-6 shadow-glass">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-violet-100 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-violet-100 rounded-full w-2/3 animate-pulse" />
          <div className="h-3 bg-violet-50 rounded-full w-1/2 animate-pulse" />
        </div>
      </div>
      <LoadingSkeleton lines={3} />
    </div>
  );
}
