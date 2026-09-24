import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Clock, ChevronRight } from "lucide-react"
import { FadeIn } from "@/components/blog/fade-in"
import { BlogFooter } from "@/components/blog/blog-footer"
import { formatDate, getPosts, mediaUrl } from "@/lib/api"
import { siteConfig } from "@/lib/site-config"

export const revalidate = 60

const title = "Блог о лифтах и подъемном оборудовании"
const description =
  "Полезные статьи о выборе, монтаже и обслуживании лифтов в Казахстане. Экспертные материалы от специалистов Skyrise Engineering в Астане."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: "/blog",
    siteName: siteConfig.name,
    title,
    description,
  },
}

const seoTags = [
  "лифты Астана",
  "лифты Казахстан",
  "монтаж лифтов",
  "эскалаторы Астана",
  "грузовые лифты",
  "пассажирские лифты",
  "лифтовое оборудование Казахстан",
]

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
            <img src="/logo.png" alt={siteConfig.name} className="h-8 w-auto" />
            <span className="text-white font-bold hidden sm:block">{siteConfig.name}</span>
          </Link>
          <span className="text-lg font-bold">Блог</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <FadeIn className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4">{title}</h1>
          <p className="text-white/70 text-lg max-w-3xl mx-auto">
            Полезные статьи о выборе, монтаже и обслуживании лифтов в Казахстане.
            Экспертные материалы от специалистов {siteConfig.name} в Астане.
          </p>
        </FadeIn>

        {posts.length === 0 ? (
          <p className="text-center text-white/60 py-16">Статьи скоро появятся. Загляните позже.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <FadeIn
                key={post.id}
                as="article"
                y={30}
                delay={Math.min(index, 9) * 0.1}
                className="group bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <Link href={`/blog/${post.slug}`} className="block h-full">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.coverImage ? mediaUrl(post.coverImage) : "/placeholder.jpg"}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-4 text-sm text-white/50 mb-3">
                      {post.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" aria-hidden="true" />
                          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                        </span>
                      )}
                      {post.readTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" aria-hidden="true" />
                          {post.readTime}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-white/70 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                    <div className="flex items-center text-blue-400 text-sm font-medium">
                      Читать далее
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}

        {/* SEO Footer */}
        <FadeIn delay={0.6} y={0} className="mt-16 p-8 bg-white/5 border border-white/10 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Лифты и эскалаторы в Казахстане</h2>
          <p className="text-white/70 leading-relaxed">
            Компания {siteConfig.name} — ведущий поставщик лифтового оборудования в Республике Казахстан.
            Мы осуществляем полный цикл работ: проектирование, поставку, монтаж и сервисное обслуживание
            пассажирских, грузовых, панорамных и больничных лифтов в Астане, Алматы и других городах страны.
            Наши эскалаторы и траволаторы установлены в крупнейших торговых центрах и бизнес-комплексах Казахстана.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {seoTags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/70">
                {tag}
              </span>
            ))}
          </div>
        </FadeIn>
      </main>

      <BlogFooter />
    </div>
  )
}
