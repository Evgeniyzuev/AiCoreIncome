import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import aissist from './images/aissist.png';
import aissist2 from './images/aissist2.png';
import WebApp from '@twa-dev/sdk';
import ReferralSystem from './components/ReferralSystem'

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [initData, setInitData] = useState('')
  const [userId, setUserId] = useState('')
  const [startParam, setStartParam] = useState('')
  const [activeTab, setActiveTab] = useState('wallet');
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [aicoreLevel, setAicoreLevel] = useState(0);
  const [aicoreBalance, setAicoreBalance] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletAction, setWalletAction] = useState<'topUp' | 'spend' | 'inCore' | 'withdraw' | null>(null);
  const [actionAmount, setActionAmount] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [reinvestmentPart, setReinvestmentPart] = useState(0.3);
  const dailyCoreRate = 0.0006;
  const dailyWalletRate = 0.0003;
  const [coreAfterXyears, setCoreAfterXyears] = useState(30);
  const [dayCount, setDayCount] = useState(0);
  const [coreIncome, setCoreIncome] = useState(0);
  const [walletIncome, setWalletIncome] = useState(0);
  const [daysToSkip, setDaysToSkip] = useState(1);
  const [sendToExternal, setSendToExternal] = useState(0);
  const [withdrawRate, setWithdrawRate] = useState(0);
  const [sentToCommunity, setSentToCommunity] = useState(0);


  interface UserData {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code: string;
    is_premium?: boolean;
  }


  const balanceRequiredForNextLevel = Array(50).fill(0).map((_, index) => Math.pow(2, index));

  useEffect(() => {
    const newLevel = balanceRequiredForNextLevel.findIndex(req => aicoreBalance < req);
    setAicoreLevel(newLevel);
  }, [aicoreBalance]);

  useEffect(() => {
    if (WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData);
  }
  }, []);

  useEffect(() => {
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

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChatResponse("Chat under development");
    setChatInput('');
  };

  const handleEarn = (amount: number) => {
    setAicoreBalance(prevBalance => parseFloat((prevBalance + amount).toFixed(2)));
  };

  const handleReset = () => {
    setAicoreBalance(0);
    setAicoreLevel(0);
    setWalletBalance(0);
    setDayCount(0);
  };

  const handleWalletAction = (action: 'topUp' | 'spend' | 'inCore' | 'withdraw') => {
    setWalletAction(action);
    setActionAmount('');
    switch (action) {
      case 'topUp':
        setActionMessage('Top up wallet');
        break;
      case 'spend':
        setActionMessage('Spend');
        break;
      case 'withdraw':
        setActionMessage(`Withdraw Rate ${(withdrawRate * 100).toFixed(2)}%`);
        break;
      case 'inCore':
        setActionMessage('Increase AiCore');
        break;
    }
  };

  const handleActionConfirm = () => {
    const amount = parseFloat(actionAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    switch (walletAction) {
      case 'topUp':
        setWalletBalance(prev => parseFloat((prev + amount).toFixed(10)));
        break;
      case 'spend':
        if (amount > walletBalance) {
          alert('Insufficient funds');
          return;
        }
        setWalletBalance(prev => parseFloat((prev - amount).toFixed(10)));
        break;
      case 'withdraw':
        if (amount > walletBalance) {
          alert('Insufficient funds');
          return;
        }
        setWalletBalance(prev => parseFloat((prev - amount).toFixed(10)));
        setSendToExternal(prev => parseFloat((prev + amount * withdrawRate).toFixed(10)));
        setSentToCommunity(prev => parseFloat((prev + amount * (1 - withdrawRate)).toFixed(10)));
        break;
      case 'inCore':
        if (amount > walletBalance) {
          alert('Insufficient funds');
          return;
        }
        setWalletBalance(prev => parseFloat((prev - amount).toFixed(10)));
        setAicoreBalance(prev => parseFloat((prev + amount).toFixed(10)));
        break;
    }

    setWalletAction(null);
    setActionAmount('');
    setActionMessage('');
  };

  const handleActionCancel = () => {
    setWalletAction(null);
    setActionAmount('');
    setActionMessage('');
  };

  const handleReinvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(100, Math.max(0, parseInt(e.target.value)));
    setReinvestmentPart(value / 100);
  };

  const handleSkipDays = () => {
    const newCoreIncome = aicoreBalance * (Math.pow(1 + dailyCoreRate * reinvestmentPart, daysToSkip) - 1);
    const newWalletIncome = walletBalance * (Math.pow(1 + dailyWalletRate, daysToSkip) - 1);
    const coreToWallet = aicoreBalance * (Math.pow(1 + dailyCoreRate, daysToSkip) - Math.pow(1 + dailyCoreRate * reinvestmentPart, daysToSkip));

    setAicoreBalance(prevBalance => 
      parseFloat((prevBalance + newCoreIncome).toFixed(10))
    );
    setWalletBalance(prevBalance => 
      parseFloat((prevBalance + newWalletIncome + coreToWallet).toFixed(10))
    );
    setDayCount(prevCount => prevCount + daysToSkip);
    setCoreIncome(aicoreBalance * dailyCoreRate);
    setWalletIncome(walletBalance * dailyWalletRate);
  };

  const handleNextDay = () => {
    setDayCount(prevCount => prevCount + 1);
    const newCoreIncome = aicoreBalance * dailyCoreRate;
    const newWalletIncome = walletBalance * dailyWalletRate;
    
    setAicoreBalance(prevBalance => 
      parseFloat((prevBalance + newCoreIncome * reinvestmentPart).toFixed(10))
    );
    setWalletBalance(prevBalance => 
      parseFloat((prevBalance + newWalletIncome + newCoreIncome * (1 - reinvestmentPart)).toFixed(10))
    );
    setCoreIncome(newCoreIncome);
    setWalletIncome(newWalletIncome);
  };

  useEffect(() => {
    if (dayCount <= 400) {
      setWithdrawRate(Math.min(0.4, dayCount * 0.001));
    } else {
      setWithdrawRate((dayCount - 160) / (dayCount + 200));
    }
  }, [dayCount]);


  const renderContent = () => {
    switch (activeTab) {
      case 'core':
        return (
          <div className="text-xl flex flex-col items-center">
            <div className="mb-4">Core rate (24,5%): {(aicoreBalance * dailyCoreRate).toFixed(2)} USD/day</div>
            <div className="mb-4 flex items-center">
              <span className="mr-2">Reinvest</span>
              <input
                type="number"
                value={Math.round(reinvestmentPart * 100)}
                onChange={handleReinvestmentChange}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.value.length > 3) {
                    target.value = target.value.slice(0, 3);
                  }
                  if (parseInt(target.value) > 100) {
                    target.value = '100';
                  }
                }}
                className="w-10 h-6 p-1 text-black rounded"
                min="0"
                max="100"
              />
              <span className="ml-1">% </span>
              <div 
                className="w-40 h-4 bg-gray-200 rounded-full overflow-hidden mr-2"
              >
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${reinvestmentPart * 100}%` }}
                ></div>
              </div>

              
            </div>
            <div className="mb-4">Core to wallet: {(aicoreBalance * dailyCoreRate * (1 - reinvestmentPart)).toFixed(2)} USD/day</div>
            <div className="mb-4">Core after {coreAfterXyears} years without replenishment:</div>
            <div className="mb-4"> {(aicoreBalance *  ((dailyCoreRate * reinvestmentPart + 1) ** 365) ** coreAfterXyears).toFixed(2)} USD</div>
            <div className="mb-4 flex items-center">
              <span className="mr-2">Period</span>
              <input
                type="number"
                value={coreAfterXyears}
                onChange={(e) => setCoreAfterXyears(Math.min(99, Math.max(0, parseInt(e.target.value) )))}
                className="w-12 p-1 text-black rounded mx-1"
                min="1"
                max="99"
              />
              <span>years:</span>
            </div>
          </div>
        );
      case 'wallet':
        return (
          <div className="text-xl flex flex-col items-center self-start w-full p-4">
            <div className="mb-4">Balance: {walletBalance.toFixed(2)} USD</div>
            <div className="mb-4">Core income: {(aicoreBalance * dailyCoreRate * (1 - reinvestmentPart)).toFixed(2)} USD/day</div>
            <div className="mb-4">Wallet income (11,6%): {(walletBalance * dailyWalletRate ).toFixed(2)} USD/day</div>
            <div className="mb-4">Sent to external wallet: {sendToExternal.toFixed(2)} USD</div>
            <div className="mb-4">Sent to community: {sentToCommunity.toFixed(2)} USD</div>
            <div className="flex space-x-2 mb-4">
              <button onClick={() => handleWalletAction('topUp')} className="p-2 bg-blue-500 text-white rounded">*Top up*</button>
              <button onClick={() => handleWalletAction('withdraw')} className="p-2 bg-red-500 text-white rounded">Withdraw</button>
              <button onClick={() => handleWalletAction('spend')} className="p-2 bg-yellow-500 text-black rounded"> *Spend*</button>
              <button onClick={() => handleWalletAction('inCore')} className="p-2 bg-green-500 text-white rounded"> *InCore* </button>
              
            </div>
            {walletAction && (
              <div className="flex flex-col items-center">
                <div className="mb-2">{actionMessage}</div>
                <div className="flex items-center w-full">
                  <button onClick={handleActionCancel} className="p-2 bg-red-500 text-white rounded w-11 h-11 mr-2">✗</button>
                  <input
                    type="number"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    placeholder="Amount in USD"
                    className="p-2 text-black rounded flex-grow"
                  />
                  <button onClick={handleActionConfirm} className="p-2 bg-green-500 text-white rounded w-11 h-11 ml-2">✓</button>
                </div>
              </div>
            )}
          </div>
        );
      case 'chat':
        return (
          <div className="text-2xl">
            <form onSubmit={handleChatSubmit}>
              <input
                type="text"
                className="text-black p-2 rounded"
                placeholder="Type your message here..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="ml-2 p-2 bg-yellow-500 text-black rounded">Send</button>
            </form>
            {chatResponse && <div className="mt-4">{chatResponse}</div>}
          </div>
        );
      case 'earn':
        return (
          <div className="text-xl flex flex-col items-center">
            <div className="text-sm flex flex-col items-start space-y-1 text-left">
              <div className="mb-4"></div>
              <div className="mb-4">🔵 Subscribe +0.1 USD (30d)</div>
              <div className="mb-4">🔵 Pass identification +5 USD (3d)</div>
              <div className="mb-4">🔵 Referral +1 USD / unidentified +0.1 USD (30d)</div>
              <div className="mb-4">🔵 Watch & like video +0.1 USD</div>
              <div className="mb-4">🔵 increase AiCore +1 USD</div>
            </div>
          </div>
        );
      case 'frens':
        return (
          <div className="flex flex-col items-center">
            <div>
              Welcome, {userData?.first_name}!
            </div>
            <ReferralSystem initData={initData} userId={userId} startParam={startParam}/>
          </div>
        );
      case 'goals':
        return (
          <div className="text-xl flex flex-col items-start">
            <div className="mb-2">🔵 aissist networth | daily income </div>
            <div className="mb-2">🔵 health</div>
            <div className="mb-2">🔵 skills</div> 
            <div className="mb-2">🔵 schedule | routine | habits</div>
            <div className="mb-2">🔵 impressions</div>  
            <div className="mb-2">🔵 travel</div> 
            <div className="mb-2">🔵 relationship</div>
            <div className="mb-2">🔵 property</div>
            <div className="mb-2">🔵 appearance</div>
            <div>🔵 personal</div>
          </div>
        );
      case 'test':
        return (
          <div className="text-xl flex flex-col items-center">
            <div className="flex items-center mb-4">
              <span className="mr-2">Day: {dayCount}</span>
              <button 
                onClick={handleSkipDays} 
                className="p-2 bg-blue-500 text-white rounded mr-2"
              >
                Skip Days
              </button>
              <input
                type="number"
                value={daysToSkip}
                onChange={(e) => setDaysToSkip(Math.min(999, Math.max(0, parseInt(e.target.value) )))}
                className="w-16 p-1 text-black rounded"
                min="1"
                max="999"
              />
            </div>

            <button onClick={() => handleEarn(0.1)} className="p-2 bg-green-500 text-black rounded mb-2 w-80">
              Get 0.1 USD
            </button>
            <button onClick={() => handleEarn(10)} className="p-2 bg-green-500 text-black rounded mb-2 w-80">
              Get 10 USD
            </button>
            <button onClick={() => handleEarn(1000)} className="p-2 bg-green-500 text-black rounded mb-2 w-80">
              Get 1K USD
            </button>
            <button onClick={handleReset} className="p-2 bg-red-500 text-white rounded w-80 h-10 mb-4">
              Reset
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const progressPercentage = (aicoreBalance / balanceRequiredForNextLevel[aicoreLevel]) * 100;

  const currentImage = aicoreLevel > 1 ? aissist2 : aissist;

  return (
    <div className="bg-black text-white h-screen flex flex-col">
      <div className="h-1/2 flex items-center justify-center overflow-hidden relative">
        <img src={currentImage} alt="AI Assistant" className="w-full h-full object-cover" />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center">
          <div className="relative w-80 h-4 bg-gray-700 bg-opacity-50 rounded-full overflow-hidden mr-2">
            <div
              className="absolute top-0 left-0 h-full bg-yellow-500 bg-opacity-50"
              style={{ width: `${progressPercentage}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
              {aicoreBalance.toFixed(2)} USD / {balanceRequiredForNextLevel[aicoreLevel]} USD
            </div>
          </div>
          <div className="text-yellow-500 border border-yellow-500 rounded-full w-8 h-8 flex items-center justify-center">
            {aicoreLevel}
          </div>
        </div>
      </div>
      <div className="h-1/2 flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          {renderContent()}
        </div>
        <div className="flex justify-around bg-gray-800 p-2">
          <button onClick={() => setActiveTab('core')} className={`text-sm ${activeTab === 'core' ? 'text-yellow-500' : 'text-gray-400'}`}>Core</button>
          <button onClick={() => setActiveTab('wallet')} className={`text-sm ${activeTab === 'wallet' ? 'text-yellow-500' : 'text-gray-400'}`}>Wallet</button>
          <button onClick={() => setActiveTab('chat')} className={`text-sm ${activeTab === 'chat' ? 'text-yellow-500' : 'text-gray-400'}`}>Chat</button>
          <button onClick={() => setActiveTab('earn')} className={`text-sm ${activeTab === 'earn' ? 'text-yellow-500' : 'text-gray-400'}`}>Earn</button>
          <button onClick={() => setActiveTab('frens')} className={`text-sm ${activeTab === 'frens' ? 'text-yellow-500' : 'text-gray-400'}`}>Frens</button>
          <button onClick={() => setActiveTab('goals')} className={`text-sm ${activeTab === 'goals' ? 'text-yellow-500' : 'text-gray-400'}`}>Goals</button>
          <button onClick={() => setActiveTab('test')} className={`text-sm ${activeTab === 'test' ? 'text-yellow-500' : 'text-gray-400'}`}>test</button>
        </div>
      </div>
    </div>
  );
};

export default App;