function PolicyCard({ policyName, max, daily}) {
    return (
        <div className="bg-[#1f1f1f] p-4 rounded-lg shadow-md w-full">
          <h3 className="text-lg font-semibold mb-2">{policyName}</h3>
          <p className="text-sm text-gray-400 mb-1">Max: {max}</p>
          <p className="text-sm text-gray-400">Daily: {daily}</p> 
        </div>
    )
}

export default PolicyCard
