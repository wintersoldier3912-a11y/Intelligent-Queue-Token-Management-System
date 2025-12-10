import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SystemState, Token, Service, Counter, User, TokenStatus, UserRole } from '../types';
import { INITIAL_SERVICES, INITIAL_COUNTERS, INITIAL_USERS } from '../constants';

interface SystemContextType extends SystemState {
  generateToken: (serviceId: string, customerName: string, customerPhone: string) => Token;
  updateTokenStatus: (tokenId: string, status: TokenStatus, counterId?: string) => void;
  updateCounterStatus: (counterId: string, status: Counter['status']) => void;
  assignOperatorToCounter: (userId: string, counterId: string) => void;
  resetSystem: () => void;
  
  // Admin Actions
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (service: Service) => void;
  deleteService: (id: string) => void;
  addCounter: (counter: Omit<Counter, 'id'>) => void;
  updateCounter: (counter: Counter) => void;
  deleteCounter: (id: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  deleteUser: (id: string) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

const STORAGE_KEY = 'qflow_db_v1';

const getInitialState = (): SystemState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    services: INITIAL_SERVICES,
    counters: INITIAL_COUNTERS,
    users: INITIAL_USERS,
    tokens: [],
  };
};

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SystemState>(getInitialState);

  // Sync state to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Listen for storage changes from other tabs to simulate real-time socket updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const generateToken = useCallback((serviceId: string, customerName: string, customerPhone: string) => {
    setState((prev) => {
      const service = prev.services.find((s) => s.id === serviceId);
      if (!service) throw new Error('Service not found');

      // Calculate next ticket number for this service code
      const existingForService = prev.tokens.filter((t) => t.serviceId === serviceId);
      const nextNum = existingForService.length + 1;
      const ticketNumber = `${service.code}-${String(nextNum).padStart(3, '0')}`;

      const newToken: Token = {
        id: crypto.randomUUID(),
        ticketNumber,
        serviceId,
        status: TokenStatus.WAITING,
        customerName,
        customerPhone,
        createdAt: Date.now(),
      };

      return {
        ...prev,
        tokens: [...prev.tokens, newToken],
      };
    });
    
    // Return temp object for immediate UI feedback in current tab
    const service = state.services.find((s) => s.id === serviceId);
    const existingForService = state.tokens.filter((t) => t.serviceId === serviceId);
    const nextNum = existingForService.length + 1;
    const ticketNumber = `${service?.code || 'X'}-${String(nextNum).padStart(3, '0')}`;
    
    return {
       id: 'temp-id', 
       ticketNumber,
       serviceId,
       status: TokenStatus.WAITING,
       customerName,
       customerPhone,
       createdAt: Date.now()
    }; 
  }, [state.services, state.tokens]);

  const updateTokenStatus = useCallback((tokenId: string, status: TokenStatus, counterId?: string) => {
    setState((prev) => {
      const now = Date.now();
      const updatedTokens = prev.tokens.map((t) => {
        if (t.id === tokenId) {
          const updates: Partial<Token> = { status };
          if (counterId) updates.counterId = counterId;
          if (status === TokenStatus.CALLED) updates.calledAt = now;
          if (status === TokenStatus.SERVING) updates.servedAt = now;
          if (status === TokenStatus.COMPLETED) updates.completedAt = now;
          return { ...t, ...updates };
        }
        return t;
      });
      return { ...prev, tokens: updatedTokens };
    });
  }, []);

  const updateCounterStatus = useCallback((counterId: string, status: Counter['status']) => {
    setState((prev) => ({
      ...prev,
      counters: prev.counters.map((c) => (c.id === counterId ? { ...c, status } : c)),
    }));
  }, []);

  const assignOperatorToCounter = useCallback((userId: string, counterId: string) => {
    setState((prev) => ({
      ...prev,
      counters: prev.counters.map((c) => 
        c.id === counterId ? { ...c, currentOperatorId: userId } : c
      ),
      users: prev.users.map((u) => 
        u.id === userId ? { ...u, counterId } : u
      )
    }));
  }, []);

  const resetSystem = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      services: INITIAL_SERVICES,
      counters: INITIAL_COUNTERS,
      users: INITIAL_USERS,
      tokens: [],
    });
    window.location.reload();
  }, []);

  // Admin Actions
  const addService = useCallback((service: Omit<Service, 'id'>) => {
    setState(prev => ({
      ...prev,
      services: [...prev.services, { ...service, id: crypto.randomUUID() }]
    }));
  }, []);

  const updateService = useCallback((service: Service) => {
    setState(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === service.id ? service : s)
    }));
  }, []);

  const deleteService = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== id)
    }));
  }, []);

  const addCounter = useCallback((counter: Omit<Counter, 'id'>) => {
    setState(prev => ({
      ...prev,
      counters: [...prev.counters, { ...counter, id: crypto.randomUUID() }]
    }));
  }, []);

  const updateCounter = useCallback((counter: Counter) => {
    setState(prev => ({
      ...prev,
      counters: prev.counters.map(c => c.id === counter.id ? counter : c)
    }));
  }, []);

  const deleteCounter = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      counters: prev.counters.filter(c => c.id !== id)
    }));
  }, []);

  const addUser = useCallback((user: Omit<User, 'id'>) => {
    setState(prev => ({
      ...prev,
      users: [...prev.users, { ...user, id: crypto.randomUUID() }]
    }));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== id)
    }));
  }, []);

  return (
    <SystemContext.Provider
      value={{
        ...state,
        generateToken,
        updateTokenStatus,
        updateCounterStatus,
        assignOperatorToCounter,
        resetSystem,
        addService,
        updateService,
        deleteService,
        addCounter,
        updateCounter,
        deleteCounter,
        addUser,
        deleteUser,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error('useSystem must be used within a SystemProvider');
  return context;
};