"use client";

import { useState } from "react";
import type { Exam } from "@/types/exam";
import type { CommunityPost } from "@/types/exam";
import { Avatar } from "@/components/ui/Avatar";

interface DetailCommunityProps {
  exam: Exam;
  t: {
    subtext: string;
    surface: string;
    border: string;
    text: string;
    muted: string;
  };
}

export function DetailCommunity({ exam, t }: DetailCommunityProps) {
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState<CommunityPost[]>(exam.communityPosts);

  return (
    <div style={{ maxWidth: "680px", animation: "fadeUp 0.3s ease" }}>
      <div
        style={{
          fontSize: "22px",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          marginBottom: "6px",
        }}
      >
        Community
      </div>
      <div
        style={{
          fontSize: "12px",
          color: t.subtext,
          fontFamily: "'DM Mono', monospace",
          marginBottom: "20px",
        }}
      >
        {exam.online.toLocaleString()} studying now · {exam.members} members
      </div>

      <div
        style={{
          background: t.surface,
          borderRadius: "10px",
          border: `1px solid ${t.border}`,
          marginBottom: "24px",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", gap: "12px", padding: "14px 16px" }}>
          <Avatar initials="ME" color={exam.color} size={34} />
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder={`Share something about ${exam.name}…`}
            rows={2}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: t.text,
              resize: "none",
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "10px 14px",
            borderTop: `1px solid ${t.border}`,
          }}
        >
          <button
            onClick={() => {
              if (!postText.trim()) return;
              setPosts((prev) => [
                {
                  user: "You",
                  avatar: "ME",
                  time: "just now",
                  text: postText,
                  likes: 0,
                },
                ...prev,
              ]);
              setPostText("");
            }}
            style={{
              padding: "7px 18px",
              borderRadius: "100px",
              border: "none",
              background: exam.color,
              color: "white",
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.05em",
            }}
          >
            POST
          </button>
        </div>
      </div>

      {posts.map((post, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "12px",
            padding: "16px 0",
            borderBottom: `1px solid ${t.border}`,
            animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
          }}
        >
          <Avatar initials={post.avatar} color={exam.color} size={36} />
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "8px",
                marginBottom: "5px",
              }}
            >
              <span style={{ fontWeight: 800, fontSize: "13px" }}>{post.user}</span>
              <span
                style={{
                  fontSize: "10px",
                  color: t.muted,
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {post.time}
              </span>
            </div>
            <div
              style={{ fontSize: "14px", lineHeight: 1.6, color: t.text }}
            >
              {post.text}
            </div>
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginTop: "8px",
              }}
            >
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: t.muted,
                  fontSize: "11px",
                  fontFamily: "'DM Mono', monospace",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                ♥ {post.likes}
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: t.muted,
                  fontSize: "11px",
                  fontFamily: "'DM Mono', monospace",
                  cursor: "pointer",
                }}
              >
                ↩ reply
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
