// components/Mermaid.tsx
"use client";

import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";

// Minka brand colors for Mermaid diagrams
const minkaTheme = {
  // Primary brand colors (professional blue/teal palette)
  primaryColor: "#1E40AF", // Deep blue - trust and reliability
  primaryTextColor: "#FFFFFF",
  primaryBorderColor: "#3B82F6", // Lighter blue accent
  secondaryColor: "#10B981", // Green - success and growth
  secondaryTextColor: "#FFFFFF",
  secondaryBorderColor: "#059669",
  tertiaryColor: "#6366F1", // Indigo - innovation
  tertiaryTextColor: "#FFFFFF",
  tertiaryBorderColor: "#4F46E5",
  // Background and text
  background: "#F8FAFC", // Light background
  mainBkgColor: "#FFFFFF",
  secondBkgColor: "#F1F5F9",
  textColor: "#1E293B", // Dark slate
  // Lines and connectors
  lineColor: "#64748B", // Medium gray
  border1: "#CBD5E1",
  border2: "#94A3B8",
  // Notes and labels
  noteBkgColor: "#FEF3C7", // Light yellow
  noteTextColor: "#78350F",
  noteBorderColor: "#FCD34D",
  // Special states
  errorBkgColor: "#FEE2E2", // Light red
  errorTextColor: "#991B1B",
};

const minkaDarkTheme = {
  // Dark theme variant
  primaryColor: "#3B82F6", // Brighter blue for dark mode
  primaryTextColor: "#FFFFFF",
  primaryBorderColor: "#60A5FA",
  secondaryColor: "#10B981",
  secondaryTextColor: "#FFFFFF",
  secondaryBorderColor: "#34D399",
  tertiaryColor: "#818CF8",
  tertiaryTextColor: "#FFFFFF",
  tertiaryBorderColor: "#A5B4FC",
  background: "#1E293B", // Dark background for better contrast
  mainBkgColor: "#1E293B",
  secondBkgColor: "#334155",
  textColor: "#FFFFFF", // Bright white text for better contrast
  lineColor: "#64748B",
  border1: "#475569",
  border2: "#64748B",
  noteBkgColor: "#78350F",
  noteTextColor: "#FBBF24", // Darker amber for better readability
  noteBorderColor: "#F59E0B",
  errorBkgColor: "#7F1D1D",
  errorTextColor: "#FCA5A5",
  // Message text colors
  messageTextColor: "#FFFFFF",
  messageBkgColor: "transparent",
};

export function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const id = useId();
  const { theme } = useTheme();

  useEffect(() => {
    const isDark = theme === "dark";
    const themeConfig = isDark ? minkaDarkTheme : minkaTheme;

    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      themeVariables: themeConfig,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "basis",
      },
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        mirrorActors: true,
        bottomMarginAdj: 1,
        useMaxWidth: true,
        rightAngles: false,
        showSequenceNumbers: false,
      },
    });

    mermaid.render(id, chart).then(({ svg }) => {
      setSvg(svg);
    });
  }, [chart, id, theme]);

  if (!svg) return null;
  return (
    <div 
      className="mermaid-container my-6"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
}