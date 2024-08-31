'use client';

import  WebApp  from '@twa-dev/sdk';
import { useState, useEffect } from 'react';
import ReferralSystem from './components/ReferralSystem';
import { getSession } from './utils/session'
import TelegramAuth from './components/TelegramAuth'

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}



export default function Home() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [initData, setInitData] = useState('')
    const [userId, setUserId] = useState('')
    const [startParam, setStartParam] = useState('')
    const session = async () => {
        await getSession()
    }
    
    useEffect(() => {
        if (WebApp.initDataUnsafe.user) {
            setUserData(WebApp.initDataUnsafe.user as UserData);
        }
        const initWebApp = async () => {
            if (typeof window !== 'undefined') {
                const webApp = (await import('@twa-dev/sdk')).default;
                webApp.ready();
                setInitData(webApp.initData);
                setUserId(webApp.initDataUnsafe.user?.id.toString() || '');
                setStartParam(webApp.initDataUnsafe.start_param || '');
            }
        }
        initWebApp();
    }, []);
    
    return (
        <main className="p-4">
            <h1 className="text-4xl font-bold mb-8">Jwt Authentication for Telegram Mini Apps</h1>
            <pre>{JSON.stringify(session, null, 2)}</pre>
            <TelegramAuth />
            <ReferralSystem initData={initData} userId={userId} startParam={startParam}/>
            {userData ? (
                <ul>
                    <li>ID: {userData.id}</li>
                    <li>First Name: {userData.first_name}</li>
                    <li>Last Name: {userData.last_name}</li>
                    <li>Username: {userData.username}</li>
                    <li>Language Code: {userData.language_code}</li>
                    <li>Is Premium: {userData.is_premium ? 'Yes' : 'No'}</li>
                </ul>
            ) : (
                <div>Loading...</div>
            )}
            <button
                onClick={() => window.location.href = '/app'}
                className="mt-8 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Go to App
            </button>
        </main>
    );
}
