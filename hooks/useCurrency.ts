import { useState, useCallback, useEffect } from 'react';
import { getSettings } from '@/services/storage';

export const useCurrency = () => {
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrency = useCallback(async () => {
    try {
      const settings = await getSettings();
      setCurrencySymbol(settings.currencySymbol);
    } catch (error) {
      console.error('Error loading currency:', error);
      setCurrencySymbol('$'); // Default to USD
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrency();
  }, [loadCurrency]);

  const formatCurrency = useCallback((amount: number): string => {
    return `${currencySymbol}${amount.toFixed(2)}`;
  }, [currencySymbol]);

  return {
    currencySymbol,
    formatCurrency,
    isLoading,
    refreshCurrency: loadCurrency,
  };
};
