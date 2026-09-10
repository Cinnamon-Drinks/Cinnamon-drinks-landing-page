// Regera o default de "combinations" da collection `orcamentos` no Sveltia
// CMS a partir do conteúdo atual de src/content/menu-packages/pacotes-de-servico.yml
// — assim todo orçamento novo já nasce com a mesma estrutura/preço/drinks do
// Pacote de Serviço vigente, sem exigir sincronizar o config.yml manualmente.
//
// Rodado automaticamente via `predev`/`prebuild` (package.json). Reescreve
// SÓ o trecho entre os marcadores BEGIN/END abaixo em public/admin/config.yml
// — o resto do arquivo (comentários, outras collections, formatação) não é
// tocado, porque re-serializar o config.yml inteiro via YAML dump perderia
// comentários e reordenaria chaves.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const root = fileURLToPath(new URL('..', import.meta.url));
const sourcePath = `${root}/src/content/menu-packages/pacotes-de-servico.yml`;
const configPath = `${root}/public/admin/config.yml`;

const BEGIN =
  '# BEGIN generated:orcamento-default (sync-orcamento-defaults.mjs — não editar à mão)';
const END = '# END generated:orcamento-default';

const source = yaml.load(readFileSync(sourcePath, 'utf8'));

if (!Array.isArray(source?.combinations) || source.combinations.length === 0) {
  throw new Error(
    `sync-orcamento-defaults: "combinations" não encontrado ou vazio em ${sourcePath}`
  );
}

// Só os campos que existem no field `combinations` da collection `orcamentos`
// (mesmo shape do menuPackageMenu.combinations no content.config.ts) — o
// pacote fonte não tem "image" hoje, mas preservamos se algum dia tiver.
const defaultCombinations = source.combinations.map((c) => {
  const item = {
    label: c.label,
    ...(c.description !== undefined && { description: c.description }),
    ...(c.note !== undefined && { note: c.note }),
    ...(c.price !== undefined && { price: c.price }),
    ...(c.image !== undefined && { image: c.image }),
    ...(c.drinks !== undefined && { drinks: c.drinks })
  };
  return item;
});

const dumped = yaml.dump({ default: defaultCombinations }, { lineWidth: -1 });
// `default:` do CMS fica no mesmo nível de indentação que `fields:` dentro do
// field `combinations` (8 espaços neste config.yml) — reindenta cada linha
// do dump (que sai em coluna 0) por esse prefixo.
const indent = '        ';
const generatedBlock = dumped
  .trimEnd()
  .split('\n')
  .map((line) => (line ? indent + line : line))
  .join('\n');

const config = readFileSync(configPath, 'utf8');
const beginIdx = config.indexOf(BEGIN);
const endIdx = config.indexOf(END);

if (beginIdx === -1 || endIdx === -1 || endIdx < beginIdx) {
  throw new Error(
    `sync-orcamento-defaults: marcadores BEGIN/END não encontrados em ${configPath}. ` +
      'Adicione manualmente uma vez (ver docs/patterns/sveltia-cms.md) antes de rodar este script.'
  );
}

const before = config.slice(0, beginIdx + BEGIN.length);
const after = config.slice(endIdx);
const next = `${before}\n${generatedBlock}\n${indent}${after}`;

if (next !== config) {
  writeFileSync(configPath, next);
  console.log('sync-orcamento-defaults: config.yml atualizado.');
} else {
  console.log('sync-orcamento-defaults: já estava em dia, nada a fazer.');
}
