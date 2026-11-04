/**
 * Teste automatizado de validação do formulário Fuzzy-AHP Multi-Step com Subcritérios
 */
const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');

const rootDir = path.join(__dirname, '..');

// 1. Ler index.html e verificar ausência de style="..."
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const inlineStyleMatches = html.match(/style\s*=\s*["'][^"']*["']/gi);
if (inlineStyleMatches && inlineStyleMatches.length > 0) {
  console.error("ERRO: Encontrados atributos style inline no index.html:", inlineStyleMatches);
  process.exit(1);
} else {
  console.log("✓ index.html: Nenhum inline style encontrado (100% via CSS).");
}

// 2. Verificar criteria.js
const {
  CRITERIA,
  SAATY_SCALE_OPTIONS,
  SURVEY_STEPS,
  generatePairwiseCombinations,
  getAllSurveyPairs
} = require('../js/criteria.js');

console.log(`✓ Critérios carregados: ${CRITERIA.length} (A a F)`);
if (CRITERIA.length !== 6) {
  console.error("ERRO: Esperado 6 critérios.");
  process.exit(1);
}

// Verificar subcritérios de cada critério
const expectedSubcounts = { A: 4, B: 3, C: 4, D: 4, E: 4, F: 3 };
CRITERIA.forEach((crit) => {
  const expected = expectedSubcounts[crit.code];
  if (!crit.subcriteria || crit.subcriteria.length !== expected) {
    console.error(`ERRO: Subcritérios de ${crit.code} esperados ${expected}, recebido ${crit.subcriteria?.length}`);
    process.exit(1);
  }
  console.log(`  ✓ Critério ${crit.code} (${crit.name}): ${crit.subcriteria.length} subcritérios`);
});

// 3. Verificar etapas da pesquisa (9 steps)
console.log(`✓ Etapas da pesquisa configuradas: ${SURVEY_STEPS.length} (esperado 9)`);
if (SURVEY_STEPS.length !== 9) {
  console.error("ERRO: Esperado 9 etapas no fluxo do questionário.");
  process.exit(1);
}

// 4. Verificar total de comparações paritárias
const allPairs = getAllSurveyPairs();
console.log(`✓ Total de pares de comparação: ${allPairs.length} (esperado 45)`);
if (allPairs.length !== 45) {
  console.error(`ERRO: Esperado 45 pares no total (15 globais + 4x6 + 2x3 = 45), recebido ${allPairs.length}`);
  process.exit(1);
}

// 5. Verificar escala de Saaty / opções verbais
const expectedScale = [
  "Equal importance",
  "Moderately superior",
  "Superior",
  "Very superior",
  "Extremely superior"
];

console.log(`✓ Opções da escala verbal: ${SAATY_SCALE_OPTIONS.length}`);
if (SAATY_SCALE_OPTIONS.length !== 5) {
  console.error(`ERRO: Esperado 5 opções na escala verbal, recebido ${SAATY_SCALE_OPTIONS.length}`);
  process.exit(1);
}

expectedScale.forEach((opt, idx) => {
  if (SAATY_SCALE_OPTIONS[idx] !== opt) {
    console.error(`ERRO: Opção ${idx} esperada "${opt}", recebida "${SAATY_SCALE_OPTIONS[idx]}"`);
    process.exit(1);
  }
});
console.log("✓ As 5 opções verbais da escala de Saaty conferem exatamente com a metodologia.");

// 6. Verificar todas as 9 views de steps no HTML
for (let s = 1; s <= 9; s++) {
  if (!html.includes(`id="stepView_${s}"`)) {
    console.error(`ERRO: View do step ${s} (id="stepView_${s}") não encontrada no index.html.`);
    process.exit(1);
  }
}
console.log("✓ Todas as 9 views de etapas (id='stepView_1' a id='stepView_9') encontradas no HTML.");

// 7. Verificar containeres de matriz de comparação (etapas 2 a 8)
for (let s = 2; s <= 8; s++) {
  if (!html.includes(`id="matrixContainer_step_${s}"`)) {
    console.error(`ERRO: Container de matriz do step ${s} (id="matrixContainer_step_${s}") não encontrado no index.html.`);
    process.exit(1);
  }
}
console.log("✓ Todos os containeres de matriz de comparações (steps 2 a 8) encontrados no HTML.");

// 8. Verificar Web3Forms action e access_key
if (!html.includes('https://api.web3forms.com/submit')) {
  console.error("ERRO: Action do Web3Forms incorreta ou não encontrada.");
  process.exit(1);
}
if (!html.includes('b7fcd54a-0764-49b7-ab97-958c10fdb7f5')) {
  console.error("ERRO: access_key do Web3Forms incorreta ou não encontrada.");
  process.exit(1);
}
console.log("✓ Endpoint e access_key do Web3Forms configurados corretamente.");

const expectedHierarchy = [
  ['Geological Formation', ['Formation depth', 'Net thickness', 'Lateral extent', 'Interlayer volume and stratigraphic heterogeneities']],
  ['Mineralogy and Geochemistry', ['Halite content', 'Insoluble content', 'Highly soluble salts / low density']],
  ['Formation Geomechanics', ['In-situ stress regime', 'Distance from faults and layer boundaries', 'Fracturing and permeability', 'Geothermal gradient and temperature effects']],
  ['Interlayer Characteristics', ['Lateral extent', 'Thickness', 'Fracturing and permeability', 'Rock strength']],
  ['External Risk Factors', ['Associated tectonics', 'Regional seismicity', 'Proximity to exploration wells', 'Secondary seal']],
  ['Logistics and Site Conditions', ['Construction/operations infrastructure', 'Transportation infrastructure', 'Distance to CO₂ sources']]
];
assert.deepEqual(CRITERIA.map((criterion) => [criterion.name, criterion.subcriteria.map((item) => item.name)]), expectedHierarchy);
for (const criterion of CRITERIA) {
  assert.deepEqual(criterion.subcriteria.map((item) => item.code), criterion.subcriteria.map((_, index) => `${criterion.code}${index + 1}`));
}
console.log('✓ Nomes, códigos e ordem dos critérios conferem com a nova hierarquia.');
const favicon = html.match(/<link rel="icon"[^>]+href="([^"]+)"/);
assert.ok(favicon, 'O favicon do IPR deve estar configurado.');
assert.ok(fs.existsSync(path.join(rootDir, favicon[1])));

console.log("\n========================================================");
console.log("Todos os testes de validação passaram com 100% de sucesso!");
console.log("========================================================\n");
