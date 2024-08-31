interface ReferralData {
    referrals: {[userId: string]: string[]};
    referredBy: {[userId: string]: string};
}

let storage: ReferralData = {
    referrals: {},
    referredBy: {},
}

export function saveReferral(userId: string, referrerId: string) {
    if (!storage.referrals[referrerId]) {
        storage.referrals[referrerId] = [];
    }
    storage.referrals[referrerId].push(userId);
    storage.referredBy[referrerId] = referrerId;
}

export function getReferrals(userId: string) {
    return storage.referrals[userId] || [];
}

export function getReferrer(userId: string) {
    return storage.referredBy[userId] || null;
}


