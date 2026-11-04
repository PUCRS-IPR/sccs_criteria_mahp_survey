/**
 * Definitions of Criteria, Sub-criteria, and Saaty Scale for the Fuzzy-AHP method
 * Site selection for CO2 storage in salt caverns
 * Based on the hierarchical structure of the project (Criteria A to E and their sub-criteria)
 */

const SURVEY_VERSION = "ultra-deepwater-salt-domes-v3";

const CRITERION_HELP_PLACEHOLDER = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

const CRITERIA = [
  {
    id: "A",
    code: "A",
    name: "Geological Formation",
    fullName: "A. Geological Formation",
    badgeColor: "#6f42c1",
    description: "Formation depth, geometry (net thickness and lateral extension), insoluble salt content, highly soluble salts, and lithological heterogeneity ratio.",
    summary: "Host evaporite formation properties governing thermodynamic conditions, structural capacity, and mineralogical suitability for secure CO₂ cavern leaching.",
    parameters: [],
    references: "",
    helpText: CRITERION_HELP_PLACEHOLDER,
    subcriteria: [
      {
        id: "A1",
        code: "A1",
        parentCode: "A",
        name: "Formation Depth",
        fullName: "A1. Formation Depth",
        description: "Depth of the salt formation for containment and suitable thermodynamic conditions.",
        summary: "CO₂ must be maintained in a supercritical state, establishing a strict minimum formation depth threshold of 800 m below sea level.",
        parameters: [
          "Min. Depth: ≥ 800 m bsl",
          "Pressure: > 7.39 MPa",
          "Temperature: > 31.1 °C",
          "Storage Density: 600–900 kg/m³",
          "Pre-salt: > 2,000 m evaporite (~45 MPa)"
        ],
        references: "A. M. Da Costa et al., 2019; Duffy et al., 2023; Mwakipunda et al., 2024",
        helpText: "To maximize volumetric efficiency, CO2 must be injected and maintained in a supercritical state, establishing a strict minimum formation depth threshold of 800 m below sea level. At depths exceeding 800 m, subsurface pressure (> 7.39 MPa) and temperature (> 31.1 °C) ensure CO2 behaves as a dense fluid, yielding storage capacities of 600 to 900 kg CO2/m³. In offshore ultra-deepwater pre-salt settings, where thick evaporite sequences with over 2,000 m occur beneath substantial water columns, cavern design must accommodate high ambient lithostatic pressures (~45 MPa) through specialized geomechanical criteria to ensure long-term cavern stability and tightness. (A. M. Da Costa et al., 2019; Duffy et al., 2023; Mwakipunda et al., 2024)"
      },
      {
        id: "A2",
        code: "A2",
        parentCode: "A",
        name: "Geometry: Net Thickness and Lateral Extension",
        fullName: "A2. Geometry: Net Thickness and Lateral Extension",
        description: "Cumulative net salt height and lateral extent across a proven block area.",
        summary: "Adequate cumulative net salt thickness and lateral extension ensure containment, structural predictability, and room for cavern arrays.",
        parameters: [
          "Proven Block Area: > 2 to 5 km²",
          "High lateral continuity",
          "Min. horizontal height variation",
          "Safe lateral buffer distances"
        ],
        references: "Li & Li, 2026; Liu et al., 2020; Mwakipunda et al., 2024",
        helpText: "To guarantee geological containment, structural predictability, and adequate spatial room for cavern array development, the host evaporite formation must possess a minimum cumulative net salt height and a high diameter across a proven block area (typically > 2 to 5 km2) with minimal horizontal variations in height. High lateral coherence prevents structural disruption, such as flexure joints, faulting, or depositional pinch-outs, and provides sufficient salt mass to maintain safe lateral buffer distances from the salt margins, boundary shear zones, and adjacent caverns, thereby ensuring the long-term tightness of supercritical CO2 storage. (Li & Li, 2026; Liu et al., 2020; Mwakipunda et al., 2024)"
      },
      {
        id: "A3",
        code: "A3",
        parentCode: "A",
        name: "Insoluble salt Content",
        fullName: "A3. Insoluble salt Content",
        description: "Content of insoluble minerals (mostly anhydrite) affecting usable cavern volume and sediment accumulation.",
        summary: "Low proportion of insoluble constituents (mostly anhydrite) is required to maximize usable storage capacity and prevent floor sediment buildup.",
        parameters: [
          "Insoluble threshold: < 30% (ideally)",
          "Soluble mineral content: > 70%",
          "Dominant mineral: Anhydrite",
          "Sediment bulking expansion on cavern floor"
        ],
        references: "Liu et al., 2020",
        helpText: "To maximize net usable storage capacity and minimize floor sediment accumulation, the candidate evaporite formation should maintain a low proportion of insoluble constituents, mostly anhydrite (ideally below 30%, corresponding to a soluble mineral content exceeding 70%). During solution mining, these insoluble components fail to dissolve and collapse to the cavern floor, undergoing mechanical bulking governed by an expansion coefficient. This expanded sediment bed significantly reduces the residual effective cavern volume relative to the total mined volume, necessitating higher initial halite purity or enlarged leaching profiles to satisfy target operational volumes. (Liu et al., 2020)"
      },
      {
        id: "A4",
        code: "A4",
        parentCode: "A",
        name: "Highly soluble salts",
        fullName: "A4. Highly soluble salts",
        description: "Avoidance of highly soluble bittern salts (carnallite, tachyhydrite) affecting leaching and creep rates.",
        summary: "Storage evaporites must avoid intercalations of fast-dissolving bittern salts that distort cavern geometry and exhibit severe viscoplastic creep.",
        parameters: [
          "Critical bittern salts: Carnallite, Tachyhydrite",
          "Dissolution rate: Faster than halite",
          "Creep strain rate: ~100× higher than halite",
          "Risk: Lateral flaring & asymmetric notches"
        ],
        references: "A. Da Costa et al., 2011; A. M. Da Costa et al., 2019; Neal et al., 1993; Pichat et al., 2024",
        helpText: "To ensure symmetrical cavern leaching, geomechanical stability, and long-term fluid tightness, candidate storage evaporites must avoid intercalations of highly soluble salts that dissolve faster than halite (specifically potassium and magnesium bittern salts, such as carnallite and tachyhydrite). During solution mining, freshwater preferentially dissolves these highly soluble bittern salts, inducing uncontrolled lateral flaring, wall notching, and asymmetrical cavern geometries. Furthermore, carnallite and tachyhydrite exhibit viscoplastic creep strain rates nearly two orders of magnitude higher than halite under equivalent in-situ stress and temperature regimes. (A. Da Costa et al., 2011; A. M. Da Costa et al., 2019; Neal et al., 1993; Pichat et al., 2024)"
      },
      {
        id: "A5",
        code: "A5",
        parentCode: "A",
        name: "Lithological Heterogeneity Ratio",
        fullName: "A5. Lithological Heterogeneity Ratio",
        description: "Presence and proportion of non-salt interlayers and their dual control on creep and storage volume.",
        summary: "Non-salt interlayers exert a dual effect: reinforcing against creep, but reducing usable cavern volume and causing irregular leaching profiles.",
        parameters: [
          "Lithologies: Mudstone, carbonates, basalts",
          "Geomechanical benefit: Restrains viscoplastic creep",
          "Operational penalty: Storage volume reduction",
          "Geometry risk: Irregular leaching profiles"
        ],
        references: "Minougou et al., 2023; Zhang et al., 2021",
        helpText: "Heterogeneities exert dual control on cavern performance: while the presence of non-salt interlayers (such as mudstone, carbonates, and basalts) may enhance geomechanical resistance to viscoplastic creep, reducing overall volume shrinkage and wall displacement, these interlayers also significantly reduce the initial storage volume of caverns. In addition, these heterogeneities are responsible for irregularly shaped caverns, which may lead to geomechanical problems during operation. (Minougou et al., 2023; Zhang et al., 2021)"
      }
    ]
  },
  {
    id: "B",
    code: "B",
    name: "Formation Geomechanics",
    fullName: "B. Formation Geomechanics",
    badgeColor: "#b02a37",
    description: "In-situ stress regime, distance from faults and salt structure boundaries, geothermal gradient, and secondary seal.",
    summary: "Geomechanical stress conditions, boundary clearances, thermal influences, and secondary sealing integrity ensuring cavern stability and gas tightness.",
    parameters: [],
    references: "",
    helpText: CRITERION_HELP_PLACEHOLDER,
    subcriteria: [
      {
        id: "B1",
        code: "B1",
        parentCode: "B",
        name: "In-situ stress regime",
        fullName: "B1. In-situ stress regime",
        description: "Three-dimensional stress state and safe operating pressure window during construction and storage.",
        summary: "Formações estáveis com distribuição homogênea de tensões permitem estabelecer uma janela operacional de pressão segura, equilibrando perda de volume por fluência e risco de fraturamento.",
        parameters: [
          "Redistribuição: Halita favorece estado isotrópico",
          "Risco anisotrópico: Concentração de tensões e instabilidade",
          "Janela operacional: Tensão in situ vs. pressão interna",
          "Sobpressão: Risco de fraturamento e vazamento"
        ],
        references: "Minougou et al., 2023; Mortazavi & Nasab, 2017; Jiang et al., 2026; T. Wang et al., 2019; P. V. M. Da Costa et al., 2020; Firme et al., 2019",
        helpText: "Embora o comportamento viscoplástico da halita favoreça a redistribuição das tensões e o desenvolvimento de condições aproximadamente isotrópicas, regiões submetidas a tensões anisotrópicas ou próximas a estruturas tectônicas podem apresentar maiores concentrações de tensões e suscetibilidade à instabilidade (Minougou et al., 2023; Mortazavi & Nasab, 2017). Além disso, a diferença entre as tensões in situ e a pressão interna da caverna controla a deformação por fluência e a consequente redução de seu volume, enquanto pressões internas excessivas podem favorecer o desenvolvimento de fraturas e comprometer a estanqueidade (Jiang et al., 2026; T. Wang et al., 2019). Portanto, a seleção do local deve priorizar formações salinas geologicamente estáveis, com distribuição relativamente homogênea das tensões e condições que permitam estabelecer uma janela operacional de pressão segura durante a construção e o armazenamento de CO₂ (P. V. M. Da Costa et al., 2020; Firme et al., 2019)."
      },
      {
        id: "B2",
        code: "B2",
        parentCode: "B",
        name: "Distance from faults and salt structure boundaries",
        fullName: "B2. Distance from faults and salt structure boundaries",
        description: "Safety distances from faults, fracture zones, cavern crown, and external salt boundaries.",
        summary: "Buffer distances from faults and salt boundaries safeguard structural containment and prevent stress-induced fluid migration along discontinuities.",
        parameters: [
          "Halite buffer: 3× to 5× cavern diameter",
          "Crown clearance: Cavern to top of salt structure",
          "Boundary buffer: Lateral dome limits & adjacent caverns",
          "Fault separation: > 2.5× (standards) to 5× (conservative) diameter"
        ],
        references: "Chen et al., 2022; A. M. Da Costa et al., 2019; Wang et al., 2025",
        helpText: "To safeguard structural containment and prevent stress-induced fluid migration along fault networks, candidate salt cavern locations must maintain adequate vertical and horizontal safety distances from geological faults and external salt boundaries. A protective halite thickness equivalent to three to five times the cavern diameter must be maintained in both vertical and horizontal directions. This separation applies to the distance between the cavern crown and the top of the salt structure, between the walls of adjacent caverns, and between the cavern walls and the lateral boundaries of the salt dome. (Chen et al., 2022; A. M. Da Costa et al., 2019)\n\nSimilarly, minimum safety distances from geological faults and fracture zones must be considered during site selection. Chen et al. (2022), citing Chinese technical safety specifications, indicate that the distance between a salt cavern and a fault system should exceed 2.5 times the cavern diameter to reduce the risk of fluid leakage along geological discontinuities. More conservatively, Wang et al. (2025) recommend a minimum separation of five times the cavern diameter from faults and fracture zones to ensure long-term stability and tightness."
      },
      {
        id: "B3",
        code: "B3",
        parentCode: "B",
        name: "Geothermal gradient and temperature effects",
        fullName: "B3. Geothermal gradient and temperature effects",
        description: "In situ geothermal temperature and thermal fluctuations influencing creep and structural integrity.",
        summary: "In situ geothermal temperature accelerates halite viscoplastic creep and volume convergence, compounded by operational cyclic thermal fluctuations.",
        parameters: [
          "Elevated temperature: Accelerates halite creep rate",
          "Convergence: Progressive reduction of usable volume",
          "Thermal conductivity: Nonlinear temperature dependence",
          "Cyclic operations: Thermal shocks during injection/withdrawal"
        ],
        references: "Habbani et al., 2026",
        helpText: "The geothermal gradient determines the initial temperature of the surrounding salt formation at cavern depth, directly influencing its thermomechanical behavior and long-term stability. Elevated temperatures accelerate rock salt creep, intensifying cavern wall convergence and the progressive reduction of usable storage volume. Furthermore, the thermal conductivity of rock salt exhibits a nonlinear dependence on temperature, complicating predictions of heat transfer and stress redistribution during rapid operational thermal fluctuations. Therefore, formation suitability assessments must consider both the in situ geothermal temperature and operationally induced thermal variations to minimize cavern convergence, damage accumulation, and loss of structural integrity (Habbani et al., 2026, p. 4264)."
      },
      {
        id: "B4",
        code: "B4",
        parentCode: "B",
        name: "Secondary seal",
        fullName: "B4. Secondary seal",
        description: "Integrity, thickness, continuity, and sealing capacity of the overlying caprock.",
        summary: "A continuous, intact, low-permeability caprock overlying the salt structure serves as a critical redundant containment barrier against upward gas migration.",
        parameters: [
          "Redundant barrier: Overlying caprock above salt dome",
          "Low permeability & lateral continuity",
          "Historical precedent: Fractured caprocks linked to gas leakage"
        ],
        references: "Barron, 1994; Aminu et al., 2026; Qian et al., 2025; Bérest et al., 2019",
        helpText: "Although the low permeability and self-sealing properties of halite allow salt caverns to retain stored gases without requiring an additional caprock, the presence of an intact, low-permeability sealing formation above a salt dome may provide an additional barrier against upward gas migration (Barron, 1994; Aminu et al., 2026). Nevertheless, Qian et al. (2025) emphasize the importance of rigorously evaluating caprock integrity in salt domes due to their complex structural characteristics and the associated risk of gas leakage. Furthermore, fractured or permeable caprocks may facilitate gas migration when connected to leakage pathways, as demonstrated by historical incidents involving salt dome storage caverns (Bérest et al., 2019). Therefore, the presence of a continuous and impermeable secondary sealing layer should be considered favorable when selecting suitable locations for salt cavern development."
      }
    ]
  },
  {
    id: "C",
    code: "C",
    name: "Lithological Heterogeneity Characteristics",
    fullName: "C. Lithological Heterogeneity Characteristics",
    badgeColor: "#997404",
    description: "Lateral continuity, thickness, fracturing and permeability, and rock strength of non-salt interlayers.",
    summary: "Structural and geomechanical traits of embedded non-salt layers (interlayers) controlling dissolution geometry, fracture risk, and interface integrity.",
    parameters: [],
    references: "",
    helpText: CRITERION_HELP_PLACEHOLDER,
    subcriteria: [
      {
        id: "C1",
        code: "C1",
        parentCode: "C",
        name: "Lateral continuity",
        fullName: "C1. Lateral continuity",
        description: "Continuity of interlayers promoting uniform dissolution or causing overhangs and stress concentration.",
        summary: "Continuous horizontal interlayers promote uniform viscoplastic deformation distribution, whereas discontinuous beds create insoluble overhangs and cyclic stress risers.",
        parameters: [
          "Continuous interlayers: Distribute creep, mitigate shrinkage",
          "Discontinuous interlayers: Form insoluble ledges and overhangs",
          "Cyclic risk: Tensile fracturing and block detachment into cavity"
        ],
        references: "Duffy et al., 2023; Li & Li, 2026; Liu et al., 2020; Habbani et al., 2026; Zhang et al., 2021",
        helpText: "The lateral continuity of interlayers influences the uniformity of the dissolution profile and stress distribution around the cavern (Duffy et al., 2023; Zhang et al., 2021). Continuous horizontal interlayers act as reinforcing layers, promoting a more uniform distribution of viscoplastic deformation in the surrounding halite and mitigating cavern volume shrinkage (Li & Li, 2026; Zhang et al., 2021). Conversely, discontinuous interlayers and lateral lithological variations can lead to the formation of undissolved overhangs and asymmetric wall ledges during solution mining (Duffy et al., 2023; Liu et al., 2020). During cyclic gas storage operations, rapid depressurization and thermal contraction can induce stress concentration around these irregularities, potentially triggering localized tensile fracturing, progressive damage accumulation, and eventual block detachment into the cavern cavity (Habbani et al., 2026; Zhang et al., 2021)."
      },
      {
        id: "C2",
        code: "C2",
        parentCode: "C",
        name: "Thickness",
        fullName: "C2. Thickness",
        description: "Vertical thickness of non-salt interlayers controlling dissolution kinetics and collapse behavior.",
        summary: "Interlayer thickness dictates dissolution kinetics and overhang stability: thin layers (< 2 m) break down safely, whereas thick layers (> 7 m) form hazardous cantilevers.",
        parameters: [
          "Preferred thickness: < 2 m (readily fractures to floor bed)",
          "Maximum threshold: ≤ 7 m",
          "Critical hazard (> 7 m): Resists collapse, forms overhangs",
          "Thermal shock failure: Exceeds low tensile strength of salt"
        ],
        references: "Duffy et al., 2023; Liu et al., 2020; Li & Li, 2026; Habbani et al., 2026; Zhang et al., 2021",
        helpText: "Interlayer thickness dictates dissolution kinetics, overhang stability, and net usable storage volume (Duffy et al., 2023; Liu et al., 2020). To ensure predictable mechanical breakdown during solution mining, individual interlayers should not exceed 7 m, with < 2 m preferred for high-integrity blocks (Liu et al., 2020). Thin interlayers (< 2 m) readily fracture and settle at the cavern base, forming a sediment bed that mechanically supports lower cavern walls (Li & Li, 2026; Zhang et al., 2021). Conversely, thick interlayers (> 7 m) resist collapse, creating cantilevered overhangs and roof projections (Duffy et al., 2023; Liu et al., 2020). During rapid gas depressurization, thermal shock exceeds the low tensile strength of rock salt, driving unstable crack propagation and block detachment into the cavity (Habbani et al., 2026; Zhang et al., 2021)."
      },
      {
        id: "C3",
        code: "C3",
        parentCode: "C",
        name: "Fracturing and permeability",
        fullName: "C3. Fracturing and permeability",
        description: "Permeability contrasts, fracture propensity, and interface microcracking under operational cycles.",
        summary: "Differences in mechanical properties and permeability between interlayers and halite can generate interface microcracking and preferential leakage pathways under cyclic stresses.",
        parameters: [
          "Halite self-sealing vs. interlayer persistent fracturing",
          "Creep & stiffness contrast: Interface shear stresses",
          "Cyclic fatigue: Pressure and thermal fluctuations aggravate pathways"
        ],
        references: "Chen et al., 2022; Minougou et al., 2023; Wang et al., 2025; Warren, 2017; Yan et al., 2022; Habbani et al., 2026; Da Costa et al., 2020",
        helpText: "The presence of non-salt interlayers is an important consideration for salt cavern storage, as differences in their permeability and mechanical properties relative to halite may affect cavern stability and sealing performance, potentially creating preferential pathways for gas migration (Chen et al., 2022; Minougou et al., 2023; Wang et al., 2025). Although intact interlayers may exhibit sufficiently low permeability to restrict gas flow, their generally lower capacity for fracture closure and self-sealing compared with halite may allow fractures and associated permeability to persist under unfavorable conditions (Warren, 2017; Minougou et al., 2023). Furthermore, differences in creep behavior and mechanical properties between salt and non-salt interlayers may generate stress concentrations and microcracking along their interfaces, while pressure and temperature fluctuations during cavern operation can induce additional mechanical and thermal stresses that may promote fracture development and compromise sealing integrity (Yan et al., 2022; Minougou et al., 2023; Habbani et al., 2026). However, the extent to which these processes contribute to gas leakage depends on the properties and structural integrity of the interlayers and their interfaces with the surrounding salt (Chen et al., 2022; Wang et al., 2025). Therefore, the presence, permeability, spatial continuity, and mechanical integrity of non-salt interlayers and their interfaces should be carefully evaluated during site selection and cavern design to minimize potential gas leakage and ensure long-term containment integrity (Chen et al., 2022; Da Costa et al., 2020; Wang et al., 2025)."
      },
      {
        id: "C4",
        code: "C4",
        parentCode: "C",
        name: "Rock strength",
        fullName: "C4. Rock strength",
        description: "Mechanical strength, stiffness, and deformation compatibility of interlayers with surrounding halite.",
        summary: "Mechanical strength, stiffness contrast, and creep compatibility govern whether interlayers restrain cavern shrinkage or generate localized interface damage.",
        parameters: [
          "Key traits: Tensile/shear strength, cohesion, Young's modulus, creep",
          "Reinforcement effect: Up to 30% interlayers can restrain halite convergence",
          "Interface hazard: Shear stresses and localized failure from ductility contrast"
        ],
        references: "Zhang et al., 2021; Honório & Hajibeygi, 2024; Yang et al., 2013; Yan et al., 2022; Minougou et al., 2023",
        helpText: "Assesses the mechanical strength and stiffness of non-salt interlayers and their interfaces with halite, including tensile and shear strength, cohesion, elastic modulus, and creep-rate contrasts. Depending on their lithology and mechanical properties, relatively stiff or slowly creeping interlayers may restrain salt deformation, reducing cavern volume shrinkage and the extent of plastic zones. Numerical simulations considering interlayer proportions of up to 30% have demonstrated these effects, although their magnitude depends on the specific geological and mechanical conditions (Zhang et al., 2021; Honório & Hajibeygi, 2024). Conversely, differences in deformability and creep behavior between interlayers and ductile halite can generate shear stresses and localized stress concentrations along their interfaces, potentially promoting mechanical damage, microcracking, and localized failure under unfavorable operating conditions (Yang et al., 2013; Yan et al., 2022; Minougou et al., 2023). Therefore, the suitability of salt formations for cavern storage depends not only on the mechanical strength of the interlayers but also on their deformation compatibility with the surrounding halite and the cohesion and shear resistance of their interfaces. These properties should be carefully evaluated under site-specific stress conditions and cyclic operating pressures to minimize localized mechanical damage and preserve long-term cavern integrity (Yang et al., 2013; Minougou et al., 2023)."
      }
    ]
  },
  {
    id: "D",
    code: "D",
    name: "External Risk Factors",
    fullName: "D. External Risk Factors",
    badgeColor: "#087990",
    description: "Associated tectonics, regional seismicity, proximity to wells, and proximity to hydrocarbon accumulations.",
    summary: "External regional tectonic, seismic, and operational proximity risks affecting long-term basin stability and storage integrity.",
    parameters: [],
    references: "",
    helpText: CRITERION_HELP_PLACEHOLDER,
    subcriteria: [
      {
        id: "D1",
        code: "D1",
        parentCode: "D",
        name: "Associated tectonics",
        fullName: "D1. Associated tectonics",
        description: "Regional tectonic setting, active faults, and basin structural stability.",
        summary: "Regional tectonic setting, active fault systems, and basin structural stability influencing geomechanical security.",
        parameters: [],
        references: "",
        helpText: CRITERION_HELP_PLACEHOLDER
      },
      {
        id: "D2",
        code: "D2",
        parentCode: "D",
        name: "Regional seismicity",
        fullName: "D2. Regional seismicity",
        description: "History, magnitude, and frequency of natural or induced seismicity in the area.",
        summary: "History, magnitude, and frequency of natural or induced seismic events in the evaporite basin area.",
        parameters: [],
        references: "",
        helpText: CRITERION_HELP_PLACEHOLDER
      },
      {
        id: "D3",
        code: "D3",
        parentCode: "D",
        name: "Proximity to wells",
        fullName: "D3. Proximity to wells",
        description: "Distance and density of previous drilled wells with potential for decompression or CO₂ escape.",
        summary: "Clearance distance and density of existing drilled wells with potential for fluid migration or pressure leakage.",
        parameters: [],
        references: "",
        helpText: CRITERION_HELP_PLACEHOLDER
      },
      {
        id: "D4",
        code: "D4",
        parentCode: "D",
        name: "Proximidade de áreas com acumulações de hidrocarbonetos",
        fullName: "D4. Proximidade de áreas com acumulações de hidrocarbonetos",
        description: "Proximidade de áreas com acumulações de hidrocarbonetos e potenciais interferências operacionais.",
        summary: "Proximidade de reservatórios e áreas com acumulações ativas de óleo e gás, avaliando potenciais interferências operacionais.",
        parameters: [],
        references: "",
        helpText: CRITERION_HELP_PLACEHOLDER
      }
    ]
  },
  {
    id: "E",
    code: "E",
    name: "Economic, Environmental, Social, and Governance (E-ESG) Criteria",
    fullName: "E. Economic, Environmental, Social, and Governance (E-ESG) Criteria",
    badgeColor: "#2c8050",
    description: "Economic viability, environmental sustainability, social acceptance, and governance compliance.",
    summary: "Integrated evaluation of economic feasibility, environmental stewardship, social stakeholder perception, and regulatory governance.",
    parameters: [],
    references: "",
    helpText: CRITERION_HELP_PLACEHOLDER,
    subcriteria: [
      {
        id: "E1",
        code: "E1",
        parentCode: "E",
        name: "Economics",
        fullName: "E1. Economics",
        description: "Economic viability, capital expenditure, operational costs, and investment return.",
        summary: "Economic viability, capital expenditure (CAPEX), operational costs (OPEX), and investment return metrics.",
        parameters: [],
        references: "",
        helpText: CRITERION_HELP_PLACEHOLDER
      },
      {
        id: "E2",
        code: "E2",
        parentCode: "E",
        name: "Environmental",
        fullName: "E2. Environmental",
        description: "Environmental impact, marine ecosystem conservation, and carbon footprint reduction.",
        summary: "Environmental impact mitigation, marine ecosystem preservation, and project net carbon footprint reduction.",
        parameters: [],
        references: "",
        helpText: CRITERION_HELP_PLACEHOLDER
      },
      {
        id: "E3",
        code: "E3",
        parentCode: "E",
        name: "Social",
        fullName: "E3. Social",
        description: "Social acceptance, stakeholder engagement, community perception, and societal benefits.",
        summary: "Public and stakeholder social acceptance, transparent community engagement, and broader societal benefit.",
        parameters: [],
        references: "",
        helpText: CRITERION_HELP_PLACEHOLDER
      },
      {
        id: "E4",
        code: "E4",
        parentCode: "E",
        name: "Governance",
        fullName: "E4. Governance",
        description: "Regulatory compliance, legal frameworks, licensing processes, and safety standards.",
        summary: "Compliance with regulatory frameworks, offshore licensing processes, and international carbon storage safety standards.",
        parameters: [],
        references: "",
        helpText: CRITERION_HELP_PLACEHOLDER
      }
    ]
  }
];

