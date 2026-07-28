for (const host of ['https://claude.ai', 'https://assets-proxy.anthropic.com', 'https://a.claude.ai']) {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = host;
  link.crossOrigin = '';
  document.documentElement.append(link);
}
