// Simple helper functions for OpenAIServiceImpl
export function createSystemPrompt(phoneNumber?: string, name?: string, historySummary?: string): string {
  return `أنت عنان - مساعد عقاري في شركة "اتجاه العقارية" بجدة.

معلومات المستخدم:
- رقم: ${phoneNumber || 'غير متوفر'}
${name ? `- الاسم: ${name}` : ''}

الرد المطلوب - JSON فقط:
{
  "type": "answer|search|event|reminder",
  "content": "الرد باللهجة السعودية",
  "query": { // للبحث
    "type": "فيلا|شقة|دور|أرض|محل",
    "district": "الحي",
    "purpose": "بيع|إيجار",
    "minPrice": رقم,
    "maxPrice": رقم,
    "bedrooms": رقم,
    "pool": true|false|null,
    "garden": true|false|null
  },
  "eventName": "المناسبة",
  "eventDetails": { // للأحداث
    "name": "اسم المستخدم",
    "phone": "رقم الجوال",
    "propertyId": "معرف العقار",
    "requestType": "pdf|callback|appointment|reminder",
    "reminderDate": "التاريخ YYYY-MM-DD",
    "reminderTime": "الوقت HH:MM",
    "reminderMessage": "رسالة التذكير"
  }
}

قواعد مهمة:
- JSON صحيح فقط
- لا تخترع propertyId
- استخدم المعلومات المذكورة فقط
- استخدم null للحقول غير المذكورة

أمثلة:

التحية:
{
  "type": "answer",
  "content": "أهلاً وسهلاً! أنا عنان مساعدك العقاري. كيف أقدر أساعدك؟"
}

البحث:
{
  "type": "search", 
  "content": "بدور لك على فيلا في الروضة مع حديقة",
  "query": {
    "type": "فيلا",
    "district": "الروضة", 
    "garden": true,
    "purpose": "بيع"
  }
}

طلب PDF:
{
  "type": "event",
  "eventName": "generate_property_pdf",
  "content": "إن شاء الله بعمل لك ملف PDF للعقار",
  "eventDetails": {
    "name": "أحمد",
    "phone": "201015638178",
    "propertyId": "",
    "requestType": "pdf"
  }
}

تذكير:
{
  "type": "reminder",
  "eventName": "client_reminder", 
  "content": "تمام! بذكرك بموعد العميل أحمد يوم الاثنين الساعة 5",
  "eventDetails": {
    "name": "أحمد",
    "phone": "201015638178",
    "reminderDate": "2025-08-11",
    "reminderTime": "17:00",
    "reminderMessage": "موعد العميل أحمد"
  }
}`;
}

export function createUserPrompt(message: string): string {
  return `رسالة العميل: "${message}"

الرد المطلوب: JSON صحيح فقط حسب الهيكل أعلاه - لا تكتب أي نص خارج JSON.`;
}

// Helper function to convert Arabic day names to dates
export function convertArabicDayToDate(dayName: string, baseDate: Date = new Date()): string {
  const dayMap: { [key: string]: number } = {
    'السبت': 6, 'الأحد': 0, 'الاثنين': 1, 'الثلاثاء': 2,
    'الأربعاء': 3, 'الخميس': 4, 'الجمعة': 5
  };
  
  const targetDay = dayMap[dayName];
  if (targetDay === undefined) return baseDate.toISOString().split('T')[0];
  
  const today = new Date(baseDate);
  const todayDay = today.getDay();
  
  let daysToAdd = targetDay - todayDay;
  if (daysToAdd <= 0) daysToAdd += 7; // Next week if day already passed
  
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysToAdd);
  
  return targetDate.toISOString().split('T')[0];
}

// Helper function to convert Arabic time to 24-hour format
export function convertArabicTimeTo24Hour(timeStr: string): string {
  const timeMap: { [key: string]: string } = {
    'الساعة 1': '13:00', 'الساعة 2': '14:00', 'الساعة 3': '15:00',
    'الساعة 4': '16:00', 'الساعة 5': '17:00', 'الساعة 6': '18:00',
    'الساعة 7': '19:00', 'الساعة 8': '20:00', 'الساعة 9': '21:00',
    'الساعة 10': '10:00', 'الساعة 11': '11:00', 'الساعة 12': '12:00',
    'نص النهار': '12:00', 'العصر': '15:30', 'المغرب': '18:00'
  };
  
  return timeMap[timeStr] || '09:00';
}

// Enhanced validation function
export function validateJSONResponse(response: string): boolean {
  try {
    const parsed = JSON.parse(response);
    const requiredFields = ['type', 'content'];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!(field in parsed)) return false;
    }
    
    // Validate type
    const validTypes = ['answer', 'search', 'event', 'reminder'];
    if (!validTypes.includes(parsed.type)) return false;
    
    // Type-specific validation
    if (parsed.type === 'search' && !parsed.query) return false;
    if ((parsed.type === 'event' || parsed.type === 'reminder') && !parsed.eventDetails) return false;
    
    return true;
  } catch {
    return false;
  }
}

// Cost optimization helper
export function optimizePromptLength(systemPrompt: string, userPrompt: string): { system: string; user: string } {
  // Trim unnecessary whitespace and optimize structure
  const optimizedSystem = systemPrompt
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
    
  const optimizedUser = userPrompt
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
    
  return {
    system: optimizedSystem,
    user: optimizedUser
  };
}