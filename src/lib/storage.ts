import { initialSession, services, slots } from '../data/demoData';
import type { Booking, Session } from '../types/demo';
export const keys = { session: 'khaifrost_demo_session', bookings: 'khaifrost_demo_bookings', inputLanguage: 'khaifrost_demo_input_language' };
function read(key: string): unknown { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } }
function isBooking(value: unknown): value is Booking {
 if (!value || typeof value !== 'object') return false;
 const b = value as Booking;
 return ['code', 'service', 'time', 'staff', 'date'].every(key => typeof b[key as keyof Booking] === 'string') && typeof b.duration === 'number';
}
export function readSession(): Session {
 const s = read(keys.session) as Session | null;
 if (!s || !Array.isArray(s.messages) || !s.messages.length || !s.flow || typeof s.flow !== 'object') return initialSession();
 const validMessages = s.messages.every(m => m && typeof m.id === 'string' && typeof m.text === 'string' && ['ai', 'user'].includes(m.role) && (!m.choices || (Array.isArray(m.choices) && m.choices.every(c => typeof c === 'string'))) && (!m.booking || isBooking(m.booking)));
 const f = s.flow;
 const validFlow = (!f.step || ['service', 'time', 'staff'].includes(f.step)) && (!f.serviceId || services.some(service => service.id === f.serviceId)) && (!f.time || slots.includes(f.time)) && (!f.rescheduleCode || typeof f.rescheduleCode === 'string');
 if (!validMessages || !validFlow) return initialSession();
 // Migrate only known assistant copy from older saved sessions; preserve user text and bookings.
 return { ...s, messages: s.messages.map(message => {
  if (message.role !== 'ai') return message;
  let text = message.text;
  if (text.startsWith('Absolutely. I’ll notify a team member to assist you.')) text = 'For assistance from a team member, please contact Aurora Nail Studio directly.';
  if (text.startsWith('Dạ được. Tôi sẽ chuyển yêu cầu của bạn đến nhân viên để hỗ trợ.')) text = 'Bạn vui lòng liên hệ trực tiếp Aurora Nail Studio để được nhân viên hỗ trợ.';
  text = text.replace('There’s no appointment in this demo yet.', 'There’s no appointment in this session yet.').replace('Bạn chưa có lịch hẹn trong bản demo.', 'Bạn chưa có lịch hẹn trong phiên này.');
  return { ...message, text };
 }) };

}
export function readBookings(): Booking[] { const b = read(keys.bookings); return Array.isArray(b) ? b.filter(isBooking) : []; }
export function save(key: string, value: unknown): boolean { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
export function clearDemo() { try { Object.values(keys).forEach(k => localStorage.removeItem(k)); } catch { /* private browser storage may be unavailable */ } }

export function readInputLanguage(): import('./language').InputLanguage { const value = read(keys.inputLanguage); return value === 'en' || value === 'vi' ? value : 'auto'; }
