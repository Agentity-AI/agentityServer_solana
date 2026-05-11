function SimulationTable({ agent }) {


  
  return (
          <tr className="py-2 h-10 w-full rounded-b-2xl border-b border-[#5c5959] px-4  hover:bg-[#2f2f2f]
          text-left text-sm text-base-content/60">
            <td className="px-8">{agent.agentName}</td>
            <td className="px-8">{agent.scenario}</td>
            <td className="px-8">{agent.riskScore}</td>
            <td className="px-8">{agent.vulnerabilities}</td>
            <td className=" capitalize">{agent.status}</td>
          </tr>
  );
}

export default SimulationTable;
