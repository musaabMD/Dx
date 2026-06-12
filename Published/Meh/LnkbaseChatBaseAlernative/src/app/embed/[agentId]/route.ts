import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const origin = new URL(req.url).origin;
  const widgetUrl = `${origin}/widget/${agentId}`;

  const script = `
(function () {
  if (window.__lnkbaseWidgetLoaded) return;
  window.__lnkbaseWidgetLoaded = true;

  var button = document.createElement("button");
  button.setAttribute("aria-label", "Open chat");
  button.style.cssText = "position:fixed;right:24px;bottom:24px;z-index:999999;width:60px;height:60px;border-radius:999px;border:0;background:#6b5cff;color:#fff;box-shadow:0 18px 50px rgba(42,31,150,.28);font:600 24px system-ui;cursor:pointer;";
  button.textContent = "✦";

  var frame = document.createElement("iframe");
  frame.src = ${JSON.stringify(widgetUrl)};
  frame.title = "Lnkbase AI assistant";
  frame.allow = "clipboard-write";
  frame.style.cssText = "position:fixed;right:24px;bottom:96px;z-index:999999;width:min(420px,calc(100vw - 32px));height:min(680px,calc(100vh - 128px));border:1px solid rgba(0,0,0,.12);border-radius:24px;background:white;box-shadow:0 24px 80px rgba(0,0,0,.22);display:none;";

  button.onclick = function () {
    var open = frame.style.display === "block";
    frame.style.display = open ? "none" : "block";
    button.textContent = open ? "✦" : "⌄";
  };

  document.body.appendChild(frame);
  document.body.appendChild(button);
})();`;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}
