"use client";

import { useEffect, useState } from "react";

/** URL 带 `?demo=1` 时启用宣传截图用演示数据（界面不展示任何 demo/mock 字样） */
export function useDemoMode() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEnabled(params.get("demo") === "1");
  }, []);

  return enabled;
}

export const DEMO_HOUSEHOLD_NAME = "Sunrise Family";
