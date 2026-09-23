function makeId() {
  return globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

import { availableStaff, services, slots } from '../data/demoData';
import { normalize, type DemoLanguage } from './language';
import type { Booking, Flow, Message } from '../types/demo';

// Thêm tham số thứ 4: choiceLanguage vào định nghĩa của hàm respond
export function respond(
  input: string, 
  previous: Flow, 
  bookings: Booking[], 
  choiceLanguage?: DemoLanguage // <-- Thêm biến này ở đây để đồng bộ với dòng 107 bên file UI
): { message: Message; flow: Flow; booking?: Booking; language: DemoLanguage } {
  
  const q = normalize(input).trim();
  
  // Tự động nhận diện ngôn ngữ dựa trên choiceLanguage được truyền sang, nếu không có thì lấy từ previous flow hoặc mặc định là 'en'
  const language: DemoLanguage = choiceLanguage ?? previous.language ?? 'en';
  let flow = { ...previous, language };
 
  // Hàm tạo câu trả lời hỗ trợ cả tiếng Anh và tiếng Việt dựa vào biến `language`
  const reply = (en: string, vi: string, choices?: string[], booking?: Booking) => {
    const text = language === 'vi' ? vi : en;
    return { 
      message: { id: makeId(), role: 'ai' as const, language, text, choices, booking }, 
      flow, 
      booking, 
      language 
    };
  };

  const service = services.find(s => q.includes(s.name.toLowerCase()) || q.includes(s.id === 'pedicure' ? 'pedicure' : s.id === 'art' ? 'nail art' : s.id));

  // 1. Kịch bản Hủy / Làm lại
  if (/cancel|start over|reset|clear|stop|huy|lam lai|dat lai/.test(q)) { 
    flow = { language }; 
    return reply(
      'Of course. Let’s start fresh. What can I help you with today?',
      'Dĩ nhiên rồi. Chúng ta hãy bắt đầu lại từ đầu nhé. Tôi có thể giúp gì cho bạn hôm nay?'
    ); 
  }
 
  // 2. Kịch bản Hỏi giờ mở cửa
  if (/hour|opening|open|close|when do you|what time|time do you|available today|gio|mo cua|dong cua|may gio/.test(q)) {
    return reply(
      'We’re open Monday through Saturday from 9:00 AM to 8:00 PM, and Sundays from 10:00 AM to 6:00 PM. Would you like to check out our open slots?',
      'Chúng tôi mở cửa từ Thứ Hai đến Thứ Bảy từ 9:00 sáng đến 8:00 tối, và Chủ Nhật từ 10:00 sáng đến 6:00 chiều. Bạn có muốn kiểm tra các khung giờ còn trống không?'
    );
  }
 
  // 3. Kịch bản Hỏi giá
  if (/price|cost|how much|rate|fee|charge|menu|expensive|cheap|gia|bao nhieu|tien|bang gia|re|dat/.test(q)) {
    if (service) {
      return reply(
        `${service.name} is \$${service.price} and takes about ${service.duration} minutes. Would you like me to book this for you?`,
        `${service.name} có giá là \$${service.price} và mất khoảng ${service.duration} phút thực hiện. Bạn có muốn tôi đặt lịch dịch vụ này không?`
      );
    }
    return reply(
      'Here are our popular services:\n• Classic Manicure: \$28 (45 min)\n• Gel Manicure: \$38 (60 min)\n• Spa Pedicure: \$45 (60 min)\n• Nail Art: from \$15\n\nWhich one are you interested in?',
      'Dưới đây là các dịch vụ phổ biến của chúng tôi:\n• Làm móng cổ điển (Classic Manicure): \$28 (45 phút)\n• Làm móng dạng Gel (Gel Manicure): \$38 (60 phút)\n• Làm móng chân Spa (Spa Pedicure): \$45 (60 phút)\n• Nghệ thuật vẽ móng (Nail Art): từ \$15\n\nBạn đang quan tâm đến dịch vụ nào ạ?'
    );
  }
 
  // 4. Kịch bản Gặp người thật
  if (/human|person|talk to staff|team member|representative|real agent|manager|call you|nhan vien|gap nguoi that|tu van vien/.test(q) || q === 'staff' || q === 'nhan vien') { 
    flow = { language }; 
    return reply(
      'I can patch you through to our front desk team member. Please contact Aurora Nail Studio directly at our main line.',
      'Tôi có thể chuyển máy cho bạn đến nhân viên quầy lễ tân. Vui lòng liên hệ trực tiếp với Aurora Nail Studio qua số hotline chính của chúng tôi.'
    ); 
  }
 
  // 5. Kịch bản Đổi lịch
  if ((/reschedule|change|move|shift|modify/.test(q) && /appointment|booking|date|time/.test(q)) || (/doi lich|doi gio|thay doi|chuyen lich/.test(q) && /lich hen|dat lich|ngay|gio/.test(q))) {
    const last = bookings.at(-1);
    if (!last) { 
      flow = { language, step: 'service' }; 
      return reply(
        'I don’t see an active booking for this session yet. Which service would you like to schedule first?',
        'Tôi chưa tìm thấy lịch hẹn nào đang hoạt động trong phiên này. Bạn muốn lên lịch cho dịch vụ nào trước tiên?',
        services.map(s => s.name)
      ); 
    }
    flow = { language, step: 'time', serviceId: services.find(s => s.name === last.service)?.id, rescheduleCode: last.code };
    return reply(
      `Sure, let’s move your ${last.service}. We have a few slots left today. Please pick a new time.`,
      `Chắc chắn rồi, hãy đổi lịch cho dịch vụ ${last.service} của bạn. Chúng tôi còn vài khung giờ trống hôm nay. Vui lòng chọn giờ mới.`,
      slots
    );
  }
 
  if (service) flow.serviceId = service.id;
 
  // Xử lý nhận diện thời gian nhạy bén hơn
  const spokenTime = q.replace(/\bthree thirty\b/g, '3:30').replace(/\b(two|three|five)\b/g, word => ({two:'2',three:'3',five:'5'})[word]!).replace(/\b()\s*p\.?\s*m\.?/g, '\$1:00 pm');
  const time = slots.find(t => spokenTime.includes(t.toLowerCase()) || q === t.replace(' PM','').toLowerCase() || q.includes(t.replace(' PM','')));
  if (time) flow.time = time;
 
  // 6. Tiến trình Đặt lịch (Book / Appointment)
  if (flow.step || service || /book|appointment|schedule|get an slot|visit|reservation|reserve|dat lich|hen|book|dat cho/.test(q)) {
    if (!flow.serviceId) { 
      flow.step = 'service'; 
      return reply(
        'Absolutely! What service can I get started for you today?',
        'Hoàn toàn được chứ! Tôi có thể bắt đầu chuẩn bị dịch vụ nào cho bạn hôm nay đây?',
        services.map(s => s.name)
      ); 
    }
    if (!flow.time) { 
      flow.step = 'time'; 
      return reply(
        'Awesome. I have some openings left for today. What time works best for you?',
        'Tuyệt vời. Tôi còn một vài khung giờ trống hôm nay. Giờ nào sẽ phù hợp nhất với bạn?',
        slots
      ); 
    }
    const chosenStaff = availableStaff(flow.time).find(s => q.includes(s.toLowerCase()));
    if (!chosenStaff) { 
      flow.step = 'staff'; 
      return reply(
        `We have ${availableStaff(flow.time).join(' and ')} available at ${flow.time}. Who would you prefer to work with?`,
        `Chúng tôi có ${availableStaff(flow.time).join(' và ')} đang trống lịch vào lúc ${flow.time}. Bạn muốn ưu tiên làm việc cùng ai ạ?`,
        availableStaff(flow.time)
      ); 
    }
  
    const selected = services.find(s => s.id === flow.serviceId)!;
    const booking = { 
      code: flow.rescheduleCode || `KF-${2048 + bookings.length}`, 
      service: selected.name, 
      time: flow.time, 
      staff: chosenStaff, 
      duration: selected.duration, 
      date: new Date().toLocaleDateString('en-CA') 
    };
  
    const reschedule = !!flow.rescheduleCode;
    flow = { language };
    
    return reply(
      reschedule ? 'Got it! Your appointment has been successfully rescheduled. You’re all set!' : 'Perfect! Your appointment is all set. We look forward to seeing you!',
      reschedule ? 'Đã ghi nhận! Lịch hẹn của bạn đã được thay đổi thành công. Mọi thứ đã sẵn sàng!' : 'Hoàn hảo! Lịch hẹn của bạn đã được thiết lập xong. Chúng tôi rất mong được đón tiếp bạn!',
      undefined,
      booking
    );
  }
 
  // Câu trả lời mặc định khi sếp nói câu xã giao hoặc câu khác ngoài luồng
  return reply(
    'I can assist you with pricing, checking our opening hours, or booking an appointment. What would you like to do?',
    'Tôi có thể hỗ trợ bạn về giá cả, kiểm tra giờ mở cửa hoặc đặt lịch hẹn. Bạn muốn thực hiện điều nào ạ?',
    language === 'vi' ? ['Giá dịch vụ', 'Đặt lịch hẹn'] : ['Service prices', 'Book appointment']
  );
}
