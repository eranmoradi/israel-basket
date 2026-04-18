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

  const basketPrice = useCountUp(1099, 1200, counting)
  const avgSaving = useCountUp(560, 1600, counting)
  const branches = useCountUp(50, 900, counting)

  return (
    <>
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Hero + CTAs */}
        <div className="rounded-3xl bg-gradient-to-bl from-blue-900 to-blue-700 text-white px-8 py-14 sm:py-20 text-center mb-6 shadow-lg">
          <span className="badge-pulse bg-white/10 text-white/90 text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-white/30">
            מידע חופשי. שיתוף ציבורי. שינוי אמיתי.
          </span>

          <p className="text-2xl sm:text-3xl font-black text-yellow-300 leading-snug mb-8">
            בעקבות המיזם הסל של ישראל פיתחנו אפליקציה שמשווה את המחירים ברשתות המזון המובילות
          </p>

          <button
            onClick={() => navigate('/products')}
            className="w-full bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-blue-900 font-black text-lg py-4 rounded-xl shadow-xl shadow-black/40 transition-all"
          >
            📦 מתחילים בבדיקה של הסל כאן
          </button>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-6 text-xs text-white/50">
            <span>✓ ללא הרשמה</span>
            <span>✓ מחירים מתעדכנים מדי יום</span>
            <span style={{ color: '#25D366' }}>✓ שליחת רשימת הקניות לוואטסאפ</span>
          </div>
        </div>

        {/* WHY section */}
        <div className="bg-gray-900 border border-gray-800 border-r-4 border-r-green-500 rounded-2xl px-6 py-5 mb-6">
          <div className="text-sm text-gray-300 font-semibold tracking-widest uppercase mb-3">למה נוצרה האפליקציה?</div>
          <p className="text-sm text-gray-300 leading-relaxed">
            קארפור מציעה כ-30% הנחה על 100 מוצרי מזון נפוצים — אבל האם ההנחה הזאת רלוונטית לכם? תלוי אילו מוצרים אתם בכלל קונים.
          </p>
          <p className="text-sm text-gray-300 leading-relaxed mt-3">
            האפליקציה נוצרה כדי שתוכלו לבחור את המוצרים שלכם, ולקבל מיד מספר אחד ברור: כמה חוסכים — על הסל <span className="text-white font-semibold">שלכם</span> — לעומת שופרסל, רמי לוי, יוחננוף ועוד. חינם, בלי הרשמה, תוך 30 שניות.
          </p>
          <p className="text-sm text-gray-300 leading-relaxed mt-3">
            אם אהבתם, שתפו את הקרובים אליכם.
          </p>
        </div>

        {/* Stats cards */}
        <p className="text-sm text-gray-400 text-center mb-3 leading-relaxed">
          אלו הנתונים הרשמיים שהממשלה מציגה —{' '}
          רוצים לדעת אם זה נכון גם לסל <span className="text-white font-semibold">שלכם</span>? בדקו בכמה לחיצות ↑
        </p>
        <div ref={statsRef} className="grid grid-cols-3 gap-3 mb-2">
          {[
            {
              Icon: Tag,
              value: `${basketPrice.toLocaleString('he-IL')}₪`,
              label: 'מחיר הסל בקארפור',
              gradient: 'from-yellow-400 to-amber-500',
              iconColor: 'text-amber-400',
              to: '/products',
            },
            {
              Icon: CalendarDays,
              value: `~${avgSaving.toLocaleString('he-IL')}₪`,
              label: 'חסכון ממוצע מול הרשתות *',
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
          * ממוצע בין שופרסל, רמי לוי, יוחננוף וויקטורי · עבור 100 המוצרים המלאים
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
                title: 'ראו את ההשוואה',
                body: 'תקבלו מיד מחיר כולל מול שופרסל, רמי לוי ויוחננוף — וכמה חוסך הסל.',
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
                body: 'קארפור זכתה במכרז מדינה: 100 מוצרים מובילים ב-30%+ הנחה קבועה — לפחות חצי שנה. הסל עולה 1,098₪ במקום ~1,700₪.',
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
