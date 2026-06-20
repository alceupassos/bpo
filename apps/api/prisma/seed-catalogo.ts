/**
 * Seed de catálogo: ~80 produtos realistas de mercado/PDV com fotos da web
 * (loremflickr) e regras fiscais por família.
 *
 * 100% idempotente: usa IDs determinísticos (`cat-<slug>-<n>`), barcode e
 * todos os campos derivados de índices (NUNCA Math.random). Faz upsert por id,
 * então rodar de novo só atualiza preço/foto/etc — não duplica nada e não
 * apaga nada (sem deleteMany). Seguro sobre base de produção.
 *
 * Rode com:  npx ts-node prisma/seed-catalogo.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const COMPANY_ID = "company-1";

type Item = {
  name: string;
  unit: "UN" | "KG" | "L";
  price: number;
  stockQty: number;
  /** uma/duas palavras em INGLÊS para a foto (loremflickr separa por vírgula) */
  keyword: string;
};

type Family = {
  category: string;
  slug: string;
  ncm: string;
  items: Item[];
};

const families: Family[] = [
  {
    category: "Padaria",
    slug: "padaria",
    ncm: "19059090",
    items: [
      { name: "Pão Francês", unit: "KG", price: 13.9, stockQty: 60, keyword: "bread" },
      { name: "Pão de Forma Integral", unit: "UN", price: 9.5, stockQty: 40, keyword: "sliced,bread" },
      { name: "Pão de Queijo Congelado", unit: "KG", price: 24.9, stockQty: 35, keyword: "cheese,bread" },
      { name: "Croissant", unit: "UN", price: 6.5, stockQty: 50, keyword: "croissant" },
      { name: "Bolo de Fubá", unit: "UN", price: 18.0, stockQty: 20, keyword: "cake" },
      { name: "Rosca Doce", unit: "UN", price: 12.0, stockQty: 25, keyword: "donut" },
      { name: "Baguete", unit: "UN", price: 7.5, stockQty: 45, keyword: "baguette" },
      { name: "Torrada Tradicional", unit: "UN", price: 8.9, stockQty: 30, keyword: "toast" },
      { name: "Sonho de Creme", unit: "UN", price: 5.5, stockQty: 40, keyword: "pastry" }
    ]
  },
  {
    category: "Mercearia",
    slug: "mercearia",
    ncm: "11010010",
    items: [
      { name: "Arroz Branco Tipo 1 5kg", unit: "UN", price: 28.9, stockQty: 120, keyword: "rice" },
      { name: "Feijão Carioca 1kg", unit: "UN", price: 8.9, stockQty: 100, keyword: "beans" },
      { name: "Macarrão Espaguete 500g", unit: "UN", price: 4.5, stockQty: 90, keyword: "pasta,spaghetti" },
      { name: "Açúcar Refinado 1kg", unit: "UN", price: 5.2, stockQty: 80, keyword: "sugar" },
      { name: "Sal Refinado 1kg", unit: "UN", price: 3.2, stockQty: 70, keyword: "salt" },
      { name: "Óleo de Soja 900ml", unit: "UN", price: 7.8, stockQty: 110, keyword: "cooking,oil" },
      { name: "Farinha de Trigo 1kg", unit: "UN", price: 5.9, stockQty: 60, keyword: "flour" },
      { name: "Molho de Tomate 340g", unit: "UN", price: 3.9, stockQty: 95, keyword: "tomato,sauce" },
      { name: "Café Torrado e Moído 500g", unit: "UN", price: 17.9, stockQty: 75, keyword: "coffee" },
      { name: "Biscoito Recheado 130g", unit: "UN", price: 3.5, stockQty: 130, keyword: "cookie" },
      { name: "Atum em Lata 170g", unit: "UN", price: 9.9, stockQty: 60, keyword: "canned,tuna" },
      { name: "Milho em Conserva 200g", unit: "UN", price: 4.2, stockQty: 70, keyword: "corn" }
    ]
  },
  {
    category: "Bebidas",
    slug: "bebidas",
    ncm: "22021000",
    items: [
      { name: "Refrigerante Cola 2L", unit: "UN", price: 9.9, stockQty: 100, keyword: "soda" },
      { name: "Refrigerante Guaraná 2L", unit: "UN", price: 8.9, stockQty: 90, keyword: "soda,bottle" },
      { name: "Suco de Laranja 1L", unit: "UN", price: 8.5, stockQty: 60, keyword: "orange,juice" },
      { name: "Cerveja Lata 350ml", unit: "UN", price: 4.5, stockQty: 200, keyword: "beer" },
      { name: "Energético 250ml", unit: "UN", price: 8.9, stockQty: 70, keyword: "energy,drink" },
      { name: "Chá Gelado Limão 1,5L", unit: "UN", price: 7.9, stockQty: 50, keyword: "iced,tea" },
      { name: "Água de Coco 1L", unit: "UN", price: 9.5, stockQty: 40, keyword: "coconut,water" },
      { name: "Refrigerante Lata 350ml", unit: "UN", price: 4.2, stockQty: 180, keyword: "soda,can" }
    ]
  },
  {
    category: "Hortifruti",
    slug: "hortifruti",
    ncm: "07099990",
    items: [
      { name: "Banana Prata", unit: "KG", price: 6.9, stockQty: 80, keyword: "banana,fruit" },
      { name: "Maçã Gala", unit: "KG", price: 9.9, stockQty: 70, keyword: "apple,fruit" },
      { name: "Tomate", unit: "KG", price: 8.5, stockQty: 60, keyword: "tomato,vegetable" },
      { name: "Batata", unit: "KG", price: 5.9, stockQty: 100, keyword: "potato" },
      { name: "Cebola", unit: "KG", price: 4.9, stockQty: 90, keyword: "onion" },
      { name: "Alface Crespa", unit: "UN", price: 3.5, stockQty: 40, keyword: "lettuce" },
      { name: "Cenoura", unit: "KG", price: 6.5, stockQty: 55, keyword: "carrot" },
      { name: "Laranja Pera", unit: "KG", price: 5.5, stockQty: 75, keyword: "orange,fruit" },
      { name: "Limão Tahiti", unit: "KG", price: 7.9, stockQty: 50, keyword: "lemon,fruit" },
      { name: "Mamão Formosa", unit: "KG", price: 6.9, stockQty: 35, keyword: "papaya" }
    ]
  },
  {
    category: "Açougue",
    slug: "acougue",
    ncm: "02013000",
    items: [
      { name: "Picanha Bovina", unit: "KG", price: 79.9, stockQty: 25, keyword: "beef,meat" },
      { name: "Alcatra Bovina", unit: "KG", price: 49.9, stockQty: 30, keyword: "steak" },
      { name: "Coxa de Frango", unit: "KG", price: 12.9, stockQty: 60, keyword: "chicken" },
      { name: "Filé de Frango", unit: "KG", price: 19.9, stockQty: 50, keyword: "chicken,breast" },
      { name: "Linguiça Toscana", unit: "KG", price: 24.9, stockQty: 40, keyword: "sausage" },
      { name: "Costela Suína", unit: "KG", price: 22.9, stockQty: 35, keyword: "pork,ribs" },
      { name: "Carne Moída", unit: "KG", price: 32.9, stockQty: 45, keyword: "ground,beef" },
      { name: "Bife de Contrafilé", unit: "KG", price: 54.9, stockQty: 28, keyword: "sirloin" }
    ]
  },
  {
    category: "Frios e Laticínios",
    slug: "frios",
    ncm: "04061010",
    items: [
      { name: "Queijo Mussarela Fatiado", unit: "KG", price: 44.9, stockQty: 30, keyword: "mozzarella,cheese" },
      { name: "Presunto Cozido", unit: "KG", price: 32.9, stockQty: 35, keyword: "ham" },
      { name: "Leite Integral 1L", unit: "UN", price: 5.5, stockQty: 150, keyword: "milk" },
      { name: "Manteiga 200g", unit: "UN", price: 12.9, stockQty: 50, keyword: "butter" },
      { name: "Iogurte Natural 170g", unit: "UN", price: 3.9, stockQty: 80, keyword: "yogurt" },
      { name: "Requeijão Cremoso 200g", unit: "UN", price: 8.9, stockQty: 60, keyword: "cream,cheese" },
      { name: "Queijo Prato", unit: "KG", price: 42.9, stockQty: 28, keyword: "cheese" },
      { name: "Mortadela", unit: "KG", price: 19.9, stockQty: 40, keyword: "mortadella" },
      { name: "Creme de Leite 200g", unit: "UN", price: 3.5, stockQty: 90, keyword: "cream" }
    ]
  },
  {
    category: "Limpeza",
    slug: "limpeza",
    ncm: "34022000",
    items: [
      { name: "Detergente Líquido 500ml", unit: "UN", price: 2.9, stockQty: 120, keyword: "detergent" },
      { name: "Sabão em Pó 1kg", unit: "UN", price: 14.9, stockQty: 70, keyword: "laundry,powder" },
      { name: "Água Sanitária 1L", unit: "UN", price: 5.5, stockQty: 90, keyword: "bleach" },
      { name: "Desinfetante 2L", unit: "UN", price: 9.9, stockQty: 60, keyword: "disinfectant" },
      { name: "Esponja de Aço", unit: "UN", price: 3.5, stockQty: 100, keyword: "sponge" },
      { name: "Amaciante 2L", unit: "UN", price: 13.9, stockQty: 50, keyword: "fabric,softener" },
      { name: "Limpador Multiuso 500ml", unit: "UN", price: 6.9, stockQty: 80, keyword: "cleaner,spray" },
      { name: "Saco de Lixo 50L", unit: "UN", price: 8.9, stockQty: 65, keyword: "garbage,bag" }
    ]
  },
  {
    category: "Higiene",
    slug: "higiene",
    ncm: "33051000",
    items: [
      { name: "Sabonete em Barra 90g", unit: "UN", price: 2.5, stockQty: 130, keyword: "soap" },
      { name: "Shampoo 350ml", unit: "UN", price: 14.9, stockQty: 60, keyword: "shampoo" },
      { name: "Creme Dental 90g", unit: "UN", price: 5.9, stockQty: 90, keyword: "toothpaste" },
      { name: "Papel Higiênico 12 rolos", unit: "UN", price: 18.9, stockQty: 70, keyword: "toilet,paper" },
      { name: "Escova de Dente", unit: "UN", price: 6.9, stockQty: 80, keyword: "toothbrush" },
      { name: "Desodorante Aerosol 150ml", unit: "UN", price: 12.9, stockQty: 55, keyword: "deodorant" },
      { name: "Condicionador 350ml", unit: "UN", price: 15.9, stockQty: 50, keyword: "conditioner" },
      { name: "Fralda Descartável M", unit: "UN", price: 39.9, stockQty: 40, keyword: "diaper" }
    ]
  },
  {
    category: "Bazar",
    slug: "bazar",
    ncm: "39249000",
    items: [
      { name: "Copo Plástico Descartável 200ml", unit: "UN", price: 6.9, stockQty: 90, keyword: "plastic,cup" },
      { name: "Prato Descartável", unit: "UN", price: 7.9, stockQty: 70, keyword: "plastic,plate" },
      { name: "Vela", unit: "UN", price: 2.9, stockQty: 100, keyword: "candle" },
      { name: "Pilha AA 4 unidades", unit: "UN", price: 18.9, stockQty: 60, keyword: "battery" },
      { name: "Pano de Prato", unit: "UN", price: 9.9, stockQty: 50, keyword: "dish,towel" },
      { name: "Filme Plástico PVC", unit: "UN", price: 8.9, stockQty: 55, keyword: "plastic,wrap" },
      { name: "Guardanapo de Papel", unit: "UN", price: 4.9, stockQty: 80, keyword: "napkin" },
      { name: "Isqueiro", unit: "UN", price: 5.9, stockQty: 70, keyword: "lighter" }
    ]
  }
];

