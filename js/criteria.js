/**
 * Definitions of Criteria, Sub-criteria, and Saaty Scale for the Fuzzy-AHP method
 * Site selection for CO2 storage in salt caverns
 * Based on the hierarchical structure of the project (Criteria A to F and their sub-criteria)
 */

const SURVEY_VERSION = "ultra-deepwater-salt-domes-v2";

const CRITERION_HELP_PLACEHOLDER = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

const CRITERIA = [
  {
    id: "A",
    code: "A",
    name: "Geological Formation",
    fullName: "A. Geological Formation",
    badgeColor: "#6f42c1",
    description: "Formation depth, net thickness, lateral extent, interlayer volume and stratigraphic heterogeneities.",
    helpText: CRITERION_HELP_PLACEHOLDER,
    subcriteria: [
      {
        id: "A1",
        code: "A1",
        parentCode: "A",
        name: "Formation depth",
        fullName: "A1. Formation depth",
        description: "Depth of the salt formation for containment and suitable thermodynamic conditions.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      },
      {
        id: "A2",
        code: "A2",
        parentCode: "A",
        name: "Net thickness",
        fullName: "A2. Net thickness",
        description: "Available clean salt thickness for safe construction of storage caverns.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      },
      {
        id: "A3",
        code: "A3",
        parentCode: "A",
        name: "Lateral extent",
        fullName: "A3. Lateral extent",
        description: "Lateral extent of the evaporite formation.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      },
      {
        id: "A4",
        code: "A4",
        parentCode: "A",
        name: "Interlayer volume and stratigraphic heterogeneities",
        fullName: "A4. Interlayer volume and stratigraphic heterogeneities",
        description: "Presence and volumetric proportion of interlayerded non-salt lithologies.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      }
    ]
  },
  {
    id: "B",
    code: "B",
    name: "Mineralogy and Geochemistry",
    fullName: "B. Mineralogy and Geochemistry",
    badgeColor: "#b02a37",
    description: "Halite content, insoluble content, highly soluble salts / low density.",
    helpText: CRITERION_HELP_PLACEHOLDER,
    subcriteria: [
      {
        id: "B1",
        code: "B1",
        parentCode: "B",
        name: "Halite content",
        fullName: "B1. Halite content",
        description: "NaCl mineral purity grade essential for controlled leaching and cavern stability.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      },
      {
        id: "B2",
        code: "B2",
        parentCode: "B",
        name: "Insoluble content",
        fullName: "B2. Insoluble content",
        description: "Content of anhydrite, shale, and insolubles affecting leaching and cavern floor accumulation.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      },
      {
        id: "B3",
        code: "B3",
        parentCode: "B",
        name: "Highly soluble salts / low density",
        fullName: "B3. Highly soluble salts / low density",
        description: "Presence of carnallite, tachyhydrite, and rapidly dissolving potassium/magnesium salts.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      },
    ]
  },
  {
    id: "C",
    code: "C",
    name: "Formation Geomechanics",
    fullName: "C. Formation Geomechanics",
    badgeColor: "#997404",
    description: "In-situ stress regime, distance from faults and layer boundaries, fracturing and permeability, geothermal gradient and temperature effects.",
    helpText: CRITERION_HELP_PLACEHOLDER,
    subcriteria: [
      {
        id: "C1",
        code: "C1",
        parentCode: "C",
        name: "In-situ stress regime",
        fullName: "C1. In-situ stress regime",
        description: "Three-dimensional stress state (vertical and horizontal stresses) acting on the salt layer.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      },
      {
        id: "C2",
        code: "C2",
        parentCode: "C",
        name: "Distance from faults and layer boundaries",
        fullName: "C2. Distance from faults and layer boundaries",
        description: "Clearance from active/critical fault zones and lateral boundaries of the salt dome/bed.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      },
      {
        id: "C3",
        code: "C3",
        parentCode: "C",
        name: "Fracturing and permeability",
        fullName: "C3. Fracturing and permeability",
        description: "Degree of micro/macrofracturing and effective permeability of the host salt rock.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      },
      {
        id: "C4",
        code: "C4",
        parentCode: "C",
        name: "Geothermal gradient and temperature effects",
        fullName: "C4. Geothermal gradient and temperature effects",
        description: "In situ temperature and its influence on creep rate and cavern integrity.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      }
    ]
  },
  {
    id: "D",
    code: "D",
    name: "Interlayer Characteristics",
    fullName: "D. Interlayer Characteristics",
    badgeColor: "#087990",
    description: "Lateral extent, thickness, fracturing and permeability, rock strength.",
    helpText: CRITERION_HELP_PLACEHOLDER,
    subcriteria: [
      {
        id: "D1",
        code: "D1",
        parentCode: "D",
        name: "Lateral extent",
        fullName: "D1. Lateral extent",
        description: "Extent and persistence of non-salt interlayers across the rock mass.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      },
      {
        id: "D2",
        code: "D2",
        parentCode: "D",
        name: "Thickness",
        fullName: "D2. Thickness",
        description: "Vertical thickness of interstratified anhydrite, carbonate, or shale beds.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      },
      {
        id: "D3",
        code: "D3",
        parentCode: "D",
        name: "Fracturing and permeability",
        fullName: "D3. Fracturing and permeability",
        description: "Fracture propensity and preferential leakage pathways in interlayers.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      },
      {
        id: "D4",
        code: "D4",
        parentCode: "D",
        name: "Rock strength",
        fullName: "D4. Rock strength",
        description: "Mechanical strength properties and stiffness contrast with surrounding salt.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      }
    ]
  },
  {
    id: "E",
    code: "E",
    name: "External Risk Factors",
    fullName: "E. External Risk Factors",
    badgeColor: "#2c8050",
    description: "Associated tectonics, regional seismicity, secondary seal characteristics, proximity to exploratory wells.",
    helpText: CRITERION_HELP_PLACEHOLDER,
    subcriteria: [
      {
        id: "E1",
        code: "E1",
        parentCode: "E",
        name: "Associated tectonics",
        fullName: "E1. Associated tectonics",
        description: "Regional tectonic setting, active faults, and basin structural stability.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      },
      {
        id: "E2",
        code: "E2",
        parentCode: "E",
        name: "Regional seismicity",
        fullName: "E2. Regional seismicity",
        description: "History, magnitude, and frequency of natural or induced seismicity in the area.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      },
      {
        id: "E3",
        code: "E3",
        parentCode: "E",
        name: "Proximity to exploration wells",
        fullName: "E3. Proximity to exploration wells",
        description: "Distance and density of previous drilled wells with potential for decompression or CO₂ escape.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      },
      {
        id: "E4",
        code: "E4",
        parentCode: "E",
        name: "Secondary seal",
        fullName: "E4. Secondary seal",
        description: "Thickness, lateral continuity, low permeability, and sealing capacity of overlying caprock.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      }
    ]
  },
  {
    id: "F",
    code: "F",
    name: "Logistics and Site Conditions",
    fullName: "F. Logistics and Site Conditions",
    badgeColor: "#ff9628",
    description: "Construction/operations infrastructure, transportation infrastructure, distance to CO₂ sources.",
    helpText: CRITERION_HELP_PLACEHOLDER,
    subcriteria: [
      {
        id: "F1",
        code: "F1",
        parentCode: "F",
        name: "Construction/operations infrastructure",
        fullName: "F1. Construction/operations infrastructure",
        description: "Access to fresh water for salt leaching, electrical power, brine disposal, and operational support.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      },
      {
        id: "F2",
        code: "F2",
        parentCode: "F",
        name: "Transportation infrastructure",
        fullName: "F2. Transportation infrastructure",
        description: "Availability of pipeline networks, highways, or marine terminals.",
        helpText: CRITERION_HELP_PLACEHOLDER,
      },
      {
        id: "F3",
        code: "F3",
        parentCode: "F",
        name: "Distance to CO₂ sources",
        fullName: "F3. Distance to CO₂ sources",
        description: "Proximity to industrial clusters and concentrated CO₂ emission sources.",
        helpText: CRITERION_HELP_PLACEHOLDER,
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
 * Centralized definition of all 9 steps with descriptive names for criteria and sub-criteria
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
    codeBadge: "A–F",
    badgeClass: "badge-criteria-global",
    category: "Main Criteria",
    navTitle: "Main Criteria",
    shortTitle: "Main Criteria",
    badgeColor: "#0f4c81",
    title: "Main Criteria",
    subtitle: "Evaluate the pairwise relative importance among the 6 fundamental main criteria",
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
    subtitle: "Evaluate the relative importance among the 4 Geological Formation sub-criteria",
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
    navTitle: "Mineralogy and Geochemistry",
    shortTitle: "Sub-criteria: Mineralogy and Geochemistry",
    badgeColor: "#b02a37",
    title: "Sub-criteria of Criterion B: Mineralogy and Geochemistry",
    subtitle: "Evaluate the relative importance among the 3 Mineralogy and Geochemistry sub-criteria",
    criterionObj: CRITERIA[1],
    items: CRITERIA[1].subcriteria,
    pairs: generatePairwiseCombinations(CRITERIA[1].subcriteria),
    icon: "bi-droplet-half"
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
    navTitle: "Formation Geomechanics",
    shortTitle: "Sub-criteria: Formation Geomechanics",
    badgeColor: "#997404",
    title: "Sub-criteria of Criterion C: Formation Geomechanics",
    subtitle: "Evaluate the relative importance among the 4 Geomechanics sub-criteria",
    criterionObj: CRITERIA[2],
    items: CRITERIA[2].subcriteria,
    pairs: generatePairwiseCombinations(CRITERIA[2].subcriteria),
    icon: "bi-activity"
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
    navTitle: "Interlayer Characteristics",
    shortTitle: "Sub-criteria: Interlayer Characteristics",
    badgeColor: "#087990",
    title: "Sub-criteria of Criterion D: Interlayer Characteristics",
    subtitle: "Evaluate the relative importance among the 4 Interlayer sub-criteria",
    criterionObj: CRITERIA[3],
    items: CRITERIA[3].subcriteria,
    pairs: generatePairwiseCombinations(CRITERIA[3].subcriteria),
    icon: "bi-segmented-nav"
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
    navTitle: "External Risk Factors",
    shortTitle: "Sub-criteria: External Risk Factors",
    badgeColor: "#2c8050",
    title: "Sub-criteria of Criterion E: External Risk Factors",
    subtitle: "Evaluate the relative importance among the 4 External Risk Factors sub-criteria",
    criterionObj: CRITERIA[4],
    items: CRITERIA[4].subcriteria,
    pairs: generatePairwiseCombinations(CRITERIA[4].subcriteria),
    icon: "bi-shield-exclamation"
  },
  {
    stepIndex: 8,
    id: "step_subcriteria_F",
    type: "comparisons",
    groupKey: "F",
    criterionCode: "F",
    codeBadge: "F",
    badgeClass: "badge-criteria-f",
    category: "Sub-criteria",
    navTitle: "Logistics and Site Conditions",
    shortTitle: "Sub-criteria: Logistics and Site Conditions",
    badgeColor: "#ff9628",
    title: "Sub-criteria of Criterion F: Logistics and Site Conditions",
    subtitle: "Evaluate the relative importance among the 3 Logistics sub-criteria",
    criterionObj: CRITERIA[5],
    items: CRITERIA[5].subcriteria,
    pairs: generatePairwiseCombinations(CRITERIA[5].subcriteria),
    icon: "bi-geo-alt-fill"
  },
  {
    stepIndex: 9,
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
 * Returns all comparison pairs from all steps combined (45 pairs in total)
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
