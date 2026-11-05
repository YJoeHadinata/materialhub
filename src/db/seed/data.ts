export interface SeedMaterialType {
  name: string;
  slug: string;
  description: string;
}

export interface SeedFinish {
  name: string;
  slug: string;
  description: string;
}

export interface SeedApplication {
  name: string;
  slug: string;
}

export interface SeedProduct {
  sku: string;
  name: string;
  slug: string;
  description: string;
  materialSlug: string;
  finishSlug: string;
  dimensionText: string;
  widthMm: number;
  heightMm: number;
  thicknessMm: number;
  moqValue: number;
  moqUnit: string;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  isFeatured: boolean;
  applicationSlugs: string[];
  primaryColorHex: string;
  secondaryColorHex: string;
}

export const SEED_MATERIAL_TYPES: SeedMaterialType[] = [
  {
    name: "Natural Stone",
    slug: "natural-stone",
    description:
      "Quarried architectural limestone, travertine, basalt, and marble slabs engineered for interior and exterior specification.",
  },
  {
    name: "Ceramic",
    slug: "ceramic",
    description:
      "High-density sintered porcelain and kiln-fired architectural terracotta tiles with low water absorption.",
  },
  {
    name: "Timber",
    slug: "timber",
    description:
      "FSC-certified European oak, thermo-treated ash, and engineered acoustic wood cladding systems.",
  },
  {
    name: "Metal Panels",
    slug: "metal-panels",
    description:
      "Anodized aluminum, patinated bronze, and woven architectural stainless steel mesh for facades and interiors.",
  },
  {
    name: "Glass",
    slug: "glass",
    description:
      "Fluted, laminated, and low-iron structural architectural glass partitions and acoustic glazing units.",
  },
];

export const SEED_FINISHES: SeedFinish[] = [
  {
    name: "Honed Matte",
    slug: "honed-matte",
    description: "Velvety non-reflective surface ground to a smooth architectural plane.",
  },
  {
    name: "Brushed Textured",
    slug: "brushed-textured",
    description: "Directional linear wire-brushed surface highlighting natural grain.",
  },
  {
    name: "Fluted Ribbed",
    slug: "fluted-ribbed",
    description: "Precision CNC-milled or extruded linear relief profile.",
  },
  {
    name: "Polished Specular",
    slug: "polished-specular",
    description: "High-clarity mirror-grade surface bringing depth to veining and color.",
  },
  {
    name: "Sandblasted",
    slug: "sandblasted",
    description: "Fine-grit micro-textured slip-resistant architectural finish.",
  },
  {
    name: "Anodized Satin",
    slug: "anodized-satin",
    description: "Electrochemically Passivated metallic finish with uniform satin sheen.",
  },
  {
    name: "Natural Unsealed",
    slug: "natural-unsealed",
    description: "Raw tactile mineral or timber surface prepared for custom site sealing.",
  },
  {
    name: "Patinated Oxide",
    slug: "patinated-oxide",
    description: "Controlled mineral oxidation delivering deep architectural bronze tones.",
  },
];

export const SEED_APPLICATIONS: SeedApplication[] = [
  { name: "Flooring", slug: "flooring" },
  { name: "Wall Cladding", slug: "wall-cladding" },
  { name: "Facade", slug: "facade" },
  { name: "Countertops", slug: "countertops" },
  { name: "Acoustic Ceilings", slug: "acoustic-ceilings" },
  { name: "Interior Partitions", slug: "interior-partitions" },
  { name: "Wet Areas", slug: "wet-areas" },
  { name: "Bespoke Joinery", slug: "bespoke-joinery" },
];

