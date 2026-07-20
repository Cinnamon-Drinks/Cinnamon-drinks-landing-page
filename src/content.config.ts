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
    address: z.string(),
    businessHours: z.string(),
    whatsappNumber: z
      .string()
      .regex(/^\d{12,13}$/, 'whatsappNumber deve estar em formato 55XX9XXXXXXXX'),
    email: z.string().email(),
    instagram: z.string()
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

const menuPackages = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/menu-packages' }),
  schema: z.object({
    name: z.string(),
    layout: z.enum(['menu-1', 'menu-2', 'menu-3', 'menu-4']),
    combinations: z
      .array(
        z.object({
          bar: reference('bars'),
          category: z.enum(["Caip's", 'Clássicos', 'Gin & Whisky', 'Especiais'])
        })
      )
      .min(1),
    order: z.number().int()
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
  testimonials,
  form,
  pricing
};
