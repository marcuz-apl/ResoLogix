import crypto from 'crypto';

export function generateHumanId(prefix: string): string {
  const now = new Date();
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const yyyy = now.getUTCFullYear();
  const mm = pad(now.getUTCMonth() + 1);
  const dd = pad(now.getUTCDate());
  const hh = pad(now.getUTCHours());
  const min = pad(now.getUTCMinutes());
  const ss = pad(now.getUTCSeconds());
  
  const randomSuffix = crypto.randomBytes(2).toString('hex'); // 4 characters

  return `${prefix}-${yyyy}-${mm}-${dd}-${hh}-${min}-${ss}-${randomSuffix}`;
}
