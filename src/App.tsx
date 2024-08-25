import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import aissist from './images/aissist.png';
import aissist2 from './images/aissist2.png';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('wallet');
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [aicoreLevel, setAicoreLevel] = useState(0);
  const [aicoreBalance, setAicoreBalance] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletAction, setWalletAction] = useState<'topUp' | 'spend' | 'increase' | null>(null);
  const [actionAmount, setActionAmount] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      const amount = (percentage / 100) * walletBalance;
      setActionAmount(amount.toFixed(2));
    }
  };

  const balanceRequiredForNextLevel = Array(30).fill(0).map((_, index) => Math.pow(2, index));

  useEffect(() => {
    const newLevel = balanceRequiredForNextLevel.findIndex(req => aicoreBalance < req);
    setAicoreLevel(newLevel);
  }, [aicoreBalance]);

  useEffect(() => {
    const timer = setInterval(() => {
      setWalletBalance(prevBalance => parseFloat((prevBalance + aicoreBalance / 100).toFixed(2)));
    }, 1000);

    return () => clearInterval(timer);
  }, [aicoreBalance]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChatResponse("Chat is available from the next level");
    setChatInput('');
  };

  const handleEarn = (amount: number) => {
    setAicoreBalance(prevBalance => parseFloat((prevBalance + amount).toFixed(2)));
  };

  const handleReset = () => {
    setAicoreBalance(0);
    setAicoreLevel(0);
    setWalletBalance(0);
  };

  const handleWalletAction = (action: 'topUp' | 'spend' | 'increase') => {
    setWalletAction(action);
    setActionAmount('');
    switch (action) {
      case 'topUp':
        setActionMessage('Top up wallet');
        break;
      case 'spend':
        setActionMessage('Spend');
        break;
      case 'increase':
        setActionMessage('Increase power AiCore');
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
        setWalletBalance(prev => prev + amount);
        break;
      case 'spend':
        if (amount > walletBalance) {
          alert('Insufficient funds');
          return;
        }
        setWalletBalance(prev => prev - amount);
        break;
      case 'increase':
        if (amount > walletBalance) {
          alert('Insufficient funds');
          return;
        }
        setWalletBalance(prev => prev - amount);
        setAicoreBalance(prev => prev + amount);
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

  const renderContent = () => {
    switch (activeTab) {
      case 'wallet':
        return (
          <div className="text-2xl flex flex-col items-center">
            <div className="mb-4">Balance: {walletBalance.toFixed(2)} USDT</div>
            <div className="mb-4">Income: {(aicoreBalance / 100).toFixed(2)} USDT/sec</div>
            <div className="flex space-x-2 mb-4">
              <button onClick={() => handleWalletAction('topUp')} className="p-2 bg-blue-500 text-white rounded">Top up</button>
              <button onClick={() => handleWalletAction('spend')} className="p-2 bg-yellow-500 text-black rounded">Spend</button>
              <button onClick={() => handleWalletAction('increase')} className="p-2 bg-green-500 text-white rounded">Increase</button>
            </div>
            {walletAction && (
              <div className="flex flex-col items-center">
                <div className="mb-2">{actionMessage}</div>
                <input
                  type="number"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  placeholder="Amount in USDT"
                  className="p-2 text-black rounded mb-2 w-full"
                />
                <div 
                  ref={progressBarRef}
                  className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2 cursor-pointer"
                  onClick={handleProgressBarClick}
                >
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${Math.min((parseFloat(actionAmount) / walletBalance) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={handleActionConfirm} className="p-2 bg-green-500 text-white rounded">✓</button>
                  <button onClick={handleActionCancel} className="p-2 bg-red-500 text-white rounded">✗</button>
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
          <div className="text-2xl flex flex-col items-center">
            <button onClick={() => handleEarn(0.1)} className="p-2 bg-yellow-500 text-black rounded mb-2 w-40">
              Get 0.1 USDT
            </button>
            <button onClick={() => handleEarn(10)} className="p-2 bg-yellow-500 text-black rounded mb-2 w-40">
              Get 10 USDT
            </button>
            <button onClick={() => handleEarn(1000)} className="p-2 bg-yellow-500 text-black rounded mb-2 w-40">
              Get 1K USDT
            </button>
            <button onClick={handleReset} className="p-2 bg-red-500 text-white rounded w-40">
              Reset
            </button>
          </div>
        );
      case 'frens':
        return <div className="text-2xl">Frens Content</div>;
      case 'goals':
        return (
          <div className="text-xl flex flex-col items-start">
            <div className="mb-2">🔵 aicore networth</div>
            <div className="mb-2">🔵 ai daily income</div>
            <div className="mb-2">🔵 health</div>
            <div className="mb-2">🔵 impressions</div>
            <div className="mb-2">🔵 relationship</div>
            <div className="mb-2">🔵 property</div>
            <div className="mb-2">🔵 appearance</div>
            <div>🔵 personal</div>
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
          <div className="relative w-64 h-4 bg-gray-700 bg-opacity-50 rounded-full overflow-hidden mr-2">
            <div
              className="absolute top-0 left-0 h-full bg-yellow-500 bg-opacity-50"
              style={{ width: `${progressPercentage}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
              {aicoreBalance.toFixed(2)} USDT / {balanceRequiredForNextLevel[aicoreLevel]} USDT
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
          <button onClick={() => setActiveTab('wallet')} className={`text-sm ${activeTab === 'wallet' ? 'text-yellow-500' : 'text-gray-400'}`}>Wallet</button>
          <button onClick={() => setActiveTab('chat')} className={`text-sm ${activeTab === 'chat' ? 'text-yellow-500' : 'text-gray-400'}`}>Chat</button>
          <button onClick={() => setActiveTab('earn')} className={`text-sm ${activeTab === 'earn' ? 'text-yellow-500' : 'text-gray-400'}`}>Earn</button>
          <button onClick={() => setActiveTab('frens')} className={`text-sm ${activeTab === 'frens' ? 'text-yellow-500' : 'text-gray-400'}`}>Frens</button>
          <button onClick={() => setActiveTab('goals')} className={`text-sm ${activeTab === 'goals' ? 'text-yellow-500' : 'text-gray-400'}`}>Goals</button>
        </div>
      </div>
    </div>
  );
};

export default App;