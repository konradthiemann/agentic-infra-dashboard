export function toGithubUrl(remote: string | null): string | null {
  if (!remote) return null;
  const sshMatch = remote.match(/^git@github\.com:(.+?)(\.git)?$/);
  if (sshMatch) return `https://github.com/${sshMatch[1]}`;
  const httpsMatch = remote.match(/^(https:\/\/github\.com\/.+?)(\.git)?$/);
  if (httpsMatch) return httpsMatch[1];
  return null;
}

export function slugFromGithubUrl(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/github\.com\/([^/]+\/[^/]+)$/);
  return match ? match[1] : null;
}
