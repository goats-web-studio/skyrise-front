import { siteConfig } from "@/lib/site-config"

export function BlogFooter({ className = "max-w-7xl" }: { className?: string }) {
  return (
    <footer className="border-t border-white/10 py-8 px-4">
      <div className={`${className} mx-auto text-center text-white/50 text-sm space-y-2`}>
        <p>{siteConfig.name} — лифты и эскалаторы в Астане, Казахстан</p>
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {siteConfig.phones.map((phone) => (
            <a key={phone.href} href={phone.href} className="hover:text-white transition-colors">
              {phone.display}
            </a>
          ))}
          <span aria-hidden="true">|</span>
          <a href={`mailto:${siteConfig.email}`} className="hover:text-white transition-colors">
            {siteConfig.email}
          </a>
        </p>
        <p>© {new Date().getFullYear()} {siteConfig.name}. Все права защищены.</p>
      </div>
    </footer>
  )
}
