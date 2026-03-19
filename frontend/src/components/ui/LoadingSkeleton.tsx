export const LoadingSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-16 rounded-lg" />
      ))}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="card p-6">
      <div className="skeleton h-4 w-24 mb-2 rounded" />
      <div className="skeleton h-8 w-32 rounded" />
    </div>
  );
};