export const SEED_PRODUCTS: SeedProduct[] = [
  // NATURAL STONE (9 products)
  {
    sku: "MH-STN-001",
    name: "Jura Beige Architectural Limestone",
    slug: "jura-beige-architectural-limestone",
    description:
      "Dense German sedimentary limestone characterized by warm fossilized inclusions and low porosity. Calibrated for high-traffic commercial lobbies and ventilated rain-screen facades.",
    materialSlug: "natural-stone",
    finishSlug: "honed-matte",
    dimensionText: "2400 x 1200 x 20 mm",
    widthMm: 1200,
    heightMm: 2400,
    thicknessMm: 20,
    moqValue: 25,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: true,
    applicationSlugs: ["flooring", "wall-cladding", "facade"],
    primaryColorHex: "#D8CFC2",
    secondaryColorHex: "#B5A895",
  },
  {
    sku: "MH-STN-002",
    name: "Pietra Grey Basaltina Slab",
    slug: "pietra-grey-basaltina-slab",
    description:
      "Volcanic Italian basalt stone with fine mineral grain and uniform charcoal-ash coloration. Resistant to thermal shock and suited for exterior podiums and monolithic reception counters.",
    materialSlug: "natural-stone",
    finishSlug: "sandblasted",
    dimensionText: "1800 x 900 x 30 mm",
    widthMm: 900,
    heightMm: 1800,
    thicknessMm: 30,
    moqValue: 30,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: true,
    applicationSlugs: ["flooring", "facade", "countertops"],
    primaryColorHex: "#5B5D5A",
    secondaryColorHex: "#3E403D",
  },
  {
    sku: "MH-STN-003",
    name: "Tivoli Vein-Cut Silver Travertine",
    slug: "tivoli-vein-cut-silver-travertine",
    description:
      "Linear vein-cut Italian travertine featuring stratified silver, taupe, and warm alabaster bands. Supplied unfilled or resin-filled for vertical gallery walls.",
    materialSlug: "natural-stone",
    finishSlug: "honed-matte",
    dimensionText: "2600 x 1300 x 20 mm",
    widthMm: 1300,
    heightMm: 2600,
    thicknessMm: 20,
    moqValue: 20,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["wall-cladding", "countertops"],
    primaryColorHex: "#B9B4AA",
    secondaryColorHex: "#8C867B",
  },
  {
    sku: "MH-STN-004",
    name: "Valser Quartzite Ribbed Cladding",
    slug: "valser-quartzite-ribbed-cladding",
    description:
      "Alpine micaceous quartzite precision-milled with 15 mm linear flutes. Exceptional frost resistance and compressive strength for hospitality wellness spaces and facades.",
    materialSlug: "natural-stone",
    finishSlug: "fluted-ribbed",
    dimensionText: "1200 x 600 x 25 mm",
    widthMm: 600,
    heightMm: 1200,
    thicknessMm: 25,
    moqValue: 15,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["wall-cladding", "facade", "wet-areas"],
    primaryColorHex: "#7A8280",
    secondaryColorHex: "#565D5B",
  },
  {
    sku: "MH-STN-005",
    name: "Calacatta Viola Brecciated Marble",
    slug: "calacatta-viola-brecciated-marble",
    description:
      "Classic Apuan brecciated marble displaying dramatic burgundy-violet matrix veining around creamy clasts. Book-matched slabs for statement hospitality bars and executive boardrooms.",
    materialSlug: "natural-stone",
    finishSlug: "polished-specular",
    dimensionText: "2800 x 1600 x 20 mm",
    widthMm: 1600,
    heightMm: 2800,
    thicknessMm: 20,
    moqValue: 12,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["wall-cladding", "countertops", "bespoke-joinery"],
    primaryColorHex: "#EAE4DC",
    secondaryColorHex: "#6D4B52",
  },
  {
    sku: "MH-STN-006",
    name: "Nordic Verde Serpentinite Tile",
    slug: "nordic-verde-serpentinite-tile",
    description:
      "Deep forest-green metamorphic stone with subtle calcite fissures. Wire-brushed surface provides R10 slip resistance for spa floors and boutique retail circulation.",
    materialSlug: "natural-stone",
    finishSlug: "brushed-textured",
    dimensionText: "900 x 900 x 18 mm",
    widthMm: 900,
    heightMm: 900,
    thicknessMm: 18,
    moqValue: 20,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["flooring", "wet-areas", "countertops"],
    primaryColorHex: "#3C4F42",
    secondaryColorHex: "#243329",
  },
  {
    sku: "MH-STN-007",
    name: "Moca Cream Cross-Cut Limestone",
    slug: "moca-cream-cross-cut-limestone",
    description:
      "Portuguese limestone cut perpendicular to the bedding plane for a clouded, homogeneous warm sand aesthetic. Engineered for unitized curtain wall stone panels.",
    materialSlug: "natural-stone",
    finishSlug: "honed-matte",
    dimensionText: "1500 x 750 x 30 mm",
    widthMm: 750,
    heightMm: 1500,
    thicknessMm: 30,
    moqValue: 40,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["facade", "wall-cladding", "flooring"],
    primaryColorHex: "#DFD3C0",
    secondaryColorHex: "#C2B299",
  },
  {
    sku: "MH-STN-008",
    name: "Nero Marquina Honed Monolith",
    slug: "nero-marquina-honed-monolith",
    description:
      "Bituminous Basque black limestone with sparse, high-contrast white calcite veins. Satin honed surface prevents glare under architectural spotlighting.",
    materialSlug: "natural-stone",
    finishSlug: "honed-matte",
    dimensionText: "2400 x 1200 x 20 mm",
    widthMm: 1200,
    heightMm: 2400,
    thicknessMm: 20,
    moqValue: 18,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["flooring", "wall-cladding", "countertops"],
    primaryColorHex: "#262626",
    secondaryColorHex: "#4F4F4F",
  },
  {
    sku: "MH-STN-009",
    name: "Ceppo di Gre Conglomerate Slab",
    slug: "ceppo-di-gre-conglomerate-slab",
    description:
      "Lombard dolomitic breccia featuring iconic pebble-like clasts in cool mid-grey tones. Suitable for civic architecture, gallery plinths, and exterior colonnades.",
    materialSlug: "natural-stone",
    finishSlug: "brushed-textured",
    dimensionText: "2000 x 1000 x 25 mm",
    widthMm: 1000,
    heightMm: 2000,
    thicknessMm: 25,
    moqValue: 25,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["flooring", "wall-cladding", "facade"],
    primaryColorHex: "#8B8E8D",
    secondaryColorHex: "#626564",
  },

  // CERAMIC (8 products)
  {
    sku: "MH-CER-001",
    name: "Sintered Basalt Large-Format Porcelain",
    slug: "sintered-basalt-large-format-porcelain",
    description:
      "Ultra-compact 12 mm sintered porcelain slab firing natural feldspar and clay minerals at 1250 degrees Celsius. Zero VOC, stain-proof, and UV-stable for worktops and facades.",
    materialSlug: "ceramic",
    finishSlug: "honed-matte",
    dimensionText: "3200 x 1600 x 12 mm",
    widthMm: 1600,
    heightMm: 3200,
    thicknessMm: 12,
    moqValue: 35,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: true,
    applicationSlugs: ["countertops", "wall-cladding", "facade", "flooring"],
    primaryColorHex: "#4D4F52",
    secondaryColorHex: "#323436",
  },
  {
    sku: "MH-CER-002",
    name: "Impruneta Extruded Terracotta Baguette",
    slug: "impruneta-extruded-terracotta-baguette",
    description:
      "Kiln-fired Tuscan clay architectural sun-shading louver and rain-screen element. Warm iron-oxide pigmentation with natural frost durability.",
    materialSlug: "ceramic",
    finishSlug: "natural-unsealed",
    dimensionText: "1500 x 250 x 40 mm",
    widthMm: 250,
    heightMm: 1500,
    thicknessMm: 40,
    moqValue: 50,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["facade", "wall-cladding"],
    primaryColorHex: "#B86548",
    secondaryColorHex: "#8F4730",
  },
  {
    sku: "MH-CER-003",
    name: "Kyoto Celadon Glazed Fluted Tile",
    slug: "kyoto-celadon-glazed-fluted-tile",
    description:
      "Pressed stoneware wall module finished in translucent crackle celadon glaze over concave vertical ribs. Designed for hospitality feature walls and wet bars.",
    materialSlug: "ceramic",
    finishSlug: "fluted-ribbed",
    dimensionText: "300 x 150 x 14 mm",
    widthMm: 150,
    heightMm: 300,
    thicknessMm: 14,
    moqValue: 15,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["wall-cladding", "wet-areas", "bespoke-joinery"],
    primaryColorHex: "#8FA89B",
    secondaryColorHex: "#698275",
  },
  {
    sku: "MH-CER-004",
    name: "Raw Chalk Micro-Grit Porcelain Paver",
    slug: "raw-chalk-micro-grit-porcelain-paver",
    description:
      "Monolithic 20 mm structural outdoor porcelain paver with R11 anti-slip micro-grit surface. Supports raised pedestal installation on commercial roof terraces.",
    materialSlug: "ceramic",
    finishSlug: "sandblasted",
    dimensionText: "1200 x 1200 x 20 mm",
    widthMm: 1200,
    heightMm: 1200,
    thicknessMm: 20,
    moqValue: 45,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["flooring", "wet-areas"],
    primaryColorHex: "#E5E1D8",
    secondaryColorHex: "#C7C1B5",
  },
  {
    sku: "MH-CER-005",
    name: "Oxide Corten Sintered Cladding Panel",
    slug: "oxide-corten-sintered-cladding-panel",
    description:
      "Lightweight 6 mm fiberglass-mesh-backed ceramic panel replicating weathered corten steel without rust runoff. Ideal for elevator cores and over-cladding renovations.",
    materialSlug: "ceramic",
    finishSlug: "patinated-oxide",
    dimensionText: "3000 x 1000 x 6 mm",
    widthMm: 1000,
    heightMm: 3000,
    thicknessMm: 6,
    moqValue: 30,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["wall-cladding", "facade", "bespoke-joinery"],
    primaryColorHex: "#7A4432",
    secondaryColorHex: "#542C1E",
  },
  {
    sku: "MH-CER-006",
    name: "Alabaster Vetro Polished Stoneware",
    slug: "alabaster-vetro-polished-stoneware",
    description:
      "Rectified full-body porcelain tile with diamond-lapped crystalline glaze. Delivers high light reflectance for atrium floors and luxury retail interiors.",
    materialSlug: "ceramic",
    finishSlug: "polished-specular",
    dimensionText: "1200 x 600 x 10 mm",
    widthMm: 600,
    heightMm: 1200,
    thicknessMm: 10,
    moqValue: 40,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["flooring", "wall-cladding"],
    primaryColorHex: "#F2EFE9",
    secondaryColorHex: "#D6D0C4",
  },
  {
    sku: "MH-CER-007",
    name: "umbral Clay Unglazed Mosaic Sheet",
    slug: "umbral-clay-unglazed-mosaic-sheet",
    description:
      "High-fired vitrified stoneware finger mosaic mounted on biodegradable paper mesh. Suitable for curved columns, spa benches, and shower enclosures.",
    materialSlug: "ceramic",
    finishSlug: "natural-unsealed",
    dimensionText: "300 x 300 x 8 mm",
    widthMm: 300,
    heightMm: 300,
    thicknessMm: 8,
    moqValue: 20,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["wet-areas", "wall-cladding"],
    primaryColorHex: "#6D5B50",
    secondaryColorHex: "#4D3F37",
  },
  {
    sku: "MH-CER-008",
    name: "Graphite Terra Acoustic Ceramic Baffle",
    slug: "graphite-terra-acoustic-ceramic-baffle",
    description:
      "Micro-perforated hollow ceramic tile assembly engineered for transit hubs and auditorium walls requiring durable NRC 0.65 sound absorption.",
    materialSlug: "ceramic",
    finishSlug: "honed-matte",
    dimensionText: "600 x 300 x 35 mm",
    widthMm: 300,
    heightMm: 600,
    thicknessMm: 35,
    moqValue: 25,
    moqUnit: "sqm",
    status: "DRAFT",
    isFeatured: false,
    applicationSlugs: ["wall-cladding", "acoustic-ceilings"],
    primaryColorHex: "#3F4245",
    secondaryColorHex: "#27292B",
  },

  // TIMBER (8 products)
  {
    sku: "MH-TMB-001",
    name: "Slavonian Quarter-Sawn European Oak Plank",
    slug: "slavonian-quarter-sawn-european-oak-plank",
    description:
      "Three-layer cross-laminated wide-plank architectural flooring with a 5 mm quarter-sawn European oak wear layer. Low-gloss hardwax oil finish compatible with radiant floor heating.",
    materialSlug: "timber",
    finishSlug: "brushed-textured",
    dimensionText: "2400 x 260 x 19 mm",
    widthMm: 260,
    heightMm: 2400,
    thicknessMm: 19,
    moqValue: 40,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: true,
    applicationSlugs: ["flooring", "wall-cladding"],
    primaryColorHex: "#B8976C",
    secondaryColorHex: "#8F7049",
  },
  {
    sku: "MH-TMB-002",
    name: "Thermo-Treated Nordic Ash Acoustic Slat",
    slug: "thermo-treated-nordic-ash-acoustic-slat",
    description:
      "Kiln-modified Nordic ash battens mounted over Class A recycled PET acoustic felt backing. Achieves NRC 0.85 sound attenuation for auditoriums and open-plan workspaces.",
    materialSlug: "timber",
    finishSlug: "fluted-ribbed",
    dimensionText: "2700 x 600 x 22 mm",
    widthMm: 600,
    heightMm: 2700,
    thicknessMm: 22,
    moqValue: 20,
    moqUnit: "panels",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["wall-cladding", "acoustic-ceilings"],
    primaryColorHex: "#6E5239",
    secondaryColorHex: "#4A3523",
  },
  {
    sku: "MH-TMB-003",
    name: "Charred Sugi-Ban Cypress Exterior Cladding",
    slug: "charred-sugi-ban-cypress-exterior-cladding",
    description:
      "Traditionally heat-carbonized Japanese cedar profile sealed with breathable matte binder. Naturally rot-, insect-, and fire-resistant for architectural facades.",
    materialSlug: "timber",
    finishSlug: "brushed-textured",
    dimensionText: "3600 x 145 x 21 mm",
    widthMm: 145,
    heightMm: 3600,
    thicknessMm: 21,
    moqValue: 35,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["facade", "wall-cladding"],
    primaryColorHex: "#2B2927",
    secondaryColorHex: "#1A1817",
  },
  {
    sku: "MH-TMB-004",
    name: "Fumed Eucalyptus Architectural Veneer Panel",
    slug: "fumed-eucalyptus-architectural-veneer-panel",
    description:
      "Slip-matched smoked eucalyptus crown veneer bonded to Euroclass B-s1,d0 fire-retardant MDF core. Rich umber figure suited for executive joinery and wall paneling.",
    materialSlug: "timber",
    finishSlug: "honed-matte",
    dimensionText: "2800 x 1220 x 18 mm",
    widthMm: 1220,
    heightMm: 2800,
    thicknessMm: 18,
    moqValue: 15,
    moqUnit: "panels",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["wall-cladding", "bespoke-joinery"],
    primaryColorHex: "#5C4433",
    secondaryColorHex: "#3D2B1F",
  },
  {
    sku: "MH-TMB-005",
    name: "Dinesen-Style Douglas Fir Wide Monolith",
    slug: "dinesen-style-douglas-fir-wide-monolith",
    description:
      "Full-length structural Douglas fir floorboards treated with white lye and Nordic soap for a pale, serene gallery aesthetic.",
    materialSlug: "timber",
    finishSlug: "natural-unsealed",
    dimensionText: "4000 x 300 x 28 mm",
    widthMm: 300,
    heightMm: 4000,
    thicknessMm: 28,
    moqValue: 50,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["flooring"],
    primaryColorHex: "#D6C3A8",
    secondaryColorHex: "#B59E7E",
  },
  {
    sku: "MH-TMB-006",
    name: "American Black Walnut Micro-Grooved Panel",
    slug: "american-black-walnut-micro-grooved-panel",
    description:
      "Precision CNC-grooved walnut acoustic panel with concealed Helmholtz resonator cavities. Combines warm mid-century timber tones with high speech-frequency absorption.",
    materialSlug: "timber",
    finishSlug: "fluted-ribbed",
    dimensionText: "2400 x 600 x 16 mm",
    widthMm: 600,
    heightMm: 2400,
    thicknessMm: 16,
    moqValue: 20,
    moqUnit: "panels",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["wall-cladding", "acoustic-ceilings", "bespoke-joinery"],
    primaryColorHex: "#694B37",
    secondaryColorHex: "#473122",
  },
  {
    sku: "MH-TMB-007",
    name: "Reclaimed Teak End-Grain Butcher Block",
    slug: "reclaimed-teak-end-grain-butcher-block",
    description:
      "High-density salvaged Tectona grandis end-grain timber blocks engineered for heavy commercial hospitality islands and sculptural worktables.",
    materialSlug: "timber",
    finishSlug: "natural-unsealed",
    dimensionText: "1800 x 900 x 45 mm",
    widthMm: 900,
    heightMm: 1800,
    thicknessMm: 45,
    moqValue: 10,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["countertops", "bespoke-joinery", "flooring"],
    primaryColorHex: "#966B43",
    secondaryColorHex: "#6E4B2B",
  },
  {
    sku: "MH-TMB-008",
    name: "Bleached Maple Perforated Ceiling Cassette",
    slug: "bleached-maple-perforated-ceiling-cassette",
    description:
      "Modular torsion-spring suspended timber ceiling cassette with circular acoustic perforations and black acoustic fleece backing.",
    materialSlug: "timber",
    finishSlug: "honed-matte",
    dimensionText: "1200 x 600 x 15 mm",
    widthMm: 600,
    heightMm: 1200,
    thicknessMm: 15,
    moqValue: 30,
    moqUnit: "panels",
    status: "ARCHIVED",
    isFeatured: false,
    applicationSlugs: ["acoustic-ceilings"],
    primaryColorHex: "#E3D5BE",
    secondaryColorHex: "#C4B295",
  },

  // METAL PANELS (8 products)
  {
    sku: "MH-MTL-001",
    name: "Champagne Anodized Aluminum Honeycomb Panel",
    slug: "champagne-anodized-aluminum-honeycomb-panel",
    description:
      "A2 non-combustible composite facade and soffit cassette featuring a 25-micron architectural champagne anodized skin bonded to an aluminum hexagonal core.",
    materialSlug: "metal-panels",
    finishSlug: "anodized-satin",
    dimensionText: "3000 x 1250 x 15 mm",
    widthMm: 1250,
    heightMm: 3000,
    thicknessMm: 15,
    moqValue: 30,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: true,
    applicationSlugs: ["facade", "wall-cladding", "acoustic-ceilings"],
    primaryColorHex: "#C4B8A3",
    secondaryColorHex: "#9E917B",
  },
  {
    sku: "MH-MTL-002",
    name: "Hand-Patinated Architectural Phosphor Bronze",
    slug: "hand-patinated-architectural-phosphor-bronze",
    description:
      "Solid C26000 architectural bronze sheet treated with mineral sulfide patina and micro-crystalline wax. Develops a rich, living surface in hotel lobbies and elevator portals.",
    materialSlug: "metal-panels",
    finishSlug: "patinated-oxide",
    dimensionText: "2500 x 1000 x 3 mm",
    widthMm: 1000,
    heightMm: 2500,
    thicknessMm: 3,
    moqValue: 12,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["wall-cladding", "bespoke-joinery", "countertops"],
    primaryColorHex: "#59483B",
    secondaryColorHex: "#3B2E24",
  },
  {
    sku: "MH-MTL-003",
    name: "Woven Stainless Steel Architectural Mesh",
    slug: "woven-stainless-steel-architectural-mesh",
    description:
      "AISI 316 marine-grade stainless steel cable-and-rod woven drapery with 52 percent open area for solar shading, balustrade infills, and spatial dividers.",
    materialSlug: "metal-panels",
    finishSlug: "brushed-textured",
    dimensionText: "3000 x 1500 x 4 mm",
    widthMm: 1500,
    heightMm: 3000,
    thicknessMm: 4,
    moqValue: 20,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["facade", "interior-partitions", "acoustic-ceilings"],
    primaryColorHex: "#A6ABB0",
    secondaryColorHex: "#7D8388",
  },
  {
    sku: "MH-MTL-004",
    name: "Extruded Dark Bronze Fluted Louver Profile",
    slug: "extruded-dark-bronze-fluted-louver-profile",
    description:
      "Interlocking 6063-T5 extruded aluminum sinusoidal profile in C34 dark electro-color anodizing. Concealed mechanical fixing for seamless curved or flat walls.",
    materialSlug: "metal-panels",
    finishSlug: "fluted-ribbed",
    dimensionText: "3200 x 200 x 28 mm",
    widthMm: 200,
    heightMm: 3200,
    thicknessMm: 28,
    moqValue: 25,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["facade", "wall-cladding", "bespoke-joinery"],
    primaryColorHex: "#473E38",
    secondaryColorHex: "#2E2723",
  },
  {
    sku: "MH-MTL-005",
    name: " Bead-Blasted Titanium Zinc Rainscreen Sheet",
    slug: "bead-blasted-titanium-zinc-rainscreen-sheet",
    description:
      "Pre-weathered EN 988 titanium-zinc alloy sheet with a velvety matte mineral patina that self-heals minor surface scratches.",
    materialSlug: "metal-panels",
    finishSlug: "sandblasted",
    dimensionText: "3000 x 1000 x 1 mm",
    widthMm: 1000,
    heightMm: 3000,
    thicknessMm: 1,
    moqValue: 40,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["facade", "wall-cladding"],
    primaryColorHex: "#6E7378",
    secondaryColorHex: "#4F5357",
  },
  {
    sku: "MH-MTL-006",
    name: "Orbital Brushed Stainless Countertop Plate",
    slug: "orbital-brushed-stainless-countertop-plate",
    description:
      "Solid 5 mm hot-rolled 304L stainless steel plate finished with non-directional orbital vibration brushing for commercial kitchens and gallery islands.",
    materialSlug: "metal-panels",
    finishSlug: "brushed-textured",
    dimensionText: "3000 x 1250 x 5 mm",
    widthMm: 1250,
    heightMm: 3000,
    thicknessMm: 5,
    moqValue: 10,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["countertops", "bespoke-joinery"],
    primaryColorHex: "#BFC4C9",
    secondaryColorHex: "#959B9F",
  },
  {
    sku: "MH-MTL-007",
    name: "Perforated Raw Brass Acoustic Ceiling Tile",
    slug: "perforated-raw-brass-acoustic-ceiling-tile",
    description:
      "CuZn37 architectural brass lay-in ceiling cassette with 2 mm micro-perforations and non-woven acoustic tissue.",
    materialSlug: "metal-panels",
    finishSlug: "anodized-satin",
    dimensionText: "600 x 600 x 12 mm",
    widthMm: 600,
    heightMm: 600,
    thicknessMm: 12,
    moqValue: 36,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["acoustic-ceilings", "wall-cladding"],
    primaryColorHex: "#C7A758",
    secondaryColorHex: "#9E803B",
  },
  {
    sku: "MH-MTL-008",
    name: "Mirror-Polished PVD Smoked Titanium Sheet",
    slug: "mirror-polished-pvd-smoked-titanium-sheet",
    description:
      "Super-8K mirror polished stainless steel coated via Physical Vapor Deposition in smoked anthracite titanium. Designed for reflective soffits and retail fixtures.",
    materialSlug: "metal-panels",
    finishSlug: "polished-specular",
    dimensionText: "2440 x 1220 x 2 mm",
    widthMm: 1220,
    heightMm: 2440,
    thicknessMm: 2,
    moqValue: 15,
    moqUnit: "panels",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["wall-cladding", "bespoke-joinery", "acoustic-ceilings"],
    primaryColorHex: "#525559",
    secondaryColorHex: "#2F3134",
  },

  // GLASS (8 products)
  {
    sku: "MH-GLS-001",
    name: "Low-Iron Narrow Reeded Architectural Glass",
    slug: "low-iron-narrow-reeded-architectural-glass",
    description:
      "Toughened ultra-clear low-iron glass rolled with 12 mm convex flutes. Diffuses sightlines for workspace privacy while maintaining 86 percent daylight transmission.",
    materialSlug: "glass",
    finishSlug: "fluted-ribbed",
    dimensionText: "3000 x 1200 x 12 mm",
    widthMm: 1200,
    heightMm: 3000,
    thicknessMm: 12,
    moqValue: 20,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: true,
    applicationSlugs: ["interior-partitions", "bespoke-joinery", "wet-areas"],
    primaryColorHex: "#DCE8E6",
    secondaryColorHex: "#B5C9C6",
  },
  {
    sku: "MH-GLS-002",
    name: "Laminated Bronze Mesh Interlayer Glass",
    slug: "laminated-bronze-mesh-interlayer-glass",
    description:
      "Acoustic safety glass encapsulating a fine woven phosphor-bronze metallic fabric between two 6 mm low-iron panes with PVB acoustic interlayers (STC 39).",
    materialSlug: "glass",
    finishSlug: "polished-specular",
    dimensionText: "2800 x 1100 x 13 mm",
    widthMm: 1100,
    heightMm: 2800,
    thicknessMm: 13,
    moqValue: 15,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["interior-partitions", "wall-cladding", "bespoke-joinery"],
    primaryColorHex: "#B8A58E",
    secondaryColorHex: "#8C7860",
  },
  {
    sku: "MH-GLS-003",
    name: "Acid-Etched Satin Opal Structural Channel Glass",
    slug: "acid-etched-satin-opal-structural-channel-glass",
    description:
      "Self-supporting U-profile cast glass channel with uniform acid-etched translucent exterior. Enables tall, mullion-free daylight facades and curved interior walls.",
    materialSlug: "glass",
    finishSlug: "sandblasted",
    dimensionText: "4500 x 262 x 7 mm",
    widthMm: 262,
    heightMm: 4500,
    thicknessMm: 7,
    moqValue: 50,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["facade", "interior-partitions"],
    primaryColorHex: "#E8EFEF",
    secondaryColorHex: "#C5D4D4",
  },
  {
    sku: "MH-GLS-004",
    name: "Cast Kiln-Formed Smoked Quartz Glass Brick",
    slug: "cast-kiln-formed-smoked-quartz-glass-brick",
    description:
      "Solid poured optical glass masonry brick with subtle internal ripple texture and warm smoke tint. Engineered for load-bearing luminous facades and bar fronts.",
    materialSlug: "glass",
    finishSlug: "polished-specular",
    dimensionText: "240 x 115 x 53 mm",
    widthMm: 115,
    heightMm: 240,
    thicknessMm: 53,
    moqValue: 15,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["facade", "interior-partitions", "wall-cladding"],
    primaryColorHex: "#8C8782",
    secondaryColorHex: "#635E5A",
  },
  {
    sku: "MH-GLS-005",
    name: "Back-Painted Matte Sage Spandrel Glass",
    slug: "back-painted-matte-sage-spandrel-glass",
    description:
      "Heat-strengthened architectural wall-cladding glass with ceramic frit backing and anti-glare acid-etched front surface for hygienic healthcare and corporate cores.",
    materialSlug: "glass",
    finishSlug: "honed-matte",
    dimensionText: "2600 x 1300 x 8 mm",
    widthMm: 1300,
    heightMm: 2600,
    thicknessMm: 8,
    moqValue: 25,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["wall-cladding", "wet-areas"],
    primaryColorHex: "#A3B3A8",
    secondaryColorHex: "#7C8F82",
  },
  {
    sku: "MH-GLS-006",
    name: "Dichroic Laminated Fin Architectural Glazing",
    slug: "dichroic-laminated-fin-architectural-glazing",
    description:
      "Structural laminated glass fins incorporating multi-layer metal-oxide optical film that shifts between amber gold and deep cobalt according to solar incidence angle.",
    materialSlug: "glass",
    finishSlug: "polished-specular",
    dimensionText: "3200 x 400 x 17 mm",
    widthMm: 400,
    heightMm: 3200,
    thicknessMm: 17,
    moqValue: 20,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["facade", "interior-partitions"],
    primaryColorHex: "#7D98B5",
    secondaryColorHex: "#B59268",
  },
  {
    sku: "MH-GLS-007",
    name: "Slip-Resistant Fritted Structural Glass Floor Panel",
    slug: "slip-resistant-fritted-structural-glass-floor-panel",
    description:
      "Triple-laminated walk-on structural glass floor unit with ceramic dot matrix anti-slip top surface for skybridges and mezzanine lightwells.",
    materialSlug: "glass",
    finishSlug: "sandblasted",
    dimensionText: "1500 x 1500 x 33 mm",
    widthMm: 1500,
    heightMm: 1500,
    thicknessMm: 33,
    moqValue: 12,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["flooring"],
    primaryColorHex: "#CFD8D7",
    secondaryColorHex: "#9FB0AE",
  },
  {
    sku: "MH-GLS-008",
    name: "Cross-Reeded Amber Tint Partition Glass",
    slug: "cross-reeded-amber-tint-partition-glass",
    description:
      "Dual-sided orthogonal fluted glass with warm amber body tint, creating a pixelated geometric refraction pattern for hospitality screening.",
    materialSlug: "glass",
    finishSlug: "fluted-ribbed",
    dimensionText: "2400 x 1000 x 10 mm",
    widthMm: 1000,
    heightMm: 2400,
    thicknessMm: 10,
    moqValue: 18,
    moqUnit: "sqm",
    status: "PUBLISHED",
    isFeatured: false,
    applicationSlugs: ["interior-partitions", "bespoke-joinery"],
    primaryColorHex: "#C99E67",
    secondaryColorHex: "#9E7542",
  },
];

