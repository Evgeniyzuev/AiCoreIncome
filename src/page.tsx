'use client';

import  WebApp  from '@twa-dev/sdk';
import { useState, useEffect } from 'react';
import ReferralSystem from './components/ReferralSystem';

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
        </main>
    );
}
