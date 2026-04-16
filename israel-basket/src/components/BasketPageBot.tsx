import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const QA = [
  {
    id: 'what',
    question: 'מה מוצג כאן',
    answer:
      'כאן תראו את כל המוצרים שהוספתם לסל, המחיר הממשלתי הכולל בקארפור, ולצד כל מוצר — הרשת הזולה ביותר לאותו מוצר מבין שופרסל, רמי לוי ויוחננוף.',
  },
  {
    id: 'saving',
    question: 'כמה חוסכים',
    answer:
      'בתחתית כרטיס הסיכום תראו את החיסכון לעומת הרשת הזולה ביותר שמכסה את כל המוצרים שבחרתם. ככל שתוסיפו יותר מוצרים — החיסכון יגדל.',
  },
  {
    id: 'privacy',
    question: 'האם הסל נשמר',
    answer:
      'לא. הסל שלכם לא נשמר בשום מקום — ברגע שתצאו מהדף הוא יאופס. לכן אנחנו ממליצים להוריד את הסיכום כקובץ או לשתף אותו עם משפחה וחברים בוואטסאפ — האפשרות נמצאת ממש מעל רשימת המוצרים.',
  },
  {
    id: 'compare',
    question: 'איך לראות השוואה מלאה',
    answer:
      'לחצו על לשונית "השוואה" בתפריט התחתון — שם תקבלו טבלה מלאה של כל מחירי הרשתות לכל מוצר בסל.',
  },
  {
    id: 'add',
    question: 'איך מוסיפים מוצרים',
    answer:
      'לחצו על "הוסף עוד מוצרים" בתחתית הדף, או על לשונית "מוצרים" בתפריט. תוכלו לסנן לפי קטגוריה ולהוסיף כל מה שתרצו.',
  },
  {
    id: 'partial',
    question: 'מה זה "השוואה חלקית"',
    answer:
      'אם אחת הרשתות לא מוצאת מחיר לחלק מהמוצרים שלכם, ההשוואה תהיה חלקית ותוצג באפור. כדאי להוסיף מוצרים נוספים כדי לקבל תמונה מלאה יותר.',
  },
  {
    id: 'limits',
    question: 'מה חשוב לדעת לפני הקנייה',
    answer:
      'עד 2 יחידות מכל מוצר בכל קנייה. המחירים תקפים בסניפי קארפור מרקט והיפר בלבד — לא בסיטי. מחירי הרשתות מתעדכנים מדי יום ועשויים להשתנות.',
  },
]

interface BasketPageBotProps {
  externalOpen: boolean
  onExternalClose: () => void
}

export default function BasketPageBot({ externalOpen, onExternalClose }: BasketPageBotProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [answeredId, setAnsweredId] = useState<string | null>(null)
  const [typing, setTyping] = useState(false)

  const isOpen = open || externalOpen

  const currentAnswer = QA.find((q) => q.id === answeredId)
  const remainingChips = QA.filter((q) => q.id !== answeredId)

  function handleChip(id: string) {
    setTyping(true)
    setAnsweredId(id)
    setTimeout(() => setTyping(false), 700)
  }

  function handleClose() {
    setOpen(false)
    onExternalClose()
    setAnsweredId(null)
    setTyping(false)
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 inset-x-0 z-50 bg-gray-900 rounded-t-2xl shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '72vh' }}
      >
        {/* Pull handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
          <span className="text-sm font-semibold text-gray-200">שאלו אותי על הסל שלכם</span>
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
              שלום! במה אוכל לעזור לכם עם הסל?
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
                  onClick={() => { navigate('/compare'); handleClose() }}
                  className="w-full bg-blue-700 hover:bg-blue-600 active:scale-95 text-white font-bold text-sm py-3 rounded-xl transition-all mb-2"
                >
                  ראה השוואת מחירים מלאה ←
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
