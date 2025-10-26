// Ultra-smart optimized AI helper functions
export function createSystemPrompt(phoneNumber?: string, name?: string, historySummary?: string): string {
  const isDeveloper = phoneNumber === '201015638178';
  
  return `You are عنان, elite AI real estate assistant at إتجاه, Jeddah. ALWAYS respond in natural Saudi dialect Arabic.

${isDeveloper ? '⚠️ DEVELOPER MODE: This is your creator. Be helpful with technical questions, debugging, and system info.' : ''}

User: ${phoneNumber || 'Unknown'}${name ? ` | ${name}` : ''}${isDeveloper ? ' (Developer 👨‍💻)' : ''}
${historySummary || ''}

ADVANCED AI INTELLIGENCE:

1. MEMORY & CONTEXT:
- Track entire conversation flow, reference ANY previous message
- Remember: searches, preferences, budget, liked/disliked properties, family size, urgency level
- Build user profile: serious buyer vs browser, budget range, preferred areas, must-have features
- Context linking: "it"→last property, "bigger"→+size from last, "cheaper"→-price, "similar"→same criteria different location

2. PREDICTIVE REASONING:
- Family indicators→bedrooms: "احنا ٥"=٣-٤غرف، "ولد وبنت"=٣غرف، "متزوج جديد"=١-٢غرف، "عائلة كبيرة"=٥+غرف
- Budget psychology: "عندي X مليون"→likely max is X+٢٠٪ flexibility, "حول X"→±١٥٪ range
- Purpose inference: "للاستثمار"→rental properties+high ROI areas, "للسكن"→family-friendly+schools nearby
- Urgency detection: "ضروري"/"بسرعة"/"محتاج الحين"→immediate availability, "متى تقدرون"→same day response
- Life stage clues: "قبل المدرسة"→needs property before school year, "قبل رمضان"→religious timing matters

3. INTELLIGENT QUESTIONING:
- Progressive narrowing: Start broad→narrow with each question
- Ask ONE critical question at a time (don't overwhelm)
- Smart defaults: If they say price only→assume buying (not rent), location only→ask "شقة ولا فيلا؟"
- Validate ranges: villa for ٥٠٠K→"تقصد ٥٠٠ ألف؟ للأسف الفلل عادة من ١.٥ مليون. تبغى شقق واسعة؟"
- Clarify ambiguity: "غرفتين ولا ثلاث؟" not "كم غرفة؟"

4. SENTIMENT & TONE ADAPTATION:
- Excited buyer→match energy: "ممتاز! الحين بجيب لك خيارات روعة!"
- Frustrated→empathy first: "فاهمك، البحث صعب. خلني أساعدك أحسن"
- Hesitant→gentle push: "عادي تفكر، بس هالعقار طلب عليه. تبغى تحجز معاينة؟"
- Comparing→competitive: "صح هذا حلو، بس عندي أحسن منه بنفس السعر"
- Angry/rude→stay professional: "أعتذر منك. كيف أقدر أصلح الموضوع؟"

5. SEARCH OPTIMIZATION:
- Don't search blindly: Need minimum TYPE or LOCATION
- Flexible ranges: "٢ مليون"→١.٨-٢.٢M, "فوق ٣ مليون"→٣M-٥M reasonable cap
- Feature prioritization: Pool+garden+parking→likely villa not apartment
- Area inference: "حي راقي"→العزيزية/الروضة/الزهراء, "حي شعبي"→budget areas
- Combine signals: furnished+urgent+rent→expat/temporary housing

6. CONVERSATION STATE MACHINE:
- Discovery→Searching→Shortlisting→Viewing→Negotiating→Closing
- Track state, adjust responses: Discovery="ايش تبغى؟", Viewing="متى تبغى تشوفه؟", Negotiating="السعر قابل للتفاوض"
- Buying signals: asking price→interested, asking appointment→ready, asking documents→serious
- Move conversation forward: After ٣ searches→"لقيت شي يعجبك؟ تبغى تشوف واحد منهم؟"

7. SMART DEFAULTS & ASSUMPTIONS:
- No purpose mentioned+price given→assume بيع
- Villa mentioned→assume wants garden+parking (unless apartment building)
- High budget (٥M+)→assume wants luxury features
- Rent+furnished→likely expat or temporary
- Multiple bedrooms→assume family needs privacy
- Investment mention→focus on rental yield not personal taste

JSON OUTPUT:
{
  "type": "answer|search|event|reminder",
  "content": "Saudi dialect response",
  "query": {
    "type": "فيلا|شقة|دور|أرض|محل|استراحة",
    "district": "Arabic name",
    "purpose": "بيع|إيجار",
    "minPrice": number|null,
    "maxPrice": number|null,
    "bedrooms": number|null,
    "bathrooms": number|null,
    "area": number|null,
    "pool": bool|null,
    "garden": bool|null,
    "furnished": bool|null,
    "elevator": bool|null,
    "parking": bool|null
  },
  "eventName": "generate_property_pdf|schedule_callback|schedule_viewing|client_reminder",
  "eventDetails": {
    "name": "name",
    "phone": "phone",
    "propertyId": "ID or empty",
    "requestType": "pdf|callback|appointment|reminder",
    "appointmentDate": "YYYY-MM-DD",
    "appointmentTime": "HH:MM",
    "reminderDate": "YYYY-MM-DD",
    "reminderTime": "HH:MM",
    "reminderMessage": "text",
    "notes": "context"
  },
  "metadata": {
    "confidence": 0.0-1.0,
    "conversationStage": "discovery|searching|shortlisting|viewing|negotiating|closing",
    "userProfile": "first_time_buyer|investor|upgrading|urgent_need|browser",
    "sentiment": "excited|positive|neutral|frustrated|angry",
    "nextAction": "search|clarify|appointment|followup|close"
  }
}

SMART EXAMPLES:

Incomplete info→Smart question:
User:"ابغى فيلا" → {"type":"answer","content":"ممتاز! فيلا في أي منطقة تفضل؟ وكم ميزانيتك تقريباً عشان اجيب لك المناسب؟","metadata":{"conversationStage":"discovery","userProfile":"browser","sentiment":"neutral","nextAction":"clarify"}}

Context memory:
History: User searched ٢غرف نوم apartments
User:"اكبر شوي" → {"type":"search","content":"تمام! بدور لك على شقق ٣ غرف بنفس المنطقة والسعر","query":{"type":"شقة","bedrooms":3,"district":"previous_district","maxPrice":"previous_max"},"metadata":{"conversationStage":"searching","userProfile":"upgrading","sentiment":"positive","nextAction":"search"}}

Family size intelligence:
User:"احنا ٦ اشخاص وعندنا ٣ مليون" → {"type":"search","content":"عائلة ٦ اشخاص تحتاج على الأقل ٤ غرف. بدور لك على فلل مناسبة","query":{"type":"فيلا","bedrooms":4,"minPrice":2500000,"maxPrice":3200000,"garden":true,"purpose":"بيع"},"metadata":{"conversationStage":"searching","userProfile":"first_time_buyer","sentiment":"positive","nextAction":"search"}}

Unrealistic budget→Alternatives:
User:"ابغى فيلا في الروضة بـ٥٠٠ الف" → {"type":"answer","content":"للأسف فلل الروضة تبدأ من ٢.٥ مليون. بس عندي شقق فخمة ٤ غرف في الروضة بميزانيتك. تبغى تشوفها؟","metadata":{"conversationStage":"discovery","userProfile":"first_time_buyer","sentiment":"neutral","nextAction":"clarify"}}

Urgency→Fast action:
User:"محتاج سكن ضروري بكرة" → {"type":"search","content":"فهمتك! بدور لك على خيارات جاهزة للسكن فوراً. أي منطقة؟ وشقة ولا فيلا؟","query":{"type":"شقة","purpose":"إيجار","furnished":true},"metadata":{"conversationStage":"searching","userProfile":"urgent_need","sentiment":"urgent","nextAction":"search"}}

Investment intent:
User:"ابغى استثمر في عقار يأجر كويس" → {"type":"search","content":"استثمار ذكي! الشقق الصغيرة (٢-٣ غرف) في المناطق الحيوية عليها طلب عالي. كم ميزانيتك؟","query":{"type":"شقة","bedrooms":2,"purpose":"بيع"},"metadata":{"conversationStage":"discovery","userProfile":"investor","sentiment":"positive","nextAction":"clarify"}}

Frustration→Empathy:
User:"كل اللي ترسله غالي ومو حلو!" → {"type":"answer","content":"اعذرني، فهمتك غلط. قول لي بالضبط: ايش اقصى ميزانية؟ وايش المواصفات اللي ما تتنازل عنها؟ وانا اجيب لك بالضبط اللي تبغاه","metadata":{"conversationStage":"searching","userProfile":"frustrated_buyer","sentiment":"frustrated","nextAction":"clarify"}}

Multi-property comparison:
User:"ايهم احسن؟" → {"type":"answer","content":"يعتمد على احتياجك: الأول اكبر مساحة والثاني اقرب للخدمات. انت ايش اهم عندك؟","metadata":{"conversationStage":"shortlisting","userProfile":"serious_buyer","sentiment":"positive","nextAction":"clarify"}}

Ready to buy signal:
User:"متى اقدر اشوف العقار؟" → {"type":"event","eventName":"schedule_viewing","content":"ممتاز! انا متاح اليوم والى يومين. متى يناسبك؟ صباحاً ولا مساءً؟","eventDetails":{"name":"${name||''}","phone":"${phoneNumber||''}","propertyId":"last_discussed","requestType":"appointment"},"metadata":{"conversationStage":"viewing","userProfile":"serious_buyer","sentiment":"excited","nextAction":"appointment"}}

Price negotiation:
User:"السعر غالي شوي" → {"type":"answer","content":"فاهمك. المالك مرن بالسعر. كم تشوف السعر المناسب لك؟ وانا اتفاهم معاه","metadata":{"conversationStage":"negotiating","userProfile":"serious_buyer","sentiment":"neutral","nextAction":"followup"}}

ADVANCED PATTERNS:

Price Intelligence:
- "حوالي"/"تقريباً"→±١٥٪, "بحدود"→±١٠٪, "أقل من"→max only, "فوق"/"أكثر من"→min only
- Context: ٣ for villa=٣M, ٥٠٠ for apartment=٥٠٠K
- Negotiation room: Add ٢٠٪ buffer to stated max budget
- "ما عندي غير X"→serious about budget, don't exceed

Time Precision:
- "بكرة"→tomorrow, "بعد بكرة"→+٢ days, "الاسبوع الجاي"→+٧ days
- "الساعة ٥"→١٧:٠٠, "العصر"→١٥:٣٠, "المغرب"→١٨:٠٠, "بعد العشاء"→٢١:٠٠
- "الصبح"→٠٨:٠٠-١٠:٠٠, "الظهر"→١٢:٠٠-١٤:٠٠, "الليل"→٢٠:٠٠-٢٢:٠٠

Urgency Spectrum:
- Critical: "ضروري الحين"/"اليوم"→respond in minutes
- High: "محتاج بسرعة"/"هالاسبوع"→same day
- Medium: "قريب"/"خلال شهر"→within ٢٤h
- Low: "ما فيه استعجال"/"بشوف"→casual followup

Quality Signals:
- Premium: "فخم"/"راقي"/"VIP"/"مميز"→top ٢٠٪ properties
- Standard: "نظيف"/"حلو"/"كويس"→mid-range
- Budget: "عادي"/"بس شغال"/"رخيص"→lower price priority

Location Flexibility:
- Specific: "الروضة بس"→strict district
- Flexible: "الروضة او قريب"→nearby districts OK
- Regional: "شمال جدة"→all northern districts
- Open: "اي مكان"→price/features matter more

CRITICAL RULES:
✓ Build user profile over conversation
✓ Reference previous messages naturally
✓ One focused question when clarifying
✓ Suggest alternatives for unrealistic requests
✓ Match user's energy and urgency
✓ Move conversation toward appointment/closing
✓ Never invent propertyId
✓ Use null for unknown values
✓ Always return valid JSON only
${isDeveloper ? '\n✓ DEVELOPER MODE: Can discuss technical details, system status, debugging info in Arabic or English' : ''}`;
}

export function createUserPrompt(message: string, conversationContext?: string): string {
  const now = new Date();
  const days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  return `Date: ${now.toISOString().split('T')[0]} (${days[now.getDay()]}) | Time: ${now.toTimeString().slice(0,5)}
${conversationContext ? `Context: ${conversationContext}\n` : ''}Message: "${message}"

ANALYZE:
1. What's user REALLY asking? (explicit + implicit intent)
2. Conversation stage? (discovery→searching→viewing→closing)
3. User profile? (serious buyer, browser, investor, urgent)
4. Sentiment? (excited, frustrated, hesitant, ready)
5. Enough info to act? Or need clarification?
6. Best response type and next action?

Return ONLY valid JSON:`;
}

// Enhanced context extractor with profile building
export function extractConversationContext(messages: Array<{role: string, content: string}>): string {
  if (!messages?.length) return '';
  
  const profile: any = {
    searches: [],
    budget: null,
    preferences: [],
    likedProperties: [],
    dislikedProperties: []
  };
  
  const recent = messages.slice(-8); // Last 4 exchanges
  const ctx: string[] = [];
  
  recent.forEach(msg => {
    if (msg.role === 'user') {
      ctx.push(msg.content.substring(0, 100));
      
      // Extract budget mentions
      const budgetMatch = msg.content.match(/(\d+)\s*(مليون|ألف)/);
      if (budgetMatch) profile.budget = budgetMatch[0];
      
      // Extract preferences
      if (/مسبح/.test(msg.content)) profile.preferences.push('pool');
      if (/حديقة/.test(msg.content)) profile.preferences.push('garden');
      if (/مفروش/.test(msg.content)) profile.preferences.push('furnished');
    } else {
      try {
        const p = JSON.parse(msg.content);
        if (p.type === 'search' && p.query) {
          profile.searches.push(`${p.query.type||'?'} في ${p.query.district||'؟'}`);
        }
      } catch {}
    }
  });
  
  const contextParts: string[] = [];
  if (profile.searches.length) contextParts.push(`Searched: ${profile.searches.slice(-2).join(', ')}`);
  if (profile.budget) contextParts.push(`Budget: ${profile.budget}`);
  if (profile.preferences.length) contextParts.push(`Wants: ${profile.preferences.join('+')}`);
  
  return contextParts.join(' | ');
}

// Smart date converter with relative understanding
export function convertArabicDayToDate(day: string, base = new Date()): string {
  const relative: Record<string, number> = {
    'اليوم':0,'الحين':0,'حالاً':0,'الآن':0,
    'بكرة':1,'بكره':1,'غداً':1,'غدا':1,
    'بعد بكرة':2,'بعد بكره':2,'بعد غد':2,'بعد غدا':2,
    'الاسبوع الجاي':7,'الاسبوع القادم':7,'الجمعة الجاية':5,
    'اخر الاسبوع':5,'نهاية الاسبوع':6
  };
  
  const days: Record<string, number> = {
    'الأحد':0,'الاحد':0,'الاثنين':1,'الثلاثاء':2,'الثلاثا':2,
    'الأربعاء':3,'الاربعاء':3,'الأربعا':3,'الخميس':4,'الجمعة':5,'الجمعه':5,'السبت':6
  };
  
  if (relative[day] !== undefined) {
    const d = new Date(base);
    d.setDate(d.getDate() + relative[day]);
    return d.toISOString().split('T')[0];
  }
  
  if (days[day] !== undefined) {
    const d = new Date(base);
    let add = days[day] - d.getDay();
    if (add <= 0) add += 7;
    d.setDate(d.getDate() + add);
    return d.toISOString().split('T')[0];
  }
  
  return base.toISOString().split('T')[0];
}

// Enhanced time parser with flexible understanding
export function convertArabicTimeTo24Hour(time: string): string {
  const exact: Record<string, string> = {
    '١':'١٣:٠٠','٢':'١٤:٠٠','٣':'١٥:٠٠','٤':'١٦:٠٠','٥':'١٧:٠٠','٦':'١٨:٠٠','٧':'١٩:٠٠','٨':'٢٠:٠٠','٩':'٢١:٠٠','١٠':'٢٢:٠٠','١١':'٢٣:٠٠','١٢':'١٢:٠٠',
    '1':'13:00','2':'14:00','3':'15:00','4':'16:00','5':'17:00','6':'18:00','7':'19:00','8':'20:00','9':'21:00','10':'22:00','11':'23:00','12':'12:00',
    'الساعة ١':'13:00','الساعة ٢':'14:00','الساعة ٣':'15:00','الساعة ٤':'16:00','الساعة ٥':'17:00',
    'الساعة ٦':'18:00','الساعة ٧':'19:00','الساعة ٨':'20:00','الساعة ٩':'21:00','الساعة ١٠':'22:00',
    'الساعة 1':'13:00','الساعة 2':'14:00','الساعة 3':'15:00','الساعة 4':'16:00','الساعة 5':'17:00',
    'الساعة 6':'18:00','الساعة 7':'19:00','الساعة 8':'20:00','الساعة 9':'21:00','الساعة 10':'22:00'
  };
  
  const periods: Record<string, string> = {
    'الفجر':'05:30','الصبح':'08:00','الصباح':'09:00','الضحى':'10:00',
    'الظهر':'12:30','نص النهار':'12:00','الظهيرة':'13:00',
    'العصر':'15:30','عصراً':'16:00','قبل المغرب':'17:00',
    'المغرب':'18:00','بعد المغرب':'19:00',
    'العشاء':'20:00','بعد العشاء':'21:00','الليل':'21:00','نص الليل':'00:00'
  };
  
  const flexible: Record<string, string> = {
    'الصبح بدري':'07:00','الصبح متأخر':'10:00',
    'بعد الظهر':'14:00','العصرية':'16:00',
    'المسا':'19:00','مساءً':'19:00'
  };
  
  const t = time.trim();
  return exact[t] || periods[t] || flexible[t] || '09:00';
}

// Advanced price parser with psychology
export function parseArabicPrice(text: string, context?: 'villa'|'apartment'|'land', userType?: string): number | null {
  if (!text) return null;
  
  const hasM = /مليون|ملیون/i.test(text);
  const hasK = /ألف|الف|آلاف|ك(?!\w)/i.test(text);
  const numMatch = text.match(/[\d.٠-٩]+/);
  if (!numMatch) return null;
  
  // Convert Arabic numerals to English
  const arabicNum = numMatch[0].replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  let num = parseFloat(arabicNum);
  if (isNaN(num)) return null;
  
  // Apply multipliers
  if (hasM) return num * 1_000_000;
  if (hasK) return num * 1000;
  
  // Smart inference based on context and number size
  if (num < 100) {
    // Context-based inference
    if (context === 'villa' && num < 10) return num * 1_000_000; // "3" = 3M
    if (context === 'apartment' && num < 5) return num * 1_000_000; // "2" = 2M
    if (context === 'land' && num < 20) return num * 1_000_000; // "5" = 5M
    if (num >= 50 && num < 1000) return num * 1000; // "500" = 500K
  }
  
  // Add negotiation buffer for investors (they always have more)
  if (userType === 'investor' && num > 500000) {
    return num * 1.2; // 20% buffer
  }
  
  return num;
}

// Smarter validation with helpful errors
export function validateJSONResponse(response: string): { valid: boolean; error?: string; suggestion?: string } {
  try {
    const p = JSON.parse(response);
    
    if (!p.type) return { valid: false, error: 'Missing type', suggestion: 'Add "type" field' };
    if (!p.content) return { valid: false, error: 'Missing content', suggestion: 'Add "content" field with Arabic text' };
    
    const validTypes = ['answer','search','event','reminder'];
    if (!validTypes.includes(p.type)) {
      return { valid: false, error: `Invalid type: ${p.type}`, suggestion: `Use: ${validTypes.join('|')}` };
    }
    
    if (p.type === 'search' && !p.query) {
      return { valid: false, error: 'Search needs query', suggestion: 'Add "query" object with search criteria' };
    }
    
    if ((p.type === 'event' || p.type === 'reminder') && (!p.eventDetails || !p.eventName)) {
      return { valid: false, error: 'Event needs eventDetails and eventName', suggestion: 'Add both fields' };
    }
    
    return { valid: true };
  } catch (e) {
    return { valid: false, error: `JSON parse failed: ${e}`, suggestion: 'Check JSON syntax' };
  }
}

// Enhanced JSON cleaner
export function cleanJSONResponse(response: string): string {
  let clean = response
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
  
  // Find JSON object (handle nested braces)
  let braceCount = 0;
  let startIdx = clean.indexOf('{');
  if (startIdx === -1) return clean;
  
  for (let i = startIdx; i < clean.length; i++) {
    if (clean[i] === '{') braceCount++;
    if (clean[i] === '}') braceCount--;
    if (braceCount === 0) {
      return clean.substring(startIdx, i + 1);
    }
  }
  
  return clean;
}

// Token optimizer
export function optimizePromptLength(system: string, user: string): { system: string; user: string; savedTokens: number } {
  const originalLength = system.length + user.length;
  
  const optimizedSystem = system
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ {2,}/g, ' ')
    .replace(/\t+/g, '')
    .trim();
    
  const optimizedUser = user
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ {2,}/g, ' ')
    .trim();
  
  const newLength = optimizedSystem.length + optimizedUser.length;
  const savedTokens = Math.floor((originalLength - newLength) / 4); // Rough token estimate
  
  return { system: optimizedSystem, user: optimizedUser, savedTokens };
}

// Advanced criteria extraction with intelligence
export function extractSearchCriteria(msg: string, prev?: any, userProfile?: any): any {
  const c = prev ? {...prev} : {};
  
  // Property types with variations
  const typePatterns: [string, RegExp][] = [
    ['فيلا', /فيلا|فلل|فيلات|villa/i],
    ['شقة', /شقة|شقق|apartment|flat/i],
    ['دور', /دور|أدوار|ادوار|floor/i],
    ['أرض', /أرض|ارض|اراضي|أراضي|land/i],
    ['محل', /محل|محلات|shop|store/i],
    ['استراحة', /استراحة|استراحات|resort|rest/i]
  ];
  
  for (const [type, pattern] of typePatterns) {
    if (pattern.test(msg)) c.type = type;
  }
  
  // Purpose with context
  if (/إيجار|ايجار|أجار|للإيجار|للايجار|rent|مستأجر/i.test(msg)) {
    c.purpose = 'إيجار';
  } else if (/بيع|شراء|للبيع|buy|sale|تمليك/i.test(msg)) {
    c.purpose = 'بيع';
  } else if (!c.purpose && /استثمار/i.test(msg)) {
    c.purpose = 'بيع'; // Investment usually means buying
  }
  
  // Features with priority
  if (/مسبح|pool|swim/i.test(msg)) c.pool = true;
  if (/حديقة|حوش|garden|yard/i.test(msg)) c.garden = true;
  if (/مفروش|مفروشة|furnished/i.test(msg)) c.furnished = true;
  if (/مصعد|اسانسير|elevator|lift/i.test(msg)) c.elevator = true;
  if (/موقف|مواقف|جراج|parking|garage/i.test(msg)) c.parking = true;
  
  // Bedrooms with context
  const brMatch = msg.match(/(\d+|[٠-٩]+)\s*(?:غرف|غرفة|bedroom|BR)/i);
  if (brMatch) {
    const numStr = brMatch[1].replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    c.bedrooms = parseInt(numStr);
  }
  
  // Family size inference
  const familyMatch = msg.match(/احنا\s+(\d+|[٠-٩]+)/i);
  if (familyMatch && !c.bedrooms) {
    const size = parseInt(familyMatch[1].replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()));
    c.bedrooms = size <= 3 ? 2 : size <= 5 ? 3 : 4;
  }
  
  // Area extraction
  const areaMatch = msg.match(/(\d+|[٠-٩]+)\s*(?:متر|م٢|م2|sqm|square)/i);
  if (areaMatch) {
    const numStr = areaMatch[1].replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    c.area = parseInt(numStr);
  }
  
  // Quality inference
  if (/فخم|راقي|VIP|مميز|luxury/i.test(msg)) {
    c.quality = 'premium';
  } else if (/عادي|بسيط|رخيص|budget/i.test(msg)) {
    c.quality = 'budget';
  }
  
  return c;
}

// Helper: Get tomorrow's date
export function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

// Helper: Get current time in 24h format
export function getCurrentTime(): string {
  return new Date().toTimeString().slice(0, 5);
}

// Helper: Convert Arabic numerals to English
export function convertArabicNumerals(text: string): string {
  return text.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
}

// Helper: Detect user intent from message
export function detectUserIntent(message: string, history?: string): string {
  const msg = message.toLowerCase();
  
  // Urgency signals
  if (/ضروري|بسرعة|محتاج الحين|urgent/i.test(msg)) return 'urgent_need';
  
  // Investment signals
  if (/استثمار|مردود|ايجار|rental yield/i.test(msg)) return 'investor';
  
  // Serious buyer signals
  if (/ابي اشوف|متى اقدر|موعد معاينة|appointment/i.test(msg)) return 'serious_buyer';
  
  // Price negotiation
  if (/غالي|رخيص|السعر|كم|price/i.test(msg)) return 'negotiating';
  
  // Comparison
  if (/احسن|افضل|قارن|compare|better/i.test(msg)) return 'comparing';
  
  // Browsing
  if (/عندكم|ودي اشوف|ابغى اعرف|show me/i.test(msg)) return 'browsing';
  
  // First time
  if (!history || history.length < 50) return 'first_contact';
  
  return 'searching';
}

// Helper: Detect sentiment
export function detectSentiment(message: string): string {
  const msg = message.toLowerCase();
  
  // Negative
  if (/مو عاجبني|سيء|غلط|مشكلة|زعلان|bad|angry/i.test(msg)) return 'negative';
  
  // Frustrated
  if (/كل شي غالي|ما لقيت|تعبت|frustrated/i.test(msg)) return 'frustrated';
  
  // Excited
  if (/ممتاز|روعة|حلو مره|رهيب|excellent|perfect/i.test(msg)) return 'excited';
  
  // Positive
  if (/حلو|كويس|تمام|good|nice/i.test(msg)) return 'positive';
  
  // Urgent
  if (/ضروري|بسرعة|محتاج الحين/i.test(msg)) return 'urgent';
  
  return 'neutral';
}

// Helper: Extract district/neighborhood from message
export function extractDistrict(message: string): string | null {
  const districts = [
    'الروضة','العزيزية','الزهراء','السلامة','البوادي','الصفا',
    'النعيم','الشاطئ','الحمراء','المرجان','الفيصلية','الخالدية',
    'الرحاب','النسيم','الواحة','الياسمين','ابحر','ذهبان'
  ];
  
  for (const district of districts) {
    if (message.includes(district)) return district;
  }
  
  // Check for variations
  if (/شمال جدة|الشمال/i.test(message)) return 'شمال جدة';
  if (/جنوب جدة|الجنوب/i.test(message)) return 'جنوب جدة';
  if (/وسط جدة|الوسط/i.test(message)) return 'وسط جدة';
  
  return null;
}

// Helper: Build user profile from conversation
export function buildUserProfile(messages: Array<{role: string, content: string}>): any {
  const profile = {
    maxBudget: null as number | null,
    preferredType: null as string | null,
    preferredDistricts: [] as string[],
    mustHaveFeatures: [] as string[],
    familySize: null as number | null,
    urgencyLevel: 'normal' as string,
    userType: 'browser' as string,
    sentimentHistory: [] as string[]
  };
  
  messages.forEach(msg => {
    if (msg.role !== 'user') return;
    
    const content = msg.content;
    
    // Extract budget
    const budgetMatch = content.match(/(\d+)\s*مليون/);
    if (budgetMatch) {
      const budget = parseInt(budgetMatch[1]) * 1_000_000;
      if (!profile.maxBudget || budget > profile.maxBudget) {
        profile.maxBudget = budget;
      }
    }
    
    // Extract property type preference
    if (/فيلا/i.test(content) && !profile.preferredType) profile.preferredType = 'فيلا';
    if (/شقة/i.test(content) && !profile.preferredType) profile.preferredType = 'شقة';
    
    // Extract districts
    const district = extractDistrict(content);
    if (district && !profile.preferredDistricts.includes(district)) {
      profile.preferredDistricts.push(district);
    }
    
    // Extract features
    if (/مسبح/i.test(content) && !profile.mustHaveFeatures.includes('pool')) {
      profile.mustHaveFeatures.push('pool');
    }
    if (/حديقة/i.test(content) && !profile.mustHaveFeatures.includes('garden')) {
      profile.mustHaveFeatures.push('garden');
    }
    
    // Detect family size
    const familyMatch = content.match(/احنا\s+(\d+)/);
    if (familyMatch && !profile.familySize) {
      profile.familySize = parseInt(familyMatch[1]);
    }
    
    // Update urgency
    if (/ضروري|بسرعة/i.test(content)) profile.urgencyLevel = 'high';
    
    // Detect user type
    if (/استثمار/i.test(content)) profile.userType = 'investor';
    if (/ابي اشوف|موعد/i.test(content)) profile.userType = 'serious_buyer';
    
    // Track sentiment
    profile.sentimentHistory.push(detectSentiment(content));
  });
  
  return profile;
}

// Helper: Generate smart follow-up question
export function generateSmartFollowUp(criteria: any, userProfile: any): string {
  // Check what's missing
  const missing: string[] = [];
  
  if (!criteria.type) missing.push('type');
  if (!criteria.district) missing.push('district');
  if (!criteria.minPrice && !criteria.maxPrice) missing.push('price');
  if (!criteria.bedrooms && userProfile.familySize) missing.push('bedrooms');
  
  // Generate appropriate question
  if (missing.length === 0) return '';
  
  if (missing.includes('type') && missing.includes('district')) {
    return 'ممتاز! تبغى شقة ولا فيلا؟ وفي أي حي تفضل؟';
  }
  
  if (missing.includes('type')) {
    return 'تمام! تبغى شقة، فيلا، ولا دور؟';
  }
  
  if (missing.includes('district')) {
    return 'حلو! في أي منطقة أو حي تبغاها؟';
  }
  
  if (missing.includes('price')) {
    return 'كويس! كم ميزانيتك تقريباً؟';
  }
  
  if (missing.includes('bedrooms')) {
    return 'طيب، كم غرفة نوم تحتاج؟';
  }
  
  return 'تمام! في مواصفات ثانية تبغاها؟';
}

// Helper: Calculate price range from budget
export function calculatePriceRange(budget: number, flexibility: number = 0.15): { min: number, max: number } {
  return {
    min: Math.floor(budget * (1 - flexibility)),
    max: Math.floor(budget * (1 + flexibility))
  };
}

// Helper: Validate property criteria completeness
export function validateCriteriaCompleteness(criteria: any): { complete: boolean, missing: string[] } {
  const required = ['type', 'district', 'purpose'];
  const recommended = ['minPrice', 'maxPrice', 'bedrooms'];
  
  const missing: string[] = [];
  
  for (const field of required) {
    if (!criteria[field]) missing.push(field);
  }
  
  const complete = missing.length === 0;
  
  return { complete, missing };
}