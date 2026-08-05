// Basic 認証ゲート（音源を含むサイト全体を保護）
// Vercel の Project > Settings > Environment Variables で
//   BASIC_USER … ログインID（未設定なら "liella"）
//   BASIC_PASS … パスワード（必須。未設定だと全アクセスを拒否＝安全側）
// を設定してください。パスワード未設定のデプロイは誰も入れません（fail-closed）。

export const config = { matcher: '/:path*' };

export default function middleware(request) {
  const USER = process.env.BASIC_USER || 'liella';
  const PASS = process.env.BASIC_PASS || '';
  const auth = request.headers.get('authorization') || '';

  if (PASS && auth.startsWith('Basic ')) {
    try {
      const [u, p] = atob(auth.slice(6)).split(':');
      if (u === USER && p === PASS) return; // 認証OK → そのまま配信
    } catch (e) { /* fallthrough */ }
  }

  return new Response('認証が必要です', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="liella-mixer", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
