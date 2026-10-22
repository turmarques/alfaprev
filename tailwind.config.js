/**
 * ALFA PREV — tailwind.config.js
 * ==============================
 * Migração do Tailwind Play CDN (cdn.tailwindcss.com) para o Tailwind CLI
 * compilado localmente (out/2026 — ver publicacao/RELATORIO-TAILWIND-COMPILADO.md).
 *
 * Cores, fontes e extensões abaixo são uma cópia EXATA do bloco `tailwind.config`
 * que antes ficava inline em partials/head-common.html (CDN). Qualquer alteração de
 * cor/fonte deve ser feita aqui — não existe mais config inline no HTML.
 *
 * `content` cobre todos os arquivos onde classes Tailwind aparecem, incluindo
 * script.js (que adiciona/remove classes utilitárias via classList em tempo de
 * execução: "hidden", "border-corp-red", "text-gray-300", "text-gray-200",
 * "text-white"). leads.html/leads/** não usam Tailwind (CSS próprio em
 * assets/css/leads.css), mas incluí-los aqui é inofensivo (não adiciona nenhuma
 * classe que não exista em outro arquivo já escaneado).
 */
module.exports = {
  content: [
    './partials/**/*.html',
    './src/pages/**/*.html',
    './script.js',
  ],
  theme: {
    extend: {
      colors: {
        'corp-red': '#B91C1C',
        'corp-red-dk': '#991B1B',
        'corp-black': '#0F172A',
        'corp-slate': '#1E293B',
        'corp-gray': '#F8FAFC',
        'wa-green': '#25D366',
        'wa-green-dk': '#1da851',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
