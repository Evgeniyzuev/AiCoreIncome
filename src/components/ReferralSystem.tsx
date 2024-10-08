import { useState, useEffect } from 'react'
import { initUtils } from '@telegram-apps/sdk'
import { saveReferralData, getAllReferrals, getReferrer } from '../components/storage'

const INVITE_URL = 'https://t.me/AissistIncomeBot/AissistIncomeBot/start' // Replace with your actual bot username or invite URL

interface ReferralSystemProps {
  initData: string
  userId: string
  startParam: string
}

const ReferralSystem: React.FC<ReferralSystemProps> = ({ userId, startParam }) => {
  const [referrals, setReferrals] = useState<string[]>([])
  const [referrer, setReferrer] = useState<string | null>(null)
  const [showReferrals, setShowReferrals] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        await saveReferralData(userId, startParam);
        const fetchedReferrer = await getReferrer(userId);
        setReferrer(fetchedReferrer);
        const fetchedReferrals = await getAllReferrals(userId);
        setReferrals(fetchedReferrals);
      }
    };
    fetchData();
  }, [userId, startParam]);

  const handleInviteFriend = () => {
    const utils = initUtils()
    const inviteLink = `${INVITE_URL}?startapp=${userId}`
    const shareText = `Join me on this awesome Telegram mini app!`
    const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`
    utils.openTelegramLink(fullUrl)
  }

  const handleCopyLink = () => {
    const inviteLink = `${INVITE_URL}?startapp=${userId}`
    navigator.clipboard.writeText(inviteLink)
    alert('Invite link copied to clipboard!')
  }

  const handleShowReferrals = async () => {
    if (!showReferrals) {
      const updatedReferrals = await getAllReferrals(userId);
      setReferrals(updatedReferrals);
    }
    setShowReferrals(!showReferrals);
  }

  return (
    <div className="w-full max-w-md">
      {referrer ? (
        <p className="text-green-500 mb-4">You were referred by user {referrer}</p>
      ) : (
        <p className="text-gray-500 mb-4">No referrer {startParam}</p>
      )}
      <div className="flex flex-col space-y-4">
        <button
          onClick={handleInviteFriend}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Invite Friend
        </button>
        <button
          onClick={handleCopyLink}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Copy Invite Link
        </button>
        <button
          onClick={handleShowReferrals}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          {showReferrals ? 'Hide Referrals' : 'Show Referrals'}
        </button>
      </div>
      {showReferrals && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Your Referrals</h2>
          {referrals.length > 0 ? (
            <ul>
              {referrals.map((referral, index) => (
                <li key={index} className="bg-gray-100 p-2 mb-2 rounded">
                  User {referral}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No referrals</p>
          )}
        </div>
      )}
    </div>
  )
}

export default ReferralSystem