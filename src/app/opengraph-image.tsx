import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/metadata";

export const alt = `${siteConfig.name} – Decentralized Insurance on Stellar`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0F1F",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "1080px",
            height: "510px",
            borderRadius: "24px",
            backgroundColor: "#101935",
            border: "2px solid #94BCCA",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "rgba(34, 187, 249, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "32px",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 8 L32 28 L8 28 Z" fill="#22BBF9" />
            </svg>
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#FFFFFF",
              marginBottom: "16px",
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#94BCCA",
              marginBottom: "24px",
            }}
          >
            Decentralized Insurance on Stellar
          </div>
          <div style={{ fontSize: 22, color: "#64748B" }}>
            Transparent policies · Smart claims · DAO governance
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
