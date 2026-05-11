const Finished = ({ data }) => {
  const created = new Date(data.createdAt).toLocaleString();


  return (
    <div className="h-125 rounded-xl border p-4 text-sm text-white/90">
      {/* Agent */}
      <div className="mb-2">
        <div className="text-[0.7rem] uppercase tracking-[0.12em] text-white/60">
          Agent
        </div>
        <div className="font-semibold">
          {data.agentName}{' '}
          <span className="text-gray-400">
            ({data.agentId.slice(0, 8)}…)
          </span>
        </div>
        <div className="text-[0.75rem] text-white/60">
          Run ID: {data.id.slice(0, 8)}…
        </div>
        <div className="text-[0.75rem] text-white/60">
          Created: {created}
        </div>
      </div>

      <hr className="my-2 border-t border-gray-800" />

      {/* Parameters */}
      <div className="mb-2">
        <div className="text-[0.7rem] uppercase tracking-[0.12em] text-white/60">
          Parameters
        </div>
        <div>
          <span className="font-medium">{data.parameters.amount}</span>{' '}
          <span>{data.parameters.tokenIn}</span> →{' '}
          <span>{data.parameters.tokenOut}</span>
        </div>
      </div>

      <hr className="my-2 border-t border-gray-800" />

      {/* Scenario + Status */}
      <div className="mb-1 flex justify-between">
        <div>
          <div className="text-[0.7rem] uppercase tracking-[0.12em] text-gray-400">
            Scenario
          </div>
          <div>{data.result.scenario}</div>
        </div>
        <div className="text-right">
          <div className="text-[0.7rem] uppercase tracking-[0.12em] text-gray-400">
            Status
          </div>
          <div
          >
            {data.result.status}
          </div>
        </div>
      </div>

      {/* Risk & Vulnerabilities */}
      <div className="mb-1 flex justify-between">
        <div>
          <div className="text-[0.7rem] uppercase tracking-[0.12em] text-gray-500">
            Risk score
          </div>
          <div>{data.result.riskScore}/100</div>
        </div>
        <div className="text-right">
          <div className="text-[0.7rem] uppercase tracking-[0.12em] text-gray-500">
            Vulnerabilities
          </div>
          <div>{data.result.vulnerabilities}</div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-2">
        <div className="text-[0.7rem] uppercase tracking-[0.12em] text-gray-500">
          Summary
        </div>
        <div className="text-gray-600">{data.result.summary}</div>
      </div>
    </div>
  );
};

export default Finished;