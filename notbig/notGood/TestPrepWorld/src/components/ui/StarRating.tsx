interface StarRatingProps {
  rating: number;
}

export function StarRating({ rating }: StarRatingProps) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{
            fontSize: "12px",
            color: s <= rating ? "#fbbf24" : "rgba(255,255,255,0.15)",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
