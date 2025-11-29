function BorderAnimatedContainer({ children }) {
  const wrapperStyle = {
    borderRadius: "1rem",
    padding: "2px",
    background:
      "conic-gradient(from var(--border-angle), rgba(148,163,184,0.1) 80%, rgba(6,182,212,1) 86%, rgba(99,102,241,1) 90%, rgba(6,182,212,1) 94%, rgba(148,163,184,1))",
    animation: "border 4s linear infinite",
    overflow: "hidden",

    // ⭐ IMPORTANT FIX — prevent border layer from blocking clicks
    pointerEvents: "none",
  };

  const innerStyle = {
    borderRadius: "calc(1rem - 2px)",
    width: "100%",
    height: "100%",
    background: "rgb(15, 23, 42)", // solid slate-900-like background
    pointerEvents: "auto", // allow clicks inside
  };

  return (
    <div style={wrapperStyle}>
      <div style={innerStyle}>{children}</div>
    </div>
  );
}

export default BorderAnimatedContainer;
