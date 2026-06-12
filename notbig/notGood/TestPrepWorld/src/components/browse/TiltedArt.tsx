interface TiltedArtProps {
  name: string;
}

export function TiltedArt({ name }: TiltedArtProps) {
  const short = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase();
  return (
    <div
      style={{
        position: "absolute",
        bottom: "-12px",
        right: "-10px",
        width: "110px",
        height: "110px",
        borderRadius: "8px",
        transform: "rotate(-20deg)",
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.28), rgba(255,255,255,0.07))",
        boxShadow: "4px 8px 24px rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "-30%",
          width: "60%",
          height: "100%",
          background:
            "linear-gradient(105deg, rgba(255,255,255,0.18), transparent)",
          pointerEvents: "none",
        }}
      />
      <span
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: "24px",
          color: "rgba(255,255,255,0.95)",
          letterSpacing: "0.06em",
          textShadow: "0 2px 6px rgba(0,0,0,0.35)",
          userSelect: "none",
        }}
      >
        {short}
      </span>
    </div>
  );
}