/** EAN-13-like determinístico: "789" + 10 dígitos derivados do índice global. */
function makeBarcode(globalIndex: number): string {
  // gera 10 dígitos estáveis a partir do índice (sem aleatoriedade)
  const base = (globalIndex + 1) * 2654435761; // multiplicador inteiro fixo
  const digits = Math.abs(base).toString().padStart(10, "0").slice(-10);
  return `789${digits}`;
}

function buildImageUrl(keyword: string): string {
  // loremflickr separa termos por vírgula; preserva a vírgula ao codificar
  const encoded = keyword
    .split(",")
    .map((k) => encodeURIComponent(k.trim()))
    .join(",");
  return `https://loremflickr.com/640/480/${encoded}`;
}

async function main() {
  let created = 0;
  let updated = 0;
  let globalIndex = 0;

  for (const family of families) {
    let n = 0;
    for (const item of family.items) {
      n += 1;
      globalIndex += 1;
      const id = `cat-${family.slug}-${n}`;
      const price = Math.round(item.price * 100) / 100;
      const cost = Math.round(item.price * 0.7 * 100) / 100;
      const imageUrl = buildImageUrl(item.keyword);
      const barcode = makeBarcode(globalIndex);

      const fields = {
        companyId: COMPANY_ID,
        name: item.name,
        unit: item.unit,
        price,
        cost,
        stockQty: item.stockQty,
        minStock: 5,
        barcode,
        category: family.category,
        imageUrl,
        ncm: family.ncm,
        cfop: "5102",
        csosn: "102",
        origem: "NACIONAL" as const,
        icmsAliquota: 0,
        pisAliquota: 0,
        cofinsAliquota: 0
      };

      const existing = await prisma.product.findUnique({ where: { id } });
      await prisma.product.upsert({
        where: { id },
        update: fields,
        create: { id, ...fields }
      });
      if (existing) {
        updated += 1;
      } else {
        created += 1;
      }
    }
  }

  console.log(
    `Seed de catálogo concluído. Produtos criados: ${created}, atualizados: ${updated} (total ${created + updated}).`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
