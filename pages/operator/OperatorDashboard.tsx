import React, { useState, useMemo } from 'react';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/Button';
import { useSystem } from '../../context/SystemContext';
import { Token, TokenStatus, User } from '../../types';
import { Play, CheckSquare, SkipForward, Pause, Power, Users } from 'lucide-react';

export const OperatorDashboard: React.FC = () => {
  const { users, counters, tokens, updateTokenStatus, updateCounterStatus } = useSystem();
  
  // Mock Login - usually this would be a separate page
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const myCounter = useMemo(() => 
    currentUser ? counters.find(c => c.id === currentUser.counterId) : null, 
    [counters, currentUser]
  );

  const pendingTokens = useMemo(() => {
    if (!myCounter) return [];
    return tokens
      .filter(t => 
        t.status === TokenStatus.WAITING && 
        myCounter.assignedServiceIds.includes(t.serviceId)
      )
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [tokens, myCounter]);

  const currentToken = useMemo(() => {
    if (!myCounter) return null;
    return tokens.find(t => 
      (t.status === TokenStatus.CALLED || t.status === TokenStatus.SERVING) && 
      t.counterId === myCounter.id
    );
  }, [tokens, myCounter]);

  const historyTokens = useMemo(() => {
     if (!myCounter) return [];
     return tokens
      .filter(t => t.counterId === myCounter.id && (t.status === TokenStatus.COMPLETED || t.status === TokenStatus.SKIPPED))
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
      .slice(0, 5);
  }, [tokens, myCounter]);


  const handleCallNext = () => {
    if (pendingTokens.length === 0) return;
    const nextToken = pendingTokens[0];
    updateTokenStatus(nextToken.id, TokenStatus.CALLED, myCounter!.id);
  };

  const handleServe = () => {
    if (currentToken) {
      updateTokenStatus(currentToken.id, TokenStatus.SERVING);
    }
  };

  const handleComplete = () => {
    if (currentToken) {
      updateTokenStatus(currentToken.id, TokenStatus.COMPLETED);
    }
  };
  
  const handleSkip = () => {
     if (currentToken) {
       updateTokenStatus(currentToken.id, TokenStatus.SKIPPED);
     }
  };

  if (!currentUser) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Operator Login</h2>
          <div className="space-y-4">
            {users.filter(u => u.role === 'OPERATOR').map(u => (
              <button
                key={u.id}
                onClick={() => setCurrentUser(u)}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-brand-500 hover:bg-brand-50"
              >
                <div>
                  <div className="font-medium text-gray-900">{u.name}</div>
                  <div className="text-sm text-gray-500">{u.email}</div>
                </div>
                <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                  {counters.find(c => c.id === u.counterId)?.name || 'Unassigned'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!myCounter) return <Layout><div>Error: No counter assigned to user.</div></Layout>;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard: {myCounter.name}</h1>
          <p className="text-gray-500">Welcome back, {currentUser.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            myCounter.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${myCounter.status === 'OPEN' ? 'bg-green-600' : 'bg-red-600'}`} />
            {myCounter.status}
          </div>
          <Button 
             variant="outline" 
             size="sm"
             onClick={() => updateCounterStatus(myCounter.id, myCounter.status === 'OPEN' ? 'PAUSED' : 'OPEN')}
          >
             {myCounter.status === 'OPEN' ? <Pause className="w-4 h-4 mr-1"/> : <Play className="w-4 h-4 mr-1"/>}
             {myCounter.status === 'OPEN' ? 'Pause Counter' : 'Open Counter'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setCurrentUser(null)}>Logout</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Current Service */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Token Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Current Token</h3>
              {currentToken && (
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                  currentToken.status === 'CALLED' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {currentToken.status}
                </span>
              )}
            </div>
            
            <div className="p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
              {currentToken ? (
                <>
                  <div className="text-7xl font-black text-gray-900 mb-4">{currentToken.ticketNumber}</div>
                  <div className="text-xl text-gray-600 mb-2">{currentToken.customerName}</div>
                  <div className="text-sm text-gray-400 mb-8">{currentToken.customerPhone || 'No phone provided'}</div>
                  
                  <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
                     {currentToken.status === TokenStatus.CALLED && (
                        <>
                          <Button 
                            variant="secondary" 
                            size="lg" 
                            className="col-span-1"
                            onClick={handleSkip}
                          >
                            <SkipForward className="w-5 h-5 mr-2" /> Skip
                          </Button>
                          <Button 
                            variant="primary" 
                            size="lg" 
                            className="col-span-2"
                            onClick={handleServe}
                          >
                            <Users className="w-5 h-5 mr-2" /> Start Serving
                          </Button>
                        </>
                     )}
                     {currentToken.status === TokenStatus.SERVING && (
                        <Button 
                          variant="success" 
                          size="lg" 
                          className="col-span-3"
                          onClick={handleComplete}
                        >
                          <CheckSquare className="w-5 h-5 mr-2" /> Complete Service
                        </Button>
                     )}
                  </div>
                </>
              ) : (
                <div className="text-gray-400">
                  <div className="mb-4 bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-lg font-medium">No customer currently being served</p>
                  <p className="text-sm">Call the next token to begin</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          {!currentToken && (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
               <div>
                 <div className="text-2xl font-bold text-gray-900">{pendingTokens.length}</div>
                 <div className="text-sm text-gray-500">Customers Waiting</div>
               </div>
               <Button 
                 size="xl" 
                 disabled={pendingTokens.length === 0 || myCounter.status !== 'OPEN'}
                 onClick={handleCallNext}
                 className="shadow-lg shadow-brand-500/30"
               >
                 Call Next Token <Play className="w-5 h-5 ml-2 fill-current" />
               </Button>
             </div>
          )}
        </div>

        {/* Right Column: Queue & History */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[400px] flex flex-col">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Queue</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {pendingTokens.length === 0 ? (
                 <div className="text-center py-10 text-gray-400 text-sm">Queue is empty</div>
              ) : (
                pendingTokens.map((token, idx) => (
                  <div key={token.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded">#{idx + 1}</span>
                      <span className="font-bold text-gray-900">{token.ticketNumber}</span>
                    </div>
                    <span className="text-sm text-gray-500 truncate max-w-[100px]">{token.customerName}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Recent History</h3>
            </div>
             <div className="p-2 space-y-2">
               {historyTokens.map(t => (
                 <div key={t.id} className="flex justify-between items-center text-sm p-2">
                    <span className="text-gray-900 font-medium">{t.ticketNumber}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      t.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>{t.status}</span>
                 </div>
               ))}
               {historyTokens.length === 0 && <div className="text-center py-4 text-xs text-gray-400">No history yet</div>}
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};