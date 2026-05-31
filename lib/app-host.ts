/** 从 Host 头解析主机名（不含端口） */
export function parseHostname(host: string): string {
  return (host.split(":")[0] ?? host).trim().toLowerCase();
}

/** Web 控制台子域：app.wefamily.ai、app.localhost（任意端口） */
export function isAppSubdomainHost(host: string): boolean {
  const hostname = parseHostname(host);
  return hostname === "app.wefamily.ai" || hostname === "app.localhost";
}

export function isConsolePath(pathname: string): boolean {
  return pathname === "/console" || pathname.startsWith("/console/");
}
