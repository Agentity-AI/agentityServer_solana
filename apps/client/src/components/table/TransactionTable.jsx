import { Box, ExternalLink } from "lucide-react";

function TransactionTable({
  transactionId,
  agentName,
  type,
  amount,
  riskRating,     // e.g. "High", "Medium", "Low" or a number
  status,         // e.g. "Pending", "Approved", "Rejected"
  date,           // e.g. "2023-09-15"
  txHash,
  explorerUrl,
}) {
  // simple color helpers
  const normalizedStatus = String(status || "").toLowerCase();
  const normalizedRisk = String(riskRating || "").toLowerCase();
  const statusColor =
    ["paid", "completed", "approved", "success"].includes(normalizedStatus)
      ? "text-green-500"
      : ["failed", "rejected", "critical"].includes(normalizedStatus)
      ? "text-red-500"
      : "text-yellow-500";

  const riskColor =
    normalizedRisk === "high" || normalizedRisk === "critical"
      ? "text-red-500"
      : normalizedRisk === "medium"
      ? "text-yellow-400"
      : "text-green-500";
  const shortId = transactionId
    ? `${String(transactionId).slice(0, 8)}...${String(transactionId).slice(-4)}`
    : "N/A";
  const shortHash = txHash
    ? `${String(txHash).slice(0, 8)}...${String(txHash).slice(-4)}`
    : null;

  return (
    <tr className="py-2 h-10 w-full grid grid-cols-8 border-b border-[#514c4c] px-4 hover:bg-[#2f2f2f]">
      <td className="text-left text-sm text-base-content/60">
        <span title={transactionId}>{shortId}</span>
      </td>

      <td className="text-left text-sm text-base-content/60">
        {agentName}
      </td>

      <td className="text-left text-sm text-base-content/60">
        {type}
      </td>

      <td className="text-left text-sm text-base-content/60">
        {amount}
      </td>

      <td
        className={`text-left text-sm flex items-center gap-1 ${riskColor}`}
      >
        <Box className="w-4 h-4" />
        <span>{riskRating}</span>
      </td>

      <td
        className={`text-left text-sm flex items-center gap-1 ${statusColor}`}
      >
        <span className="w-2 h-2 rounded-full bg-current" />
        <span>{status}</span>
      </td>

      <td className="text-left text-sm text-base-content/60">
        {date}
      </td>

      <td className="text-left text-sm text-base-content/60 flex items-center">
        {explorerUrl ? (
          <a
            className="btn btn-sm btn-outline inline-flex items-center gap-1"
            href={explorerUrl}
            target="_blank"
            rel="noreferrer"
            title={txHash}
          >
            <ExternalLink className="h-4 w-4" />
            {shortHash || "view"}
          </a>
        ) : (
          <span className="text-xs text-gray-500">local</span>
        )}

       
       
      </td>
    </tr>
  );
}

export default TransactionTable;
