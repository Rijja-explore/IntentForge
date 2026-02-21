export default function LoadingSkeleton({ className = '' }) {
  return (
    <div
      className={`
        bg-white/5 rounded-xl animate-pulse
        ${className}
      `}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="backdrop-blur-md bg-gradient-glass border border-white/10 rounded-2xl p-6 shadow-glass">
      <LoadingSkeleton className="h-4 w-1/3 mb-4" />
      <LoadingSkeleton className="h-8 w-2/3 mb-2" />
      <LoadingSkeleton className="h-3 w-full mb-2" />
      <LoadingSkeleton className="h-3 w-4/5" />
    </div>
  );
}
