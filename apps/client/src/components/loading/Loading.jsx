import { TailSpin } from "react-loader-spinner";

export function Loading() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
      <TailSpin
        height={32}
        width={32}
        color="#2563eb"
        ariaLabel="loading"
      />
    </div>
  );
}
