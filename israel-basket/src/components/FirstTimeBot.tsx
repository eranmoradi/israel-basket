import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const QA = [
  {
    id: 'start',
    question: 'איך מתחילים',
    answer:
      '1. לחץ על "מוצרים" בתפריט התחתון\n2. הוסף לסל את המוצרים שאתה קונה בדרך כלל\n3. עבור ל"הסל שלי" לראות את הסכום הכולל\n4. ב"השוואה" תראה מול כמה משלמים בשאר הרשתות\n5. בסניפים תמצא את הקרוב אליך',
  },
  {
    id: 'what',
    question: 'מה זה הסל של ישראל',
    answer:
      'יוזמת ממשלה משותפת עם קארפור: 107 מוצרים מובילים + 9 תחליפים זולים — כולם ב-30%+ הנחה קבועה. בתוקף מ-15.4.2026 למשך 6 חודשים לפחות.',
  },
  {
    id: 'privacy',
    question: 'האם הסל שלי נשמר',
    answer:
      'לא. האפליקציה לא שומרת שום מידע — הסל מתאפס ברגע שיוצאים. לפני שיוצאים לקנות, כדאי להוריד את הסיכום כקובץ או לשתף בוואטסאפ — האפשרות נמצאת בעמוד הסל. שיתוף עם חברים הוא גם הדרך הכי טובה לעזור לעוד אנשים לחסוך 😉',
  },
  {
    id: 'save',
    question: 'כמה אפשר לחסוך',
    answer:
      'הסל המלא עולה ~1,098₪ במקום ~1,700₪ בשאר הרשתות — חיסכון של כ-2,000₪ בשנה למשפחה שקונה שבועית.',
  },
  {
    id: 'compare',
    question: 'איך עובדת ההשוואה',
    answer:
      'הוסף מוצרים לסל — האפליקציה תשלוף אוטומטית את המחירים מהאתרים של שופרסל, רמי לוי ויוחננוף ותציג לך את הרשת הזולה ביותר לסל שלך.',
  },
  {
    id: 'limits',
    question: 'מה ההגבלות',
    answer:
      'עד 2 יחידות מכל מוצר בכל קנייה. תקף בסניפי קארפור מרקט והיפר בלבד — לא בסניפי קארפור סיטי.',
  },
  {
    id: 'trust',
    question: 'האם הנתונים אמינים',
    answer:
      'מחירי קארפור מגיעים מהאקסל הרשמי של משרד הכלכלה. מחירי הרשתות האחרות נשלפים מהאתרים שלהן ומתעדכנים מדי יום.',
  },
  {
    id: 'why',
    question: 'למה נוצרה האפליקציה',
    answer:
      'כי הסל הוכרז אבל לא היה כלי נוח להשתמש בו. האפליקציה עצמאית — לא של קארפור — ונוצרה מתוך רצון כן לעזור לכולם לחסוך.',
  },
]

const VISITED_KEY = 'home-visited'

export default function FirstTimeBot() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(
    () => !!localStorage.getItem(VISITED_KEY)
  )
  const [answeredId, setAnsweredId] = useState<string | null>(null)
  const [typing, setTyping] = useState(false)

  // Mark as visited on first mount so next visit shows the pill
  useEffect(() => {
    localStorage.setItem(VISITED_KEY, '1')
  }, [])

  const currentAnswer = QA.find((q) => q.id === answeredId)
  const remainingChips = QA.filter((q) => q.id !== answeredId)

  function handleChip(id: string) {
    setTyping(true)
    setAnsweredId(id)
    setTimeout(() => setTyping(false), 700)
  }

  function handleClose() {
    setOpen(false)
    setAnsweredId(null)
    setTyping(false)
  }

  return (
    <>
      {/* FAB — first visit */}
      {!hasInteracted && !open && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40">
          <span className="absolute inset-0 rounded-full animate-ping bg-amber-400 opacity-30 pointer-events-none" />
          <button
            onClick={() => { setOpen(true); setHasInteracted(true) }}
            className="relative flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-white text-base font-bold px-6 py-3 rounded-full shadow-xl shadow-amber-500/40 transition-all whitespace-nowrap"
          >
            <span className="text-lg">💬</span>
            <span>פעם ראשונה כאן?</span>
          </button>
        </div>
      )}

      {/* Header button — after first interaction */}
      {hasInteracted && !open && (
        <button
          onClick={() => setOpen(true)}
          style={{ zIndex: 9999 }}
        className="fixed top-3 left-4 flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg ring-2 ring-white/40 transition-all whitespace-nowrap"
        >
          <span>💬</span>
          <span>פעם ראשונה כאן?</span>
        </button>
      )}

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 inset-x-0 z-50 bg-gray-900 rounded-t-2xl shadow-2xl transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '72vh' }}
      >
        {/* Pull handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
          <span className="text-sm font-semibold text-gray-200">שאל אותי כל שאלה על האפליקציה</span>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-300 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: 'calc(72vh - 90px)' }}>
          {/* Opening bot message */}
          <div className="flex gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-sm flex-shrink-0">
              💬
            </div>
            <div className="bg-gray-800 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-gray-200 leading-relaxed">
              שלום! אני כאן כדי לעזור לך להתחיל. מה תרצה לדעת?
            </div>
          </div>

          {/* Initial chips */}
          {!answeredId && (
            <div className="flex flex-wrap gap-2 mb-4 mr-10">
              {QA.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleChip(q.id)}
                  className="bg-blue-950/60 border border-blue-800 hover:bg-blue-900 hover:border-blue-500 text-blue-300 text-sm px-3 py-1.5 rounded-full transition-colors"
                >
                  {q.question}
                </button>
              ))}
            </div>
          )}

          {/* Conversation after selection */}
          {answeredId && (
            <>
              {/* User bubble */}
              <div className="flex justify-start mb-3">
                <div className="bg-blue-800 text-white rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm max-w-[80%]">
                  {currentAnswer?.question}
                </div>
              </div>

              {/* Bot answer */}
              <div className="flex gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-sm flex-shrink-0">
                  💬
                </div>
                <div className="bg-gray-800 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-gray-200 leading-relaxed whitespace-pre-line">
                  {typing ? (
                    <span className="inline-flex gap-1 items-center h-5">
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  ) : (
                    currentAnswer?.answer
                  )}
                </div>
              </div>

              {/* Follow-up */}
              {!typing && remainingChips.length > 0 && (
                <>
                  <div className="flex gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-sm flex-shrink-0">
                      💬
                    </div>
                    <div className="bg-gray-800 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-gray-200">
                      יש עוד שאלות?
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-5 mr-10">
                    {remainingChips.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => handleChip(q.id)}
                        className="bg-blue-950/60 border border-blue-800 hover:bg-blue-900 hover:border-blue-500 text-blue-300 text-sm px-3 py-1.5 rounded-full transition-colors"
                      >
                        {q.question}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* CTA */}
              {!typing && (
                <button
                  onClick={() => { navigate('/products'); handleClose() }}
                  className="w-full bg-blue-700 hover:bg-blue-600 active:scale-95 text-white font-bold text-sm py-3 rounded-xl transition-all mb-2"
                >
                  בואו נתחיל ← רשימת המוצרים
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
