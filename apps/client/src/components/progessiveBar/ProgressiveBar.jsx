// src/components/ProgressBar.jsx
function ProgressBar({ value }) {
  // value is a number from 0 to 100
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="w-20 bg-neutral-800 rounded-full h-3 overflow-hidden">
      <div
        className={`h-full ${value > 70 ? 'bg-emerald-500' : value > 40 ? 'bg-amber-500' : 'bg-rose-500'}  transition-all duration-300`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export default ProgressBar;
