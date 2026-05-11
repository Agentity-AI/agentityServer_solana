function SideIcon({ name, color = "currentColor" }) {
  const commonProps = {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: color,
    className: "w-6 h-6",
  };

  switch (name) {
    case "Dashboard":
      return (
        <svg {...commonProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"
          />
        </svg>
      );

    case "Agents":
      return (
        <svg {...commonProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.9 17.9 0 0112 21c-2.676 0-5.216-.584-7.5-1.882z"
          />
        </svg>
      );

    case "Verified Agents":
      return (
        <svg {...commonProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 5.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.868a7.5 7.5 0 0110.5-6.918"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.5 13.75a3.25 3.25 0 11-3.25 3.25 3.25 3.25 0 013.25-3.25z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m17.2 16.8 1.1 1.1 2-2.1"
          />
        </svg>
      );

    case "Simulations":
      return (
        <svg {...commonProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 3h6M10 3v6.5L6.5 19a2 2 0 001.9 3h7.2a2 2 0 001.9-3L14 9.5V3"
          />
        </svg>
      );

    case "Transactions":
      return (
        <svg {...commonProps}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18M7 14h3" />
        </svg>
      );

    case "Smart Contracts Audits":
      return (
        <svg {...commonProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3l7 3v5.5c0 3.8-2.5 7.2-7 9.5-4.5-2.3-7-5.7-7-9.5V6l7-3z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v4M12 16h.01"
          />
        </svg>
      );

    case "Alerts":
      return (
        <svg {...commonProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 19a2 2 0 004 0M6 9a6 6 0 1112 0c0 3 1 5 1 5H5s1-2 1-5z"
          />
        </svg>
      );

    case "Docs":
      return (
        <svg {...commonProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 4h6a3 3 0 013 3v13H9a3 3 0 00-3 3V4zM12 4h6a3 3 0 013 3v13h-6"
          />
        </svg>
      );

    case "Settings":
      return (
        <svg {...commonProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 3.5l1.5-1 1.5 1 .9 1.8 2 .3 1 1.7-1.2 1.6.3 2.1 1.5 1-1 1.9-2 .3-.9 1.8-1.5 1-1.5-1-.9-1.8-2-.3-1-1.9 1.5-1-.3-2.1-1.2-1.6 1-1.7 2-.3.9-1.8z"
          />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );

    case "Money":
      return (
        <svg {...commonProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v18M9 6.5C9 5.12 10.12 4 11.5 4h1c1.38 0 2.5.9 2.5 2.25C15 8 13.8 8.75 12.5 9.1l-1 .3C10.2 9.8 9 10.5 9 12c0 1.65 1.35 3 3 3 1.65 0 3-1.35 3-3"
          />
        </svg>
      );

    // NEW: total alerts – bell
    case "TotalAlerts":
      return (
        <svg {...commonProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 19a2 2 0 004 0M6 9a6 6 0 1112 0c0 3 1 5 1 5H5s1-2 1-5z"
          />
        </svg>
      );

    // NEW: active alerts – warning triangle
    case "ActiveAlerts":
      return (
        <svg {...commonProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3.5 3.5 19h17L12 3.5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 10v4M12 16.5h.01"
          />
        </svg>
      );

    // NEW: critical alerts – circle X
    case "CriticalAlerts":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 9l6 6M15 9l-6 6"
          />
        </svg>
      );

    // NEW: resolved alerts – circle check
    case "ResolvedAlerts":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.5l2.5 2.5L16 9.5"
          />
        </svg>
      );
      case "SDK & Documentation":
        return (
          <svg {...commonProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 3h6a3 3 0 013 3v13H9a3 3 0 00-3 3V4zM12 4h6a3 3 0 013 3v13h-6"
            />
          </svg>
        );
    default:
      return null;
  }
}

export default SideIcon;
