interface ReferralData {
  [userId: string]: string | null;
}

let referralStorage: ReferralData = {};

export function saveReferralData(userId: string, referrerId: string | null) {
  if (!referralStorage[userId]) {
    referralStorage[userId] = referrerId;
  }
}

export function getAllReferrals(userId: string): string[] {
  return Object.entries(referralStorage)
    .filter(([, referrer]) => referrer === userId)
    .map(([referredUser]) => referredUser);
}

export function getReferrer(userId: string): string | null {
  return referralStorage[userId] || null;
}
