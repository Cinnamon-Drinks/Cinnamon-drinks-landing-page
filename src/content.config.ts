// src/content.config.ts
import { defineCollection, reference, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

const galleryItem = z.object({
  type: z.enum(['image', 'video']),
  src: z.string(),
  alt: z.string()
});

const site = defineCollection({
  loader: file('src/content/site.yml'),
  schema: z.object({
    brandName: z.string(),
    tagline: z.string(),
    cnpj: z
      .string()
      .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'cnpj deve estar em formato XX.XXX.XXX/XXXX-XX'),
    city: z.string(),
    address: z.string(),
    businessHours: z.string(),
    whatsappNumber: z
      .string()
      .regex(/^\d{12,13}$/, 'whatsappNumber deve estar em formato 55XX9XXXXXXXX'),
    email: z.string().email(),
    instagram: z.string(),
    responsibleConsumptionNotice: z
      .string()
      .default('Aprecie com moderação. Venda proibida para menores de 18 anos.')
  })
});

const hero = defineCollection({
  loader: file('src/content/hero.yml'),
  schema: z.object({
    heading: z.string(),
    subheading: z.string(),
    ctaText: z.string().default('Reservar minha data'),
    gallery: z.array(galleryItem).min(1)
  })
});

const about = defineCollection({
  loader: file('src/content/about.yml'),
  schema: z.object({
    heading: z.string(),
    body: z.string(),
    foundedYear: z.number().int().gte(2000).lte(2030),
    mainPhoto: z.string()
  })
});

const team = defineCollection({
  loader: file('src/content/team.yml'),
  schema: z.object({
    heading: z.string(),
    intro: z.string(),
    members: z.array(
      z.object({
        name: z.string(),
        role: z.string(),
        photo: z.string(),
        certifications: z.array(z.string()).optional()
      })
    )
  })
});

const drinks = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/drinks' }),
  schema: z.object({
    name: z.string(),
    category: z.enum(["Caip's", 'Clássicos', 'Gin & Whisky', 'Especiais']),
    ingredients: z.array(z.string()).min(1),
    image: z.string().optional(),
    order: z.number().int()
  })
});

const bars = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/bars' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    gallery: z.array(z.object({ src: z.string(), alt: z.string() })).min(1),
    // Foto vertical (retrato) pro painel alto do Menu 1 — a gallery é toda
    // horizontal/arquitetural e corta mal nesse formato (mostra teto escuro
    // no topo). Opcional: sem essa foto, o painel fica sem imagem até
    // alguém subir uma no enquadramento certo.
    tallPhoto: z.object({ src: z.string(), alt: z.string() }).optional(),
    order: z.number().int()
  })
});

// Rótulo livre da variante "structure": nome, descrição, imagem e preço
// próprios, editados manualmente — sem derivar drinks de categoria.
const structureLabel = z.object({
  name: z.string(),
  description: z.string().optional(),
  // nullish (não só optional): o Sveltia grava `null` quando o admin deixa o
  // object de imagem desabilitado no CMS — optional sozinho só aceita omitido.
  image: z.object({ src: z.string(), alt: z.string() }).nullish(),
  price: z.string().optional()
});

// Cardápio de serviço: cada aba tem nome livre, preço, descrição e uma lista
// curada de drinks (fonte única — sem derivação por categoria). Imagem própria
// no painel lateral, editável pelo admin.
const menuPackageMenu = z.object({
  type: z.literal('menu'),
  name: z.string(),
  combinations: z
    .array(
      z.object({
        // Nome da aba (ex: "Standard"). Obrigatório — antes caía no nome do bar.
        label: z.string(),
        description: z.string().optional(),
        note: z.string().optional(),
        price: z.string().optional(),
        // Painel lateral. nullish: o Sveltia grava null quando o object de
        // imagem é deixado desabilitado no CMS (mesmo padrão do structureLabel).
        image: z.object({ src: z.string(), alt: z.string() }).nullish(),
        // Fonte única dos drinks da aba, na ordem escolhida. Vazio/omitido →
        // aba mostra "Em breve". Teto 20 (= total de drinks hoje).
        drinks: z.array(reference('drinks')).max(20).optional()
      })
    )
    .min(1),
  order: z.number().int(),
  // Some do dropdown do navbar e da página /menu (listagem), mas a página
  // /menu/[slug] continua acessível por link direto — pra pacotes ainda
  // não prontos pra divulgação geral (ex: orçamentos sob consulta).
  hidden: z.boolean().default(false)
});

// Pacote de estrutura: rótulos livres no lugar da combinação bar+categoria.
// Máx. 5 rótulos pra caber na sidebar de abas (StructureLayout).
const menuPackageStructure = z.object({
  type: z.literal('structure'),
  name: z.string(),
  labels: z.array(structureLabel).min(1).max(5),
  order: z.number().int(),
  hidden: z.boolean().default(false)
});

const menuPackages = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/menu-packages' }),
  schema: z.discriminatedUnion('type', [menuPackageMenu, menuPackageStructure])
});

// Orçamentos: propostas enviadas por link no WhatsApp. Pasta própria (separada
// dos 3 pacotes institucionais) pra que o CMS possa travar exclusão dos fixos e
// liberar criar/excluir só aqui — delete no Sveltia é por-coleção. Sempre type
// menu, sempre hidden.
const orcamentos = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/orcamentos' }),
  schema: menuPackageMenu.extend({
    clientName: z.string().optional(),
    publicUrl: z.string().optional(),
    createdAt: z.union([z.string(), z.date()]).optional()
  })
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/testimonials' }),
  schema: z.object({
    author: z.string(),
    eventType: z.string().optional(),
    quote: z.string(),
    photo: z.string().optional()
  })
});

const form = defineCollection({
  loader: file('src/content/form.yml'),
  schema: z.object({
    heading: z.string().default('Reservar minha data'),
    ctaButton: z.string().default('Reservar minha data'),
    successMessage: z.string(),
    errorMessage: z.string(),
    lgpdLabel: z.string().default('Concordo com a Política de Privacidade')
  })
});

const pricing = defineCollection({
  loader: file('src/content/pricing.yml'),
  schema: z.object({
    pricePerGuest: z.string(),
    insurancePerGuest: z.string(),
    vodkaUpgrades: z.array(z.object({ name: z.string(), extraPrice: z.string() })),
    bartenderRatio: z.string().default('1 bartender a cada 30 convidados'),
    disclaimer: z.string().default('Bares personalizados a consultar')
  })
});

export const collections = {
  site,
  hero,
  about,
  team,
  drinks,
  bars,
  menuPackages,
  orcamentos,
  testimonials,
  form,
  pricing
};
