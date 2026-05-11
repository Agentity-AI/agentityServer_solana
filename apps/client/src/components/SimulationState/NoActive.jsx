import { TestTube } from "lucide-react"

function NoActive() {
  return (
    <div>
        <h2 className="text-2xl font-semibold text-center mt-10 text-[#f3eded]">Ready to Run</h2>
        <TestTube className="w-16 h-16 text-[#f3eded] mx-auto mt-4 animate-pulse" />
        <p className="text-center text-base-content/60 mt-2">No active simulations. Start a new simulation to see results here.</p>
    </div>
  )
}

export default NoActive