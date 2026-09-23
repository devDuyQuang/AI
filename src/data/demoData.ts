function makeId() {
  return globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

import type { Service, Session } from '../types/demo';
export const services: Service[] = [
  { id: 'classic', name: 'Classic Manicure', price: '$28', duration: 45 },
  { id: 'gel', name: 'Gel Manicure', price: '$38', duration: 60 },
  { id: 'pedicure', name: 'Spa Pedicure', price: '$45', duration: 60 },
  { id: 'art', name: 'Nail Art', price: 'from $15', duration: 30 },
];
export const slots = ['2:00 PM', '3:00 PM', '3:30 PM', '5:00 PM'];
export const staff = ['Emily', 'Anna', 'Sophia'];
export const availableStaff = (time: string) => time === '3:00 PM' ? ['Emily', 'Anna'] : staff;
export const initialSession = (): Session => ({ messages: [{ id: makeId(), role: 'ai', text: 'Hi 👋 I’m your AI receptionist.\nHow can I help you today?' }], flow: {} });
