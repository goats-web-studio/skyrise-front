import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Clock, ChevronRight } from "lucide-react"
import { FadeIn } from "@/components/blog/fade-in"
import { ShareButton } from "@/components/blog/share-button"
import { RequestButton } from "@/components/blog/request-button"
import { ArticleMarkdown } from "@/components/blog/markdown"
import { BlogFooter } from "@/components/blog/blog-footer"
import { formatDate, getPost, getPosts, mediaUrl } from "@/lib/api"
import { siteConfig } from "@/lib/site-config"

export const revalidate = 60

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return { title: "Статья не найдена", robots: { index: false } }
  }

  const title = post.seoTitle || post.title
  const description = post.seoDescription || post.excerpt
  const image = post.coverImage ? mediaUrl(post.coverImage) : undefined

  return {
    title,
    description,
    keywords: post.keywords.length > 0 ? post.keywords : undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/blog/${post.slug}`,
      siteName: siteConfig.name,
      locale: "ru_RU",
      title,
      description,
      publishedTime: post.publishedAt || undefined,
      images: image ? [{ url: image, alt: post.title }] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Назад к блогу</span>
          </Link>
          <ShareButton title={post.title} />
        </div>
      </header>

      {/* Article Content */}
      <main className="pt-20 pb-16">
        {/* Hero Image */}
        <div className="relative h-64 md:h-96 w-full">
          <Image
            src={post.coverImage ? mediaUrl(post.coverImage) : "/placeholder.jpg"}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        </div>

        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
          <FadeIn>
            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-white/50 mb-4">
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

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-8 leading-tight">{post.title}</h1>

            <ArticleMarkdown content={post.content || ""} />

            {/* Related Articles */}
            {post.related.length > 0 && (
              <div className="mt-16 pt-8 border-t border-white/10">
                <h2 className="text-xl font-bold mb-6">Читайте также</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {post.related.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/blog/${related.slug}`}
                      className="group flex gap-4 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {related.coverImage && (
                        <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded">
                          <Image
                            src={mediaUrl(related.coverImage)}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold group-hover:text-blue-400 transition-colors line-clamp-2">
                          {related.title}
                        </h3>
                        <div className="flex items-center text-blue-400 text-sm mt-2">
                          Читать
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 p-6 bg-blue-600/20 border border-blue-500/30 rounded-lg text-center">
              <h2 className="text-xl font-bold mb-2">Нужна консультация по лифтам?</h2>
              <p className="text-white/70 mb-4">
                Специалисты {siteConfig.name} в Астане готовы ответить на ваши вопросы
              </p>
              <RequestButton />
            </div>
          </FadeIn>
        </article>
      </main>

      <BlogFooter className="max-w-4xl" />
    </div>
  )
}
