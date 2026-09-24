import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Страница не найдена</h1>
        <p className="text-white/60 mb-6">Возможно, она была удалена или ещё не опубликована.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/blog" className="text-blue-400 hover:underline">
            Вернуться в блог
          </Link>
          <Link href="/" className="text-blue-400 hover:underline">
            На главную
          </Link>
        </div>
      </div>
    </div>
  )
}
