// components/Mermaid.tsx
"use client";

import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";

export function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const id = useId();
  const { theme } = useTheme();

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
    });

    mermaid.render(id, chart).then(({ svg }) => {
      setSvg(svg);
    });
  }, [chart, id, theme]);

  if (!svg) return null;
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}