import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          יוזמת משרד הכלכלה והתעשייה
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">🛒 הסל של ישראל</h1>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          100 מוצרים מובילים במחיר מוזל של{' '}
          <span className="font-bold text-blue-700">30% ויותר</span> — ברשת קארפור
        </p>
        <p className="text-sm text-gray-400 mt-2">בתוקף מ-15.4.2026 למשך 6 חודשים לפחות</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'מוצרים בסל', value: '100', icon: '📦' },
          { label: 'חיסכון ממוצע', value: '30%+', icon: '💰' },
          { label: 'סניפים משתתפים', value: '50', icon: '🏪' },
          { label: 'חיסכון שנתי', value: '~2,000₪', icon: '🎯' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-extrabold text-blue-700">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
        <h2 className="font-bold text-amber-800 mb-2">📌 מה זה הסל של ישראל?</h2>
        <p className="text-sm text-amber-700 leading-relaxed">
          שיתוף פעולה בין משרד הכלכלה לרשת קארפור — 100 מוצרים מובילים נמכרים במחיר מוזל קבוע.
          סה"כ הסל עולה <strong>1,098 ₪</strong> לעומת מחיר ממוצע של כ-1,700 ₪.
          המבצע זמין ב-50 סניפי קארפור מרקט, היפר ומהדרין בכל הארץ.
        </p>
      </div>

      {/* Limit notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 text-sm text-blue-700">
        <strong>⚠️ שים לב:</strong> ניתן לרכוש עד 2 יחידות מכל מוצר בכל קנייה.
        המחירים תקפים בסניפי קארפור מרקט והיפר בלבד (לא בסניפי קארפור סיטי).
      </div>

      {/* CTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/products')}
          className="bg-blue-700 text-white font-bold text-lg py-4 rounded-2xl shadow-md hover:bg-blue-800 transition-colors"
        >
          📦 לרשימת המוצרים
        </button>
        <button
          onClick={() => navigate('/branches')}
          className="bg-white text-blue-700 font-bold text-lg py-4 rounded-2xl border-2 border-blue-700 hover:bg-blue-50 transition-colors"
        >
          🏪 לרשימת הסניפים
        </button>
      </div>
    </main>
  )
}
