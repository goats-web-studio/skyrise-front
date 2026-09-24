import Markdown, { type Components } from "react-markdown"
import { mediaUrl } from "@/lib/api"

const components: Components = {
  h1: ({ node: _node, ...props }) => <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 text-white" {...props} />,
  h2: ({ node: _node, ...props }) => <h2 className="text-2xl font-bold mt-8 mb-4 text-white" {...props} />,
  h3: ({ node: _node, ...props }) => <h3 className="text-xl font-bold mt-6 mb-3 text-white" {...props} />,
  p: ({ node: _node, ...props }) => <p className="text-white/80 text-lg leading-relaxed mb-4" {...props} />,
  ul: ({ node: _node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2 text-white/80 text-lg marker:text-white/50" {...props} />,
  ol: ({ node: _node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-white/80 text-lg marker:text-white/50" {...props} />,
  li: ({ node: _node, ...props }) => <li className="leading-relaxed pl-1" {...props} />,
  a: ({ node: _node, href, ...props }) => {
    const external = Boolean(href && /^https?:\/\//i.test(href))
    return (
      <a
        href={href}
        className="text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      />
    )
  },
  strong: ({ node: _node, ...props }) => <strong className="font-bold text-white" {...props} />,
  em: ({ node: _node, ...props }) => <em className="italic" {...props} />,
  img: ({ node: _node, src, alt, ...props }) => (
    <img
      src={typeof src === "string" ? mediaUrl(src) : undefined}
      alt={alt ?? ""}
      loading="lazy"
      className="w-full h-auto rounded-lg my-6 border border-white/10"
      {...props}
    />
  ),
  blockquote: ({ node: _node, ...props }) => (
    <blockquote className="border-l-4 border-blue-500/60 bg-white/5 pl-4 pr-4 py-2 my-6 italic text-white/80 [&>p]:mb-0" {...props} />
  ),
  hr: ({ node: _node, ...props }) => <hr className="my-8 border-white/10" {...props} />,
  pre: ({ node: _node, ...props }) => (
    <pre className="my-6 p-4 rounded-lg bg-white/5 border border-white/10 overflow-x-auto text-sm [&>code]:bg-transparent [&>code]:p-0" {...props} />
  ),
  code: ({ node: _node, ...props }) => <code className="px-1.5 py-0.5 rounded bg-white/10 text-sm" {...props} />,
}

export function ArticleMarkdown({ content }: { content: string }) {
  return (
    <div className="max-w-none">
      <Markdown components={components} skipHtml>
        {content}
      </Markdown>
    </div>
  )
}
