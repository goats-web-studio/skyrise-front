# windows-front

Сайт Skyrise Engineering: Next.js 16, React 19, Tailwind 4. Контент (бренды, сертификаты, блог) и заявки хранятся в бэкенде [windows-back](https://github.com/goats-web-studio/windows-back).

## Запуск

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL
npm install
npm run dev                  # http://localhost:3000
```

Админка: `/admin` (логин и пароль задаются в `.env` бэкенда).

Продакшен: `npm run build && npm start`.
