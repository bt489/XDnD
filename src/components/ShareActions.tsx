"use client";

import { useState } from "react";
import type { DndCharacter } from "@/types";

interface ShareActionsProps {
  character: DndCharacter;
  handle: string;
}

export default function ShareActions({ character, handle }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);

  const tweetText = `I'm a Level ${character.level} ${character.race} ${character.class} (${character.alignment})\n\nMy flaw: ${character.flaw}\n\nMy signature ability: ${character.signatureAbility.name}\n\nFind your D&D character sheet at`;

  const handleDownloadPNG = async () => {
    const cardEl = document.querySelector(".parchment-card") as HTMLElement;
    if (!cardEl) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardEl, {
        scale: 2,
        backgroundColor: "#e8d5a8",
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `${handle}-dnd-character.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to generate PNG:", err);
    }
  };

  const handleShareTwitter = () => {
    const url = window.location.href;
    const fullText = `${tweetText} ${url}`;
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`;
    window.open(intentUrl, "_blank", "width=550,height=420");
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(tweetText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = tweetText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2.5 mt-8">
      <button onClick={handleDownloadPNG} className="btn-ghost px-4 py-2.5">
        Download PNG
      </button>
      <button onClick={handleShareTwitter} className="btn-ghost px-4 py-2.5">
        Share on X
      </button>
      <button onClick={handleCopyText} className="btn-ghost px-4 py-2.5">
        {copied ? "Copied!" : "Copy Tweet Text"}
      </button>
    </div>
  );
}
