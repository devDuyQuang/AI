export type DemoLanguage = 'en' | 'vi';
export type InputLanguage = 'auto' | DemoLanguage;
export const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
export function detectLanguage(text: string): DemoLanguage {
 if (/[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i.test(text.normalize('NFC'))) return 'vi';
 const q = ` ${normalize(text).replace(/[^a-z0-9 ]/g, ' ')} `;
 const phrases = ['dat lich','bao nhieu','mo cua','dong cua','nhan vien','dich vu','hom nay','may gio','lam nail','doi lich'];
 if (phrases.some(p => q.includes(` ${p} `))) return 'vi';
 const words = ['toi','minh','em','anh','gia','muon'];
 return words.filter(w => q.includes(` ${w} `)).length >= 2 || /\bgia\b/.test(q) ? 'vi' : 'en';
}
export function recognitionLocale(selection: InputLanguage, recent?: DemoLanguage) {
 return (selection === 'auto' ? recent || (navigator.language.toLowerCase().startsWith('vi') ? 'vi' : 'en') : selection) === 'vi' ? 'vi-VN' : 'en-US';
}
