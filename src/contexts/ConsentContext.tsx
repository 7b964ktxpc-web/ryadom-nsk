import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface ConsentSettings {
  personalData: boolean;
  geoLocation: boolean;
  analytics: boolean;
  marketing: boolean;
  cookies: boolean;
  version: string;
  timestamp: string;
}

interface ConsentContextType {
  consent: ConsentSettings | null;
  hasConsented: boolean;
  updateConsent: (settings: Partial<ConsentSettings>) => void;
  withdrawConsent: () => void;
  exportData: () => Promise<string>;
  deleteData: () => Promise<void>;
  isLoading: boolean;
}

const STORAGE_KEY = "ryadom_nsk_consent";
const CONSENT_VERSION = "1.0.0";

const defaultConsent: ConsentSettings = {
  personalData: false,
  geoLocation: false,
  analytics: false,
  marketing: false,
  cookies: false,
  version: CONSENT_VERSION,
  timestamp: new Date().toISOString(),
};

const ConsentContext = createContext<ConsentContextType | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ConsentSettings;
        setConsent(parsed);
      }
    } catch {
      // No consent stored
    }
    setIsLoading(false);
  }, []);

  const updateConsent = useCallback((settings: Partial<ConsentSettings>) => {
    setConsent((prev) => {
      const next = {
        ...defaultConsent,
        ...prev,
        ...settings,
        timestamp: new Date().toISOString(),
        version: CONSENT_VERSION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const withdrawConsent = useCallback(() => {
    setConsent(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const exportData = useCallback(async () => {
    const data: Record<string, unknown> = {};
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith("ryadom_nsk_")) {
          data[key] = localStorage.getItem(key);
        }
      }
    } catch {
      // Ignore errors
    }
    return JSON.stringify(data, null, 2);
  }, []);

  const deleteData = useCallback(async () => {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith("ryadom_nsk_")) {
          localStorage.removeItem(key);
        }
      }
      withdrawConsent();
    } catch {
      // Ignore errors
    }
  }, [withdrawConsent]);

  return (
    <ConsentContext.Provider
      value={{
        consent,
        hasConsented: consent !== null && consent.cookies && consent.personalData,
        updateConsent,
        withdrawConsent,
        exportData,
        deleteData,
        isLoading,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within ConsentProvider");
  return ctx;
}

export { defaultConsent, STORAGE_KEY, CONSENT_VERSION };
