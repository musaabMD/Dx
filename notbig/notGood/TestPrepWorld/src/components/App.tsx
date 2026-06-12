"use client";

import { useState } from "react";
import { BrowsePage } from "./browse/BrowsePage";

export function App() {
  const [dark, setDark] = useState(true);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Bricolage+Grotesque:wght@500;700;900&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        input, textarea { outline:none; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(128,128,128,0.25); border-radius:3px; }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
      <BrowsePage dark={dark} setDark={setDark} />
    </>
  );
}