/**
 * Saaty's Fundamental Scale in textual format
 */
const SAATY_SCALE_OPTIONS = [
  "Equal importance",
  "Moderately superior",
  "Superior",
  "Very superior",
  "Extremely superior"
];

/**
 * Generates all unique pairwise combinations for a list of items (criteria or sub-criteria)
 */
function generatePairwiseCombinations(itemsList) {
  const pairs = [];
  let index = 1;
  for (let i = 0; i < itemsList.length; i++) {
    for (let j = i + 1; j < itemsList.length; j++) {
      pairs.push({
        index: index++,
        crit1: itemsList[i],
        crit2: itemsList[j],
        pairKey: `${itemsList[i].code}_vs_${itemsList[j].code}`
      });
    }
  }
  return pairs;
}

/**
 * Centralized definition of all 8 steps with descriptive names for criteria and sub-criteria
 */
const SURVEY_STEPS = [
  {
    stepIndex: 1,
    id: "step_intro_evaluator",
    type: "intro_evaluator",
    codeBadge: "1",
    badgeClass: "badge-criteria-global",
    category: "Step 1",
    navTitle: "Context and Expert Identification",
    shortTitle: "Expert Details",
    title: "Context & Expert Identification",
    subtitle: "Survey objective, methodology, and information for technical validation",
    icon: "bi-person-badge-fill"
  },
  {
    stepIndex: 2,
    id: "step_criteria_global",
    type: "comparisons",
    groupKey: "GLOBAL",
    criterionCode: "GLOBAL",
    codeBadge: "A–E",
    badgeClass: "badge-criteria-global",
    category: "Main Criteria",
    navTitle: "Main Criteria",
    shortTitle: "Main Criteria",
    badgeColor: "#0f4c81",
    title: "Main Criteria",
    subtitle: "Evaluate the pairwise relative importance among the 5 fundamental main criteria",
    items: CRITERIA,
    pairs: generatePairwiseCombinations(CRITERIA),
    icon: "bi-diagram-3-fill"
  },
  {
    stepIndex: 3,
    id: "step_subcriteria_A",
    type: "comparisons",
    groupKey: "A",
    criterionCode: "A",
    codeBadge: "A",
    badgeClass: "badge-criteria-a",
    category: "Sub-criteria",
    navTitle: "Geological Formation",
    shortTitle: "Sub-criteria: Geological Formation",
    badgeColor: "#6f42c1",
    title: "Sub-criteria of Criterion A: Geological Formation",
    subtitle: "Evaluate the relative importance among the 5 Geological Formation sub-criteria",
    criterionObj: CRITERIA[0],
    items: CRITERIA[0].subcriteria,
    pairs: generatePairwiseCombinations(CRITERIA[0].subcriteria),
    icon: "bi-layers-fill"
  },
  {
    stepIndex: 4,
    id: "step_subcriteria_B",
    type: "comparisons",
    groupKey: "B",
    criterionCode: "B",
    codeBadge: "B",
    badgeClass: "badge-criteria-b",
    category: "Sub-criteria",
    navTitle: "Formation Geomechanics",
    shortTitle: "Sub-criteria: Formation Geomechanics",
    badgeColor: "#b02a37",
    title: "Sub-criteria of Criterion B: Formation Geomechanics",
    subtitle: "Evaluate the relative importance among the 4 Geomechanics sub-criteria",
    criterionObj: CRITERIA[1],
    items: CRITERIA[1].subcriteria,
    pairs: generatePairwiseCombinations(CRITERIA[1].subcriteria),
    icon: "bi-activity"
  },
  {
    stepIndex: 5,
    id: "step_subcriteria_C",
    type: "comparisons",
    groupKey: "C",
    criterionCode: "C",
    codeBadge: "C",
    badgeClass: "badge-criteria-c",
    category: "Sub-criteria",
    navTitle: "Lithological Heterogeneity",
    shortTitle: "Sub-criteria: Lithological Heterogeneity",
    badgeColor: "#997404",
    title: "Sub-criteria of Criterion C: Lithological Heterogeneity Characteristics",
    subtitle: "Evaluate the relative importance among the 4 Lithological Heterogeneity sub-criteria",
    criterionObj: CRITERIA[2],
    items: CRITERIA[2].subcriteria,
    pairs: generatePairwiseCombinations(CRITERIA[2].subcriteria),
    icon: "bi-segmented-nav"
  },
  {
    stepIndex: 6,
    id: "step_subcriteria_D",
    type: "comparisons",
    groupKey: "D",
    criterionCode: "D",
    codeBadge: "D",
    badgeClass: "badge-criteria-d",
    category: "Sub-criteria",
    navTitle: "External Risk Factors",
    shortTitle: "Sub-criteria: External Risk Factors",
    badgeColor: "#087990",
    title: "Sub-criteria of Criterion D: External Risk Factors",
    subtitle: "Evaluate the relative importance among the 4 External Risk Factors sub-criteria",
    criterionObj: CRITERIA[3],
    items: CRITERIA[3].subcriteria,
    pairs: generatePairwiseCombinations(CRITERIA[3].subcriteria),
    icon: "bi-shield-exclamation"
  },
  {
    stepIndex: 7,
    id: "step_subcriteria_E",
    type: "comparisons",
    groupKey: "E",
    criterionCode: "E",
    codeBadge: "E",
    badgeClass: "badge-criteria-e",
    category: "Sub-criteria",
    navTitle: "E-ESG Criteria",
    shortTitle: "Sub-criteria: E-ESG Criteria",
    badgeColor: "#2c8050",
    title: "Sub-criteria of Criterion E: Economic, Environmental, Social, and Governance (E-ESG) Criteria",
    subtitle: "Evaluate the relative importance among the 4 E-ESG sub-criteria",
    criterionObj: CRITERIA[4],
    items: CRITERIA[4].subcriteria,
    pairs: generatePairwiseCombinations(CRITERIA[4].subcriteria),
    icon: "bi-globe"
  },
  {
    stepIndex: 8,
    id: "step_review_submit",
    type: "review_submit",
    codeBadge: "✓",
    badgeClass: "badge-criteria-finish",
    category: "Final Step",
    navTitle: "Review and Submission",
    shortTitle: "Review and Submission",
    title: "General Review and Submission",
    subtitle: "Summary of responses, optional technical remarks, and submission",
    icon: "bi-send-check-fill"
  }
];

/**
 * Returns all comparison pairs from all steps combined (44 pairs in total)
 */
function getAllSurveyPairs() {
  const allPairs = [];
  SURVEY_STEPS.forEach((step) => {
    if (step.type === "comparisons" && Array.isArray(step.pairs)) {
      step.pairs.forEach((pair) => {
        allPairs.push({
          ...pair,
          stepIndex: step.stepIndex,
          stepGroup: step.groupKey,
          stepTitle: step.title
        });
      });
    }
  });
  return allPairs;
}

// Browser and Node.js compatible export
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SURVEY_VERSION,
    CRITERIA,
    SAATY_SCALE_OPTIONS,
    SURVEY_STEPS,
    generatePairwiseCombinations,
    getAllSurveyPairs
  };
}
