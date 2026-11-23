import { createContext, use, useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import { createDemoData, DEFAULT_SETTINGS, loadAppData, saveAppData } from '@/lib/app-data';
import { deletePhoto } from '@/lib/photos';
import type { AppData, Gift, GiftDraft, Settings } from '@/types/gift';

type State = { ready: boolean; data: AppData };

type Action =
  | { type: 'loaded'; data: AppData }
  | { type: 'gift-added'; gift: Gift }
  | { type: 'gift-updated'; id: string; patch: Partial<Gift> }
  | { type: 'gift-removed'; id: string }
  | { type: 'settings-updated'; patch: Partial<Settings> };

function reducer(state: State, action: Action): State {
  const { data } = state;
  switch (action.type) {
    case 'loaded':
      return { ready: true, data: action.data };
    case 'gift-added':
      return { ...state, data: { ...data, gifts: [...data.gifts, action.gift] } };
    case 'gift-updated':
      return {
        ...state,
        data: {
          ...data,
          gifts: data.gifts.map((gift) => (gift.id === action.id ? { ...gift, ...action.patch } : gift)),
        },
      };
    case 'gift-removed':
      return { ...state, data: { ...data, gifts: data.gifts.filter((gift) => gift.id !== action.id) } };
    case 'settings-updated':
      return { ...state, data: { ...data, settings: { ...data.settings, ...action.patch } } };
  }
}

type GiftsContextValue = {
  ready: boolean;
  gifts: Gift[];
  settings: Settings;
  addGift: (draft: GiftDraft) => Gift;
  updateGift: (id: string, patch: Partial<GiftDraft> & { snoozedUntil?: string | null }) => void;
  removeGift: (id: string) => void;
  /** Puts a deleted gift back, used by the Undo action. */
  restoreGift: (gift: Gift) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetDemoData: () => void;
};

const GiftsContext = createContext<GiftsContextValue | null>(null);

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function GiftsProvider({ children }: { children: ReactNode }) {
  const [{ ready, data }, dispatch] = useReducer(reducer, {
    ready: false,
    data: { version: 1, gifts: [], settings: DEFAULT_SETTINGS },
  });

  useEffect(() => {
    let active = true;
    loadAppData(new Date()).then((loaded) => {
      if (active) dispatch({ type: 'loaded', data: loaded });
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (ready) saveAppData(data);
  }, [ready, data]);

  const addGift = useCallback((draft: GiftDraft) => {
    const timestamp = new Date().toISOString();
    const gift: Gift = { ...draft, id: createId(), snoozedUntil: null, createdAt: timestamp, updatedAt: timestamp };
    dispatch({ type: 'gift-added', gift });
    return gift;
  }, []);

  const updateGift = useCallback<GiftsContextValue['updateGift']>((id, patch) => {
    dispatch({ type: 'gift-updated', id, patch: { ...patch, updatedAt: new Date().toISOString() } });
  }, []);

  const removeGift = useCallback((id: string) => dispatch({ type: 'gift-removed', id }), []);
  const restoreGift = useCallback((gift: Gift) => dispatch({ type: 'gift-added', gift }), []);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => dispatch({ type: 'settings-updated', patch }),
    [],
  );

  const resetDemoData = useCallback(() => {
    for (const gift of data.gifts) deletePhoto(gift.photo);
    dispatch({ type: 'loaded', data: createDemoData(new Date()) });
  }, [data.gifts]);

  const value = useMemo<GiftsContextValue>(
    () => ({
      ready,
      gifts: data.gifts,
      settings: data.settings,
      addGift,
      updateGift,
      removeGift,
      restoreGift,
      updateSettings,
      resetDemoData,
    }),
    [ready, data, addGift, updateGift, removeGift, restoreGift, updateSettings, resetDemoData],
  );

  return <GiftsContext value={value}>{children}</GiftsContext>;
}

export function useGifts(): GiftsContextValue {
  const value = use(GiftsContext);
  if (!value) throw new Error('useGifts must be used inside GiftsProvider');
  return value;
}

export function useGift(id: string | undefined): Gift | undefined {
  const { gifts } = useGifts();
  return gifts.find((gift) => gift.id === id);
}