export function buildArchitecturalSwatchDataUrl(
  sku: string,
  materialSlug: string,
  primaryHex: string,
  secondaryHex: string,
  variant: "primary" | "detail" = "primary",
): string {
  // Deterministic numeric seed from SKU for unique per-product organic texture
  let seed = 0;
  for (let i = 0; i < sku.length; i++) {
    seed = (seed * 31 + sku.charCodeAt(i)) % 997;
  }
  if (variant === "detail") {
    seed += 101;
  }

  const c1 = variant === "primary" ? primaryHex : secondaryHex;
  const c2 = variant === "primary" ? secondaryHex : primaryHex;

  let surfaceDefs = "";
  let surfaceLayers = "";

  if (materialSlug === "natural-stone") {
    const y1 = 140 + (seed % 160);
    const y2 = 420 + (seed % 180);
    const y3 = 680 + (seed % 140);
    surfaceDefs = `
      <filter id="stoneGrain" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035 0.065" numOctaves="4" seed="${seed}" result="noise" />
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.16 0" in="noise" result="softNoise" />
        <feBlend mode="multiply" in="SourceGraphic" in2="softNoise" />
      </filter>
      <filter id="veinWarp" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="turbulence" baseFrequency="0.012 0.025" numOctaves="3" seed="${seed + 7}" result="warp" />
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="48" xChannelSelector="R" yChannelSelector="G" />
      </filter>`;
    surfaceLayers = `
      <rect width="1200" height="900" fill="url(#bg)" filter="url(#stoneGrain)" />
      <g filter="url(#veinWarp)" opacity="0.55">
        <path d="M-100 ${y1} C 320 ${y1 - 90}, 760 ${y1 + 110}, 1300 ${y1 - 40}" stroke="${c2}" stroke-width="18" fill="none" opacity="0.45" />
        <path d="M-100 ${y1 + 12} C 340 ${y1 - 70}, 740 ${y1 + 130}, 1300 ${y1 - 20}" stroke="#FFFFFF" stroke-width="3" fill="none" opacity="0.35" />
        <path d="M-100 ${y2} C 280 ${y2 + 120}, 820 ${y2 - 80}, 1300 ${y2 + 60}" stroke="${c2}" stroke-width="10" fill="none" opacity="0.5" />
        <path d="M-100 ${y3} C 450 ${y3 - 70}, 850 ${y3 + 90}, 1300 ${y3 - 30}" stroke="${c2}" stroke-width="6" fill="none" opacity="0.4" />
      </g>
      ${
        variant === "primary"
          ? `<line x1="600" y1="0" x2="600" y2="900" stroke="#000000" stroke-width="2" opacity="0.14" />
             <line x1="602" y1="0" x2="602" y2="900" stroke="#FFFFFF" stroke-width="1" opacity="0.22" />
             <line x1="0" y1="450" x2="1200" y2="450" stroke="#000000" stroke-width="2" opacity="0.12" />`
          : `<rect x="90" y="90" width="1020" height="720" fill="none" stroke="#000000" stroke-opacity="0.18" stroke-width="3" />`
      }`;
  } else if (materialSlug === "timber") {
    const plankCount = variant === "primary" ? 6 : 3;
    const plankHeight = 900 / plankCount;
    let planks = "";
    for (let i = 1; i < plankCount; i++) {
      const y = Math.round(i * plankHeight);
      planks += `<line x1="0" y1="${y}" x2="1200" y2="${y}" stroke="#171513" stroke-width="3" opacity="0.28" />`;
      planks += `<line x1="0" y1="${y + 2}" x2="1200" y2="${y + 2}" stroke="#FFFFFF" stroke-width="1" opacity="0.18" />`;
    }
    surfaceDefs = `
      <filter id="woodGrain" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.14" numOctaves="4" seed="${seed}" result="fibers" />
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.22 0" in="fibers" result="grainAlpha" />
        <feBlend mode="multiply" in="SourceGraphic" in2="grainAlpha" />
      </filter>`;
    surfaceLayers = `
      <rect width="1200" height="900" fill="url(#bg)" filter="url(#woodGrain)" />
      ${planks}`;
  } else if (materialSlug === "glass") {
    const fluteWidth = variant === "primary" ? 32 : 56;
    surfaceDefs = `
      <pattern id="flutes" width="${fluteWidth}" height="900" patternUnits="userSpaceOnUse">
        <linearGradient id="fluteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.38" />
          <stop offset="35%" stop-color="${c1}" stop-opacity="0.12" />
          <stop offset="78%" stop-color="#000000" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.28" />
        </linearGradient>
        <rect width="${fluteWidth}" height="900" fill="url(#fluteGrad)" />
        <line x1="${fluteWidth}" y1="0" x2="${fluteWidth}" y2="900" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.35" />
      </pattern>
      <linearGradient id="glassSheen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.28" />
        <stop offset="45%" stop-color="#FFFFFF" stop-opacity="0.0" />
        <stop offset="55%" stop-color="#FFFFFF" stop-opacity="0.16" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.12" />
      </linearGradient>`;
    surfaceLayers = `
      <rect width="1200" height="900" fill="url(#bg)" />
      <rect width="1200" height="900" fill="url(#flutes)" />
      <rect width="1200" height="900" fill="url(#glassSheen)" />`;
  } else if (materialSlug === "metal-panels") {
    surfaceDefs = `
      <filter id="metalBrush" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.002 0.55" numOctaves="3" seed="${seed}" result="brush" />
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.14 0" in="brush" result="softBrush" />
        <feBlend mode="overlay" in="SourceGraphic" in2="softBrush" />
      </filter>
      <linearGradient id="anodizedSheen" x1="0%" y1="0%" x2="100%" y2="35%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="38%" stop-color="${c2}" />
        <stop offset="52%" stop-color="#FFFFFF" stop-opacity="0.25" />
        <stop offset="68%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>`;
    surfaceLayers = `
      <rect width="1200" height="900" fill="url(#bg)" />
      <rect width="1200" height="900" fill="url(#anodizedSheen)" opacity="0.65" filter="url(#metalBrush)" />
      ${
        variant === "primary"
          ? `<line x1="400" y1="0" x2="400" y2="900" stroke="#000000" stroke-width="3" opacity="0.22" />
             <line x1="800" y1="0" x2="800" y2="900" stroke="#000000" stroke-width="3" opacity="0.22" />`
          : `<line x1="0" y1="300" x2="1200" y2="300" stroke="#000000" stroke-width="2" opacity="0.2" />
             <line x1="0" y1="600" x2="1200" y2="600" stroke="#000000" stroke-width="2" opacity="0.2" />`
      }`;
  } else {
    // Sintered Ceramic & Terracotta
    surfaceDefs = `
      <filter id="ceramicSpeckle" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="turbulence" baseFrequency="0.18 0.18" numOctaves="3" seed="${seed}" result="speckle" />
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" in="speckle" result="softSpeckle" />
        <feBlend mode="multiply" in="SourceGraphic" in2="softSpeckle" />
      </filter>`;
    surfaceLayers = `
      <rect width="1200" height="900" fill="url(#bg)" filter="url(#ceramicSpeckle)" />
      <line x1="300" y1="0" x2="300" y2="900" stroke="#000000" stroke-width="2" opacity="0.15" />
      <line x1="600" y1="0" x2="600" y2="900" stroke="#000000" stroke-width="2" opacity="0.15" />
      <line x1="900" y1="0" x2="900" y2="900" stroke="#000000" stroke-width="2" opacity="0.15" />
      <line x1="0" y1="450" x2="1200" y2="450" stroke="#000000" stroke-width="2" opacity="0.15" />`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
      <radialGradient id="studioLight" cx="25%" cy="20%" r="85%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.18" />
        <stop offset="60%" stop-color="#000000" stop-opacity="0.0" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.24" />
      </radialGradient>
      ${surfaceDefs}
    </defs>
    ${surfaceLayers}
    <rect width="1200" height="900" fill="url(#studioLight)" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
