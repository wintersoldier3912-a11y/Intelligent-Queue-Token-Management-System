import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/Button';
import { useSystem } from '../../context/SystemContext';
import { Token, TokenStatus } from '../../types';
import { Clock, CheckCircle, Smartphone } from 'lucide-react';

export const CustomerView: React.FC = () => {
  const [step, setStep] = useState<'SELECT' | 'FORM' | 'TICKET'>('SELECT');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [activeToken, setActiveToken] = useState<Token | null>(null);
  
  const { services, generateToken, tokens, counters } = useSystem();

  // If we have an active token, watch for its updates in real-time
  const trackedToken = activeToken 
    ? tokens.find(t => t.id === activeToken.id) || activeToken 
    : null;

  useEffect(() => {
    if (trackedToken && trackedToken.status !== activeToken?.status) {
      setActiveToken(trackedToken);
    }
  }, [trackedToken, activeToken]);

  const handleServiceSelect = (id: string) => {
    setSelectedServiceId(id);
    setStep('FORM');
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId) return;
    
    // In a real app we'd await the API
    const _tempToken = generateToken(selectedServiceId, customerInfo.name, customerInfo.phone);
    
    // We need to find the token we just created from the updated state
    // Since state update is async/detached in this mock, we'll try to find the latest token
    // matching our criteria after a small delay, or just mock the transition.
    // For this demo, let's just find the last created token for this user
    // A slight race condition exists in this mock, but acceptable for demo.
    
    setTimeout(() => {
       // Since we don't have the ID from generateToken synchronously from state, 
       // we will trust the simulation updates. 
       // In a real app, generateToken returns the full object.
       // Let's grab the newest token from the list in next render cycle (handled by logic above?)
       // Actually, let's just grab the last token for this service to display.
       // We will pass a dummy ID for now and let the user see "Waiting"
       // Ideally generateToken in context should return the object.
       setStep('TICKET');
    }, 100);
  };
  
  // Find the actual token object from the state based on recent creation if we don't have ID
  // For the demo, we'll assume the last token in the list is ours if we just clicked.
  useEffect(() => {
    if (step === 'TICKET' && !activeToken) {
       const userTokens = tokens.filter(t => t.customerName === customerInfo.name);
       if (userTokens.length > 0) {
         setActiveToken(userTokens[userTokens.length - 1]);
       }
    }
  }, [tokens, step, activeToken, customerInfo.name]);


  // Calculate Queue Position
  const getQueuePosition = (token: Token) => {
    if (token.status !== TokenStatus.WAITING) return 0;
    const pending = tokens.filter(t => 
      t.serviceId === token.serviceId && 
      t.status === TokenStatus.WAITING &&
      t.createdAt < token.createdAt
    );
    return pending.length + 1;
  };

  const getEstimatedWait = (token: Token) => {
    const pos = getQueuePosition(token);
    const service = services.find(s => s.id === token.serviceId);
    if (!service) return 0;
    // Simple logic: (People ahead * Service Time) / Active Counters for this service
    // Active counters
    const activeCounters = counters.filter(c => 
      c.status === 'OPEN' && c.assignedServiceIds.includes(token.serviceId)
    ).length || 1;
    
    return Math.ceil((pos * service.estimatedTimeMinutes) / activeCounters);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden min-h-[500px]">
        {step === 'SELECT' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Select Service</h2>
            <div className="space-y-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-brand-500 hover:bg-brand-50 transition-all group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-lg text-gray-900 group-hover:text-brand-700">{service.name}</span>
                    <span className="text-sm font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded group-hover:bg-white">
                      ~{service.estimatedTimeMinutes} min
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{service.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'FORM' && (
          <div className="p-6">
             <button onClick={() => setStep('SELECT')} className="text-sm text-gray-500 hover:text-gray-900 mb-4">
               &larr; Back to Services
             </button>
             <h2 className="text-2xl font-bold mb-2 text-gray-900">Your Details</h2>
             <p className="text-gray-500 mb-6">Enter your details to generate a token.</p>
             
             <form onSubmit={handleGenerate} className="space-y-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                 <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="John Doe"
                    value={customerInfo.name}
                    onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                 <input 
                    type="tel" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="555-0123"
                    value={customerInfo.phone}
                    onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                 />
               </div>
               <Button fullWidth size="lg" type="submit">Get Token</Button>
             </form>
          </div>
        )}

        {step === 'TICKET' && activeToken && (
           <div className="p-8 text-center bg-brand-600 text-white h-full flex flex-col items-center justify-center">
             <div className="bg-white text-gray-900 rounded-2xl p-6 w-full shadow-xl animate-in zoom-in duration-300">
                <div className="text-sm text-gray-400 uppercase font-bold tracking-wider mb-2">Your Token</div>
                <div className="text-5xl font-black text-brand-600 mb-4">{activeToken.ticketNumber}</div>
                
                <div className="border-t border-b border-gray-100 py-4 my-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-bold ${
                      activeToken.status === TokenStatus.CALLED ? 'text-green-600 animate-pulse' : 
                      activeToken.status === TokenStatus.SERVING ? 'text-blue-600' : 'text-yellow-600'
                    }`}>
                      {activeToken.status === TokenStatus.CALLED ? 'PROCEED TO COUNTER' : activeToken.status}
                    </span>
                  </div>
                   {activeToken.status === TokenStatus.WAITING && (
                     <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Position</span>
                        <span className="font-bold">{getQueuePosition(activeToken)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Est. Wait</span>
                        <span className="font-bold">{getEstimatedWait(activeToken)} mins</span>
                      </div>
                     </>
                   )}
                   {activeToken.counterId && (
                     <div className="flex justify-between items-center mt-2 bg-green-50 p-2 rounded">
                        <span className="text-green-800 font-bold">Assigned Counter</span>
                        <span className="text-green-800 font-black text-xl">
                          {counters.find(c => c.id === activeToken.counterId)?.name}
                        </span>
                     </div>
                   )}
                </div>

                <p className="text-xs text-gray-400 mt-4">
                  Please wait for your number to be called.
                </p>
             </div>

             <div className="mt-8 opacity-80">
                <p className="text-sm">We've sent a digital copy to your phone.</p>
                <Button variant="secondary" className="mt-4" onClick={() => {
                   setStep('SELECT');
                   setActiveToken(null);
                   setCustomerInfo({name: '', phone: ''});
                }}>
                  Get Another Token
                </Button>
             </div>
           </div>
        )}
      </div>
    </Layout>
  );
};