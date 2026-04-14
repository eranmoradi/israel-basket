import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-bl from-blue-800 to-blue-600 text-white px-8 py-14 sm:py-20 text-center mb-8 shadow-lg">
        <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-5">
          יוזמת משרד הכלכלה והתעשייה
        </span>
        <div className="text-6xl sm:text-8xl font-black text-yellow-300 leading-none mb-1">30%+</div>
        <div className="text-base text-white/80 mb-6">חיסכון ממוצע על 100 מוצרים מובילים</div>
        <div className="text-2xl font-bold text-white mb-1">🛒 הסל של ישראל</div>
        <p className="text-base text-white/70">מחיר מוזל קבוע ברשת קארפור — עם פיקוח מדינה</p>
        <p className="text-xs text-white/50 mt-3">בתוקף מ-15.4.2026 למשך 6 חודשים לפחות</p>
      </div>

      {/* CTA — directly below hero */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => navigate('/products')}
          className="bg-blue-700 text-white font-bold text-base py-3.5 rounded-xl shadow-md hover:bg-blue-800 active:scale-95 transition-all"
        >
          📦 רשימת המוצרים
        </button>
        <button
          onClick={() => navigate('/branches')}
          className="bg-white text-blue-700 font-bold text-base py-3.5 rounded-xl border-2 border-blue-700 hover:bg-blue-50 active:scale-95 transition-all"
        >
          🏪 רשימת הסניפים
        </button>
      </div>

      {/* Proof Strip */}
      <div className="flex justify-around items-center py-6 border-y border-gray-100 mb-8">
        {[
          { value: '100', label: 'מוצרים בסל' },
          { value: '50', label: 'סניפים משתתפים' },
          { value: '~2,000₪', label: 'חיסכון שנתי' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-bold text-blue-700">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="bg-gray-50 rounded-2xl px-6 py-8 mb-8">
        <div className="text-xs text-gray-400 font-semibold tracking-widest uppercase mb-5">מה תקבל</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              emoji: '📌',
              title: 'מה זה הסל של ישראל?',
              body: 'קארפור זכתה במכרז מדינה: 100 מוצרים מובילים ב-30%+ הנחה קבועה — לפחות חצי שנה. הסל עולה 1,098 ₪ במקום ~1,700 ₪.',
              border: 'border-r-blue-500',
            },
            {
              emoji: '📊',
              title: 'השוואת מחירים בזמן אמת',
              body: 'הוסף מוצרים לסל — ותקבל מיד השוואה מול שופרסל, רמי לוי, יוחננוף וחצי חינם. תראה בדיוק כמה חוסך הסל.',
              border: 'border-r-purple-500',
            },
            {
              emoji: '🤝',
              title: 'על האפליקציה הזאת',
              body: 'אפליקציה חברתית ועצמאית — לא של קארפור. נוצרה כדי להנגיש את פרטי הסל ולתרום להורדת יוקר המחיה.',
              border: 'border-r-green-500',
            },
            {
              emoji: '⚠️',
              title: 'מגבלות חשובות',
              body: 'עד 2 יחידות מכל מוצר בכל קנייה. תקף בסניפי קארפור מרקט והיפר בלבד — לא בסניפי קארפור סיטי.',
              border: 'border-r-amber-500',
            },
          ].map((card) => (
            <div
              key={card.title}
              className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 border-r-4 ${card.border}`}
            >
              <span className="text-2xl mb-2 block">{card.emoji}</span>
              <div className="text-sm font-bold text-gray-900 mb-1">{card.title}</div>
              <p className="text-sm text-gray-600 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center mb-6 leading-relaxed">
        מחירי הרשתות המתחרות נשלפים אוטומטית מהאתרים שלהן ומתעדכנים מדי יום. ייתכנו פערים קטנים בין המחיר המוצג לבין המחיר בפועל בחנות.
      </p>

      <p className="text-xs text-gray-400 text-center mb-4">ללא הרשמה · מתעדכן מדי שבוע</p>
    </main>
  )
}
