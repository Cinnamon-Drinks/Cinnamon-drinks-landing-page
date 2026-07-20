# Git patterns para Cinnamon Drinks

> Quando trabalhar com git neste projeto, consulte estes padrões.
> Última revisão: 2026-05-04 · Versão da stack: git 2.x · Conventional Commits 1.0

## Princípios

- **Conventional Commits em PT-BR**. Tipo em inglês (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`, `build`, `ci`); descrição em português.
- **Branches kebab-case com prefixo de tipo**: `feature/<assunto>`, `fix/<assunto>`, `chore/<assunto>`, `docs/<assunto>`.
- **Commits pequenos e frequentes** > commits grandes e raros. Cada commit deveria passar `pnpm check` e `pnpm test` em isolado.
- **Nunca `--no-verify`**. Pre-commit hook roda `pnpm lint-staged` (Biome) — se falhou, há razão. Bypassar gera código que vai virar PR ruim semana que vem.
- **Nunca force-push em `main`**. Mesmo solo. `main` é histórico imutável. Force-push vale em branches de feature pessoais antes do PR.
- **Imperativo, presente, minúscula** no subject. Sem ponto final. ≤ 72 caracteres no subject.
- Body do commit explica **o porquê**, não o quê. O diff já mostra o quê.

## ✅ Bom

```
feat(form): adiciona máscara BR de telefone com testes Vitest

máscara client-side em src/scripts/whatsapp.ts (maskPhone) com 4 casos
de teste cobrindo telefone com e sem 9º dígito. Server continua
normalizando para dígitos puros via replace(/\D/g, '') antes de montar
o link WhatsApp — máscara é puramente UX.
```
**Por quê:** subject explica intenção (`adiciona máscara`), escopo claro (`(form)`). Body responde "por que precisei testar" e "qual o contrato com server" — útil pra LLM ou humano relendo em 6 meses.

```
fix(menu): restaura comportamento mobile depois de troca de paleta

a classe .menu-toggle estava recebendo background rosa no estado padrão
(memory feedback_neutral_default_colors.md). Volta para branco neutro;
rosa só no estado :hover.
```
**Por quê:** referencia memory para contexto. Quem vir o diff sozinho não entende a regressão; o body conecta.

```bash
# Branches — kebab-case com prefixo
git switch -c feature/astro-migration
git switch -c fix/menu-tabs-mobile
git switch -c chore/upgrade-biome-2.1
git switch -c docs/update-patterns
```
**Por quê:** prefixo grupa. Dá pra `git branch | grep '^feature/'` na hora de revisar pendências. Kebab-case casa com classes/files do projeto — uniforme.

```bash
# Antes do PR — squash de fixups locais, sem alterar main
git rebase -i HEAD~5  # interativo, em branch local
git push --force-with-lease origin feature/x  # ← com-lease, não --force
```
**Por quê:** `--force-with-lease` falha se outra pessoa pushou no meio (proteção contra overwrite acidental). Squash de "wip", "fix typo", "more wip" antes do PR melhora histórico do `main`.

```
refactor(content): extrai schema Site para src/scripts/types.ts

centraliza Lead e Site em types.ts (regra: types de domínio
compartilhados). reserve-form.ts e whatsapp.ts agora importam de lá.
sem mudança de comportamento.
```
**Por quê:** `refactor` é o tipo certo (sem mudança de comportamento). Body fecha o loop ("sem mudança de comportamento") — facilita review e blame futuro.

## ❌ Ruim

```
update stuff
fix things
wip
asdf
```
**Problema:** zero contexto. Em 3 meses ninguém (incluindo você) lembra o que mudou. Conventional Commits + PT-BR resolve em 30 segundos a mais por commit.

```
feat: adicionei o formulário de reserva e arrumei o menu mobile
e também troquei a fonte para Outfit, atualizei o brandbook,
removi o Poppins, ajustei o footer, corrigi 3 bugs de a11y...
```
**Problema:** commit gigante. Impossível reverter um pedaço. Code review vai abandonar. Quebra em 5+ commits, um por mudança lógica.

```bash
# Force-push em main
git push --force origin main
```
**Problema:** apaga histórico. Se outro device/colega tinha clonado, fica out-of-sync. CI vai re-rodar. Em projetos compartilhados pode apagar trabalho alheio. **Nunca em main.** Use `revert` para desfazer um commit ruim.

```bash
# Bypass de pre-commit
git commit --no-verify -m "feat: novo componente"
```
**Problema:** Biome marcou erro de lint? `noExplicitAny`? Commit que ignora hook entra no `main` quebrado, CI verde porque hook é só local. Se o hook tá errado, conserte o hook; se o lint tá errado, conserte o lint. Nunca `--no-verify`.

```
Feat: Adiciona Form
```
**Problema:** Conventional Commits exige minúscula no tipo (`feat`, não `Feat`). Subject capitalizado quebra parsing automático (changelog gen, semantic-release). Linters (`commitlint`) rejeitam.

```bash
# Branch sem prefixo, em camelCase
git switch -c astroMigration
git switch -c new_feature
```
**Problema:** sem prefixo, perde a separação visual de tipo. `camelCase` ou `snake_case` desvia da convenção do projeto. Sempre `<tipo>/<assunto-kebab>`.

```
fix: muda cor pra azul.
```
**Problema:** ponto final desnecessário (estilo). Mas pior: "muda cor pra azul" descreve **o quê**, não o **por quê**. Cor da marca é rosa+laranja+preto+branco — mudar pra azul deveria explicar a intenção (ou ser revertido).

## Referências

- Conventional Commits: https://www.conventionalcommits.org/pt-br/
- Pro Git book (PT-BR): https://git-scm.com/book/pt-br/v2
- `simple-git-hooks` (usado neste projeto): https://github.com/toplenboren/simple-git-hooks
- Cross-ref: `docs/patterns/typescript.md` (regras Biome que o pre-commit roda)
- Spec: §4.6.2 (convenções), §4.6.3 (Biome via lint-staged)
