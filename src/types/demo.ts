import type { DemoLanguage } from '../lib/language';
export type Service = { id: string; name: string; price: string; duration: number };
export type Booking = { code: string; service: string; time: string; staff: string; duration: number; date: string };
export type Flow = { language?: DemoLanguage; step?: 'service' | 'time' | 'staff'; serviceId?: string; time?: string; rescheduleCode?: string };
export type Message = { language?: DemoLanguage; id: string; role: 'ai' | 'user'; text: string; choices?: string[]; booking?: Booking };
export type Session = { language?: DemoLanguage; messages: Message[]; flow: Flow };
