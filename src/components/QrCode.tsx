"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";
import { t } from "@/lib/strings";
import { CheckIcon, CopyIcon, DownloadIcon } from "./icons";
import { Button } from "./ui";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fonfonapp.com.br";

export const linkUrl = (code: string) => `${SITE}/v/${encodeURIComponent(code)}`;

function downloadPng(svg: SVGSVGElement, filename: string) {
  const size = 768;
  const xml = new XMLSerializer().serializeToString(svg);
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size, size);
    context.drawImage(image, 0, 0, size, size);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = filename;
    link.click();
  };
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
}

export function CodeCard({ code }: { code: string }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function download() {
    const svg = wrapper.current?.querySelector("svg");
    if (svg) downloadPng(svg, `fonfon-${code}.png`);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={wrapper} className="rounded-small border border-card-border bg-white p-3">
        <QRCodeSVG
          value={linkUrl(code)}
          size={160}
          marginSize={0}
          level="M"
          role="img"
          aria-label={t.code.qrLabel(code)}
        />
      </div>
      <p className="select-all font-brand text-3xl tracking-[0.25em] text-ink">{code}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={copy}>
          {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
          {copied ? t.code.copied : t.code.copy}
        </Button>
        <Button variant="secondary" onClick={download}>
          <DownloadIcon className="size-4" />
          {t.code.download}
        </Button>
      </div>
    </div>
  );
}
