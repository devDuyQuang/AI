import { availableStaff, services, slots, staff } from '../data/demoData';
import { detectLanguage, normalize, type DemoLanguage } from './language';
import type { Booking, Flow, Message } from '../types/demo';
export function respond(input: string, previous: Flow, bookings: Booking[], choiceLanguage?: DemoLanguage): { message: Message; flow: Flow; booking?: Booking; language: DemoLanguage } {
 const q = normalize(input).trim();
 const neutral = [...slots, ...staff, ...services.map(s => s.name)].some(s => normalize(s) === q);
 const language = choiceLanguage || (neutral && previous.language) || detectLanguage(input);
 const vi = language === 'vi';
 let flow = { ...previous, language };
 const reply = (en: string, vn: string, choices?: string[], booking?: Booking) => ({ message: { id: crypto.randomUUID(), role: 'ai' as const, language, text: vi ? vn : en, choices, booking }, flow, booking, language });
 const service = services.find(s => q.includes(s.name.toLowerCase()) || q.includes(s.id === 'pedicure' ? 'pedicure' : s.id === 'art' ? 'nail art' : s.id));
 if (/cancel|start over|huy/.test(q)) { flow = { language }; return reply('Of course. Let’s start fresh. What can I help you with?', 'Dạ được. Bạn muốn tôi hỗ trợ điều gì tiếp theo?'); }
 if (/hours|opening|open|close|mo cua|dong cua|may gio/.test(q)) return reply('We’re open Monday–Saturday, 9:00 AM–8:00 PM, and Sunday, 10:00 AM–6:00 PM.', 'Salon mở cửa từ 9:00 sáng đến 8:00 tối từ Thứ Hai đến Thứ Bảy, và Chủ Nhật từ 10:00 sáng đến 6:00 chiều.');
 if (/price|cost|how much|\bgia\b|bao nhieu/.test(q)) return service ? reply(`${service.name} is ${service.price} and takes approximately ${service.duration} minutes.`, `${service.name} có giá ${service.price.replace('from', 'từ')} và thời gian thực hiện khoảng ${service.duration} phút.`) : reply('Classic Manicure · $28 · 45 min\nGel Manicure · $38 · 60 min\nSpa Pedicure · $45 · 60 min\nNail Art · from $15\n\nWhich service would you like?', 'Classic Manicure · $28 · 45 phút\nGel Manicure · $38 · 60 phút\nSpa Pedicure · $45 · 60 phút\nNail Art · từ $15\n\nBạn muốn chọn dịch vụ nào?');
 if (/human|person|talk to staff|team member|nhan vien/.test(q) || q === 'staff') { flow = { language }; return reply('For assistance from a team member, please contact Aurora Nail Studio directly.', 'Bạn vui lòng liên hệ trực tiếp Aurora Nail Studio để được nhân viên hỗ trợ.'); }
 if (/reschedule|change appointment|doi lich/.test(q)) {
  const last = bookings.at(-1);
  if (!last) { flow = { language, step: 'service' }; return reply('There’s no appointment in this session yet. Which service would you like?', 'Bạn chưa có lịch hẹn trong phiên này. Bạn muốn đặt dịch vụ nào?', services.map(s => s.name)); }
  flow = { language, step: 'time', serviceId: services.find(s => s.name === last.service)?.id, rescheduleCode: last.code };
  return reply(`Let’s move your ${last.service} appointment. Choose a new time for today.`, `Bạn muốn đổi lịch ${last.service} sang giờ nào hôm nay?`, slots);
 }
 if (service) flow.serviceId = service.id;
 const spokenTime = q.replace(/\bthree thirty\b/g, '3:30').replace(/\b(two|three|five)\b/g, word => ({two:'2',three:'3',five:'5'})[word]!).replace(/\b([235])\s*p\.?\s*m\.?/g, '$1:00 pm').replace(/\b(hai|ba|nam) gio(?: (ruoi))? chieu/g, (_, hour: string, half: string) => `${({hai:'2',ba:'3',nam:'5'})[hour as 'hai'|'ba'|'nam']}:${half ? '30' : '00'} pm`);
 const time = slots.find(t => spokenTime.includes(t.toLowerCase()) || q === t.replace(' PM','').toLowerCase());
 if (time) flow.time = time;
 if (flow.step || service || /book|appointment|schedule|dat lich|lam nail/.test(q)) {
  if (!flow.serviceId) { flow.step = 'service'; return reply('Absolutely. Which service would you like?', 'Dạ được. Bạn muốn đặt dịch vụ nào?', services.map(s => s.name)); }
  if (!flow.time) { flow.step = 'time'; return reply('Absolutely. I have a few available times today. Which works best for you?', 'Dạ được. Hôm nay salon còn một số khung giờ trống. Bạn muốn chọn giờ nào?', slots); }
  const chosenStaff = availableStaff(flow.time).find(s => q.includes(s.toLowerCase()));
  if (!chosenStaff) { flow.step = 'staff'; return reply(`${availableStaff(flow.time).join(' and ')} are available at ${flow.time}. Who would you prefer?`, `${availableStaff(flow.time).join(' và ')} đang trống lúc ${flow.time.replace(' PM',' chiều')}. Bạn muốn chọn ai?`, availableStaff(flow.time)); }
  const selected = services.find(s => s.id === flow.serviceId)!;
  const booking = { code: flow.rescheduleCode || `KF-${2048 + bookings.length}`, service: selected.name, time: flow.time, staff: chosenStaff, duration: selected.duration, date: new Date().toLocaleDateString('en-CA') };
  const reschedule = !!flow.rescheduleCode;
  flow = { language };
  return reply(reschedule ? 'Your appointment has been rescheduled. You’re all set.' : 'Your appointment is all set.', reschedule ? 'Lịch hẹn của bạn đã được thay đổi và xác nhận.' : 'Lịch hẹn của bạn đã được xác nhận.', undefined, booking);
 }
 return reply('I can help with services, pricing, opening hours and appointments.', 'Tôi có thể hỗ trợ bạn về dịch vụ, giá, giờ mở cửa và đặt lịch.', vi ? ['Giá dịch vụ', 'Đặt lịch'] : ['Service prices','Book appointment']);
}
