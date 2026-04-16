import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag, CalendarDays, MapPin } from 'lucide-react'
import FirstTimeBot from '../components/FirstTimeBot'

function useCountUp(to: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    const startTime = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * to))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active, to, duration])
  return value
}

export default function HomePage() {
  const navigate = useNavigate()
  const statsRef = useRef<HTMLDivElement>(null)
  const [counting, setCounting] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCounting(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  const savingPerPurchase = useCountUp(600, 1200, counting)
  const savingMonthly = useCountUp(2400, 1600, counting)
  const branches = useCountUp(50, 900, counting)

  return (
    <>
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Hero + CTAs */}
        <div className="rounded-3xl bg-gradient-to-bl from-blue-900 to-blue-700 text-white px-8 py-14 sm:py-20 text-center mb-6 shadow-lg">
          <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-5">
            יוזמת משרד הכלכלה והתעשייה
          </span>
          <div className="text-6xl sm:text-8xl font-black text-yellow-300 leading-none mb-1">30%+</div>
          <div className="text-base text-white/80 mb-6">חיסכון ממוצע על 100 מוצרים מובילים</div>
          <div className="text-2xl font-bold text-white mb-1">🛒 הסל של ישראל</div>
          <p className="text-base text-white/70">מחיר מוזל קבוע ברשת קארפור — עם פיקוח מדינה</p>
          <p className="text-xs text-white/50 mt-3 mb-8">בתוקף מ-15.4.2026 למשך 6 חודשים לפחות</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/products')}
              className="bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-blue-900 font-black text-base py-3.5 rounded-xl shadow-lg shadow-black/30 transition-all"
            >
              📦 רשימת המוצרים
            </button>
            <button
              onClick={() => navigate('/branches')}
              className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-base py-3.5 rounded-xl border-2 border-white/40 transition-all"
            >
              🏪 רשימת הסניפים
            </button>
          </div>
        </div>

        {/* WHY section */}
        <div className="bg-gray-900 border border-gray-800 border-r-4 border-r-green-500 rounded-2xl px-6 py-5 mb-6">
          <div className="text-sm text-gray-300 font-semibold tracking-widest uppercase mb-3">למה נוצרה האפליקציה</div>
          <p className="text-sm text-gray-300 leading-relaxed">
            יוקר המחיה בישראל הוא אחד הגבוהים בעולם. הממשלה וקארפור הכריזו על הסל של ישראל, רצינו לוודא שכל אחד יוכל להשתמש בו בקלות ובך לחסוך משמעותית בהוצאות המזון החל מתאריך 15.04.26 למשך 6 חודשים — כל זה בלי לחפש, בלי לנחש. האפליקציה הזאת נוצרה עבור הקהילה מתוך רצון אמיתי וכנה לעזור להוזיל את יוקר המחייה בישראל.
          </p>
        </div>

        {/* Stats cards */}
        <div ref={statsRef} className="grid grid-cols-3 gap-3 mb-2">
          {[
            {
              Icon: Tag,
              value: `~${savingPerPurchase.toLocaleString('he-IL')}₪`,
              label: 'חסכון ממוצע לקנייה *',
              gradient: 'from-yellow-400 to-amber-500',
              iconColor: 'text-amber-400',
              to: '/products',
            },
            {
              Icon: CalendarDays,
              value: `~${savingMonthly.toLocaleString('he-IL')}₪`,
              label: 'חסכון ממוצע חודשי *',
              gradient: 'from-emerald-400 to-teal-500',
              iconColor: 'text-emerald-400',
              to: '/products',
            },
            {
              Icon: MapPin,
              value: branches.toString(),
              label: 'סניפים משתתפים',
              gradient: 'from-blue-400 to-violet-500',
              iconColor: 'text-blue-400',
              to: '/branches',
            },
          ].map(({ Icon, value, label, gradient, iconColor, to }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-4 text-center border border-gray-700/60 shadow-lg hover:border-gray-500 hover:from-gray-700 active:scale-95 transition-all"
            >
              <Icon className={`${iconColor} mx-auto mb-2`} size={24} strokeWidth={1.75} />
              <div className={`text-lg sm:text-xl font-black bg-gradient-to-b ${gradient} bg-clip-text text-transparent leading-tight`}>
                {value}
              </div>
              <div className="text-[11px] text-gray-500 mt-1.5 leading-tight">{label}</div>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-600 text-center mb-8">
          * הנתונים מתייחסים למשפחה בת 4 נפשות · מחושב לפי קנייה שבועית של הסל המלא
        </p>

        {/* How-to steps */}
        <div className="bg-gray-900 rounded-2xl px-6 py-8 mb-8">
          <div className="text-sm text-gray-300 font-semibold tracking-widest uppercase mb-6">איך מתחילים?</div>
          <div className="flex flex-col gap-5">
            {[
              {
                step: '1',
                title: 'בחר את המוצרים שלך',
                body: 'דפדף ב-100 המוצרים בסל, הוסף לסל את מה שאתה קונה בדרך כלל.',
              },
              {
                step: '2',
                title: 'ראה את ההשוואה',
                body: 'תקבל מיד מחיר כולל מול שופרסל, רמי לוי ויוחננוף — וכמה חוסך הסל.',
              },
              {
                step: '3',
                title: 'גש לסניף וחסוך',
                body: 'מצא את סניף קארפור הקרוב אליך וצא לקנות עם החיסכון בכיס.',
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-blue-700 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {step}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-100 mb-0.5">{title}</div>
                  <p className="text-sm text-gray-400 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-900 rounded-2xl px-6 py-8 mb-8">
          <div className="text-sm text-gray-300 font-semibold tracking-widest uppercase mb-5">מה תקבל</div>
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
                className={`bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-700 border-r-4 ${card.border}`}
              >
                <span className="text-2xl mb-2 block">{card.emoji}</span>
                <div className="text-sm font-bold text-gray-100 mb-1">{card.title}</div>
                <p className="text-sm text-gray-400 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-600 text-center mb-3 leading-relaxed">
          מחירי קארפור נשאבים ישירות מהאקסל הרשמי של משרד הכלכלה. מחירי הרשתות המתחרות נשלפים אוטומטית מהאתרים שלהן ומתעדכנים מדי יום. ייתכנו פערים קטנים בין המחיר המוצג לבין המחיר בפועל בחנות.
        </p>

        <p className="text-xs text-gray-600 text-center mb-4">ללא הרשמה · מתעדכן מדי שבוע</p>
      </main>

      <FirstTimeBot />
    </>
  )
}
