/**
 * ALFA PREV — Configuração de serviços externos
 * ==============================================
 * INSTRUÇÃO: Substitua os dois valores abaixo pelos dados do seu projeto
 * no Supabase. Encontre-os em: Supabase Dashboard → Project Settings → API
 *
 *   SUPABASE_URL      → "Project URL"       (ex: https://xyzabcdef.supabase.co)
 *   SUPABASE_ANON_KEY → "anon public key"   (começa com "eyJ...")
 *
 * SEGURANÇA:
 *   • A chave "anon" é projetada para ser pública — pode ficar neste arquivo.
 *   • A segurança contra leitura não-autorizada vem do RLS configurado no banco
 *     (ver supabase-schema.sql): visitantes só podem inserir, nunca ler.
 *   • NUNCA coloque a chave "service_role" aqui — ela dá acesso total ao banco.
 */

const SUPABASE_URL      = '[PREENCHER: Project URL do Supabase — ex: https://xyzabcdef.supabase.co]';
const SUPABASE_ANON_KEY = '[PREENCHER: anon public key do Supabase — começa com eyJ...]';
