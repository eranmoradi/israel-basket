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

  const priceRegular = useCountUp(1570, 1200, counting)
  const priceCarrefour = useCountUp(1099, 1600, counting)
  const branches = useCountUp(50, 900, counting)

  return (
    <>
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Hero + CTAs */}
        <div className="rounded-3xl bg-gradient-to-bl from-blue-900 to-blue-700 text-white px-6 py-6 sm:py-8 text-center mb-3 shadow-lg">
          <span className="badge-pulse bg-white/10 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-3 border border-white/30">
            מידע חופשי. שקיפות. שיתוף.
          </span>

          <p className="text-xl sm:text-2xl font-black text-yellow-300 leading-snug mb-4">
            קרפור זכתה במכרז ממשלתי — 30% הנחה קבועה על 100 מוצרים. אבל כמה זה באמת שווה לסל שלך?
          </p>

          <button
            onClick={() => navigate('/products')}
            className="cta-pulse w-full bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-blue-900 font-black text-base py-3 rounded-xl shadow-xl shadow-black/40 transition-all"
          >
            גלו כמה שווה לכם ההנחה ←
          </button>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-xs text-white/50">
            <span>✓ ללא הרשמה</span>
            <span>✓ מחירים מתעדכנים מדי יום</span>
            <span style={{ color: '#25D366' }}>✓ שליחת רשימת הקניות לוואטסאפ</span>
          </div>
        </div>

        {/* WHY section */}
        <div className="bg-gray-900 border border-gray-800 border-r-4 border-r-green-500 rounded-2xl px-6 py-5 mb-6">
          <div className="text-sm text-gray-300 font-semibold tracking-widest uppercase mb-3">למה נוצרה האפליקציה?</div>
          <p className="text-sm text-gray-300 leading-relaxed">
            הסל המלא עולה <span className="text-white font-semibold">1,099₪</span> במקום <span className="text-white font-semibold">~1,570₪</span> — אבל זה תלוי אילו מוצרים אתם בכלל קונים.
          </p>
          <p className="text-sm text-gray-300 leading-relaxed mt-3">
            האפליקציה נוצרה כדי שתוכלו לבחור את המוצרים <span className="text-white font-semibold">שלכם</span>, ולראות מיד: כמה חוסך לכם הסל הזה לפני ואחרי ההנחה — וכמה אותו סל עולה ברשתות אחרות. חינם, בלי הרשמה, תוך 30 שניות.
          </p>
          <p className="text-sm text-gray-300 leading-relaxed mt-3">
            אם אהבתם, שתפו את הקרובים אליכם.
          </p>
        </div>

        {/* Stats cards */}
        <p className="text-sm text-gray-400 text-center mb-3 leading-relaxed">
          אלו נתוני הסל המלא — רוצים לדעת כמה חוסך לכם הסל הספציפי <span className="text-white font-semibold">שלכם</span>? בדקו בכמה לחיצות ↑
        </p>
        <div ref={statsRef} className="grid grid-cols-3 gap-3 mb-2">
          {[
            {
              Icon: Tag,
              value: `~${priceRegular.toLocaleString('he-IL')}₪`,
              label: 'מחיר הסל לפני ההנחה',
              gradient: 'from-gray-400 to-gray-500',
              iconColor: 'text-gray-400',
              to: '/products',
            },
            {
              Icon: CalendarDays,
              value: `${priceCarrefour.toLocaleString('he-IL')}₪`,
              label: 'מחיר הסל בקרפור ✅',
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
              className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-3 sm:p-4 text-center border border-gray-700/60 shadow-lg hover:border-gray-500 hover:from-gray-700 active:scale-95 transition-all"
            >
              <Icon className={`${iconColor} mx-auto mb-1.5`} size={20} strokeWidth={1.75} />
              <div className={`text-sm sm:text-xl font-black bg-gradient-to-b ${gradient} bg-clip-text text-transparent leading-tight whitespace-nowrap`}>
                {value}
              </div>
              <div className="text-[10px] sm:text-[11px] text-gray-500 mt-1.5 leading-tight">{label}</div>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-600 text-center mb-3">
          * עבור 100 המוצרים המלאים · מחיר לפני ההנחה מחושב לפי 30% מתוך מחיר הסל הממשלתי
        </p>

        {/* How-to steps */}
        <div className="bg-gray-900 rounded-2xl px-6 py-8 mb-8">
          <div className="text-sm text-gray-300 font-semibold tracking-widest uppercase mb-6">איך מתחילים?</div>
          <div className="flex flex-col gap-5">
            {[
              {
                step: '1',
                title: 'בחרו את המוצרים שלכם',
                body: 'דפדפו ב-100 המוצרים בסל, הוסיפו לסל את מה שאתם קונים בדרך כלל.',
              },
              {
                step: '2',
                title: 'ראו כמה חוסך לכם הסל',
                body: 'תקבלו מיד: מחיר הסל לפני ואחרי הנחת הסל של ישראל — וכמה עולה אותו סל ברשתות אחרות.',
              },
              {
                step: '3',
                title: 'גשו לסניף וחסכו',
                body: 'מצאו את סניף קארפור הקרוב אליכם וצאו לקנות עם החיסכון בכיס.',
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
          <div className="text-sm text-gray-300 font-semibold tracking-widest uppercase mb-5">מה תקבלו</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                emoji: '📌',
                title: 'מה זה הסל של ישראל?',
                body: 'קרפור זכתה במכרז ממשלתי: 100 מוצרים מובילים ב-30%+ הנחה קבועה. הסל עולה 1,099₪ במקום ~1,570₪ — תקף לפחות עד אוקטובר 2026.',
                border: 'border-r-blue-500',
              },
              {
                emoji: '📊',
                title: 'השוואת מחירים בזמן אמת',
                body: 'הוסיפו מוצרים לסל — ותקבלו מיד השוואה מול שופרסל, רמי לוי, יוחננוף, אושר עד וויקטורי. תראו בדיוק כמה חוסך הסל.',
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

      </main>

      <FirstTimeBot />
    </>
  )
}
