import { get } from '@vercel/edge-config'; // Removed set import

// Removed unused interface
// interface ReferralData {
//   [userId: string]: string | null;
// }

export async function saveReferralData(userId: string, referrerId: string | null) {
  const referralStorage: { [key: string]: string | null } = (await get('referralStorage')) || {};
  if (!referralStorage[userId]) {
    referralStorage[userId] = referrerId;
    // await set('referralStorage', referralStorage); // Removed this line
  }
}

export async function getAllReferrals(userId: string): Promise<string[]> {
  const referralStorage = await get('referralStorage') || {};
  return Object.entries(referralStorage)
    .filter(([, referrer]) => referrer === userId)
    .map(([referredUser]) => referredUser);
}

export async function getReferrer(userId: string): Promise<string | null> {
  const referralStorage = (await get('referralStorage')) as { [key: string]: string | null } || {};
  return referralStorage[userId] || null;
}
