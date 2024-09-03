import { createClient } from "edgedb";

const client = createClient();

export async function saveUserData(telegramId: string, aicoreBalance: number, walletBalance: number, dayCount: number) {
  await client.query(`
    INSERT User {
      telegram_id := <str>$telegramId,
      aicore_balance := <float64>$aicoreBalance,
      wallet_balance := <float64>$walletBalance,
      day_count := <int64>$dayCount
    }
    ON CONFLICT (telegram_id) DO UPDATE
    SET {
      aicore_balance := <float64>$aicoreBalance,
      wallet_balance := <float64>$walletBalance,
      day_count := <int64>$dayCount
    }
  `, { telegramId, aicoreBalance, walletBalance, dayCount });
}

export async function getUserData(telegramId: string) {
  const result = await client.query(`
    SELECT User {
      aicore_balance,
      wallet_balance,
      day_count
    }
    FILTER .telegram_id = <str>$telegramId
  `, { telegramId });

  return result[0] || null;
}