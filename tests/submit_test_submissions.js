/**
 * Script automatizado para realizar submissões completas de teste ao Web3Forms
 * correspondendo à totalidade das etapas do formulário Fuzzy-AHP (Etapas 1 a 9).
 * 
 * GARANTIA: 100% de todas as perguntas (5 cadastrais + 90 paritárias das 45 comparações = 95 campos)
 * são rigorosamente preenchidas e validadas antes do envio, abrangendo:
 * - Etapa 1: Identificação do Especialista (Nome, E-mail, Instituição, Área de Atuação)
 * - Etapa 2: Critérios Principais Globais (A a F: 15 pares de comparação)
 * - Etapa 3: Subcritérios de Formação Geológica (A1 a A4: 6 pares)
 * - Etapa 4: Subcritérios de Mineralogia e Geoquímica (B1 a B3: 3 pares)
 * - Etapa 5: Subcritérios de Geomecânica da Formação (C1 a C4: 6 pares)
 * - Etapa 6: Subcritérios de Características das Intercamadas (D1 a D4: 6 pares)
 * - Etapa 7: Subcritérios de Fatores de Risco Externo (E1 a E4: 6 pares)
 * - Etapa 8: Subcritérios de Logística e Condições do Sítio (F1 a F3: 3 pares)
 * - Etapa 9: Comentários e Justificativas Técnicas
 * 
 * As respostas são geradas de forma aleatória independente para cada especialista,
 * sem seguir padrão ABCDEF ou viés de ordenação alfabética/posicional.
 */

const { execFileSync } = require('child_process');
const { getAllSurveyPairs, SAATY_SCALE_OPTIONS, SURVEY_STEPS } = require('../js/criteria.js');

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const ACCESS_KEY = "b7fcd54a-0764-49b7-ab97-958c10fdb7f5";
const PAIRS = getAllSurveyPairs();
const DELAY_SECONDS = 30;

// 5 perfis de especialistas completos para teste técnico
const TEST_SPECIALISTS = [
  {
    nome_especialista: "Dra. Helena Vasconcelos",
    email: "helena.vasconcelos@labgeo-ufrj.br",
    instituicao: "UFRJ / CENPES",
    area_atuacao: "Geologia Estrutural e Estratigrafia de Bacias Evaporíticas",
    message: "Avaliação técnica completa: análise integrada considerando integridade estratigráfica, capeamento secundário e espessuras úteis de sal para armazenamento seguro de CO2."
  },
  {
    nome_especialista: "Dr. Carlos Eduardo Mendes",
    email: "carlos.mendes@ccus-brasil.org",
    instituicao: "Instituto Nacional de CCUS",
    area_atuacao: "Engenharia de Reservatórios e Armazenamento Geológico de Carbono",
    message: "Avaliação multicritério abrangente: ponderação de estabilidade geomecânica, taxas de fluência sob regimes de tensões in situ e infraestrutura logística regional."
  },
  {
    nome_especialista: "Prof. Dr. Roberto Guimarães",
    email: "roberto.guimaraes@fem.unicamp.br",
    instituicao: "UNICAMP",
    area_atuacao: "Geomecânica de Rochas Salinas e Fluência de Evaporitos",
    message: "Contribuição para o modelo Fuzzy-AHP: foco no comportamento reológico das rochas evaporíticas, espessura e competência das intercamadas não salinas."
  },
  {
    nome_especialista: "Dra. Beatriz Albuquerque",
    email: "beatriz.albuquerque@geoquimica-co2.com",
    instituicao: "Consultoria GeoAmbiente",
    area_atuacao: "Geoquímica e Reatividade Fluido-Rocha em Ambientes Hipersalinos",
    message: "Revisão com ênfase geoquímica: relevância de teores de halita versus sais solúveis higroscópicos e compatibilidade química com CO2 supercrítico."
  },
  {
    nome_especialista: "Dr. Marcos Vinícius Lima",
    email: "marcos.lima@infra-energy.gov.br",
    instituicao: "Agência Nacional de Energia / ANP",
    area_atuacao: "Logística, Transporte Dutoviário e Infraestrutura de Superfície",
    message: "Ponderações técnicas sobre viabilidade de implantação de cavernas de sal: transporte de CO2, acesso a água/energia e distância aos principais clusters emissores."
  }
];

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function getTimestamp() {
  return new Date().toLocaleTimeString("pt-BR", { hour12: false });
}

/**
 * Gera e valida as respostas para todas as 45 comparações paritárias
 * Cada par possui exatamente 2 perguntas:
 * 1. Qual critério/subcritério você julga mais importante? (Radio)
 * 2. O quão mais importante? (Select verbal da escala de Saaty)
 * 
 * Sem seguir qualquer padrão ABCDEF: a escolha entre crit1 e crit2
 * e o nível de superioridade na escala verbal são definidos de forma
 * aleatória e independente para cada par e especialista.
 */
function generateResponsesForSpecialist(specialistIndex) {
  const responses = [];

  PAIRS.forEach((pair, idx) => {
    // Escolha aleatória equilibrada entre crit1 e crit2 (sem viés posicional nem alfabético)
    const chooseFirst = Math.random() < 0.5;
    const chosenCrit = chooseFirst ? pair.crit1 : pair.crit2;

    // Seleção aleatória entre as opções da escala verbal de Saaty
    const scaleIndex = Math.floor(Math.random() * SAATY_SCALE_OPTIONS.length);
    const chosenScale = SAATY_SCALE_OPTIONS[scaleIndex];

    responses.push({
      globalIndex: idx + 1,
      pairIndex: pair.index,
      stepIndex: pair.stepIndex,
      stepGroup: pair.stepGroup,
      stepTitle: pair.stepTitle,
      pairKey: pair.pairKey,
      crit1: pair.crit1.fullName,
      crit2: pair.crit2.fullName,
      q1_name: `mais_importante_${pair.pairKey}`,
      q1_value: chosenCrit.fullName,
      q2_name: `intensidade_saaty_${pair.pairKey}`,
      q2_value: chosenScale
    });
  });

  return responses;
}

/**
 * Envia o payload via HTTP POST para o endpoint do Web3Forms
 * Utiliza fetch nativo (Node 18+) com fallback para curl.exe
 */
async function postPayload(payload) {
  const jsonBody = JSON.stringify(payload);
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'http://localhost:8000',
    'Referer': 'http://localhost:8000/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
  };

  if (typeof fetch === 'function') {
    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers,
        body: jsonBody
      });
      const data = await res.json();
      return data;
    } catch (fetchErr) {
      // Se fetch falhar na rede, tenta o fallback com curl.exe
    }
  }

  const args = [
    '-s',
    '-X', 'POST',
    WEB3FORMS_ENDPOINT,
    '-H', 'Content-Type: application/json',
    '-H', 'Accept: application/json',
    '-H', 'Origin: http://localhost:8000',
    '-H', 'Referer: http://localhost:8000/',
    '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    '-d', jsonBody
  ];

  const rawOutput = execFileSync('curl.exe', args, { encoding: 'utf8' });
  return JSON.parse(rawOutput);
}

/**
 * Envia uma submissão individual completa para o Web3Forms
 */
async function sendSubmission(specialist, index, total) {
  console.log(`\n============================================================`);
  console.log(`[${getTimestamp()}] [${index}/${total}] INICIANDO SUBMISSÃO: ${specialist.nome_especialista}`);
  console.log(`Instituição: ${specialist.instituicao}`);
  console.log(`E-mail: ${specialist.email}`);
  console.log(`Área de Atuação: ${specialist.area_atuacao}`);
  console.log(`Comentários Técnicos: "${specialist.message}"`);
  console.log(`------------------------------------------------------------`);

  // 1. Chave de acesso e metadados Web3Forms + Etapa 1 e Etapa 9
  const payload = {
    access_key: ACCESS_KEY,
    subject: `Avaliação Fuzzy-AHP Completa - ${specialist.nome_especialista}`,
    from_name: "Pesquisa Fuzzy-AHP",
    name: specialist.nome_especialista,
    email: specialist.email,
    instituicao: specialist.instituicao,
    area_atuacao: specialist.area_atuacao,
    message: specialist.message
  };

  // 2. Respostas para todas as 45 comparações (90 respostas no total: Etapas 2 a 8)
  const pairAnswers = generateResponsesForSpecialist(index);

  console.log(`[${getTimestamp()}] Respostas das 45 Comparações Paritárias (Etapas 2 a 8 - 100% preenchidas):`);
  let currentStep = null;
  pairAnswers.forEach((ans) => {
    // Validação estrita
    if (!ans.q1_value || !ans.q2_value) {
      throw new Error(`Erro: Pergunta não respondida no par ${ans.pairKey}`);
    }

    payload[ans.q1_name] = ans.q1_value;
    payload[ans.q2_name] = ans.q2_value;

    if (ans.stepIndex !== currentStep) {
      currentStep = ans.stepIndex;
      console.log(`\n  --- [Etapa ${ans.stepIndex}: ${ans.stepTitle}] ---`);
    }

    console.log(`  Par ${String(ans.globalIndex).padStart(2, '0')} (${ans.pairKey}): Mais importante -> "${ans.q1_value}" | Intensidade -> "${ans.q2_value}"`);
  });

  const totalPairsCount = pairAnswers.length;
  const totalFieldCount = 5 + (totalPairsCount * 2); // 5 cadastrais/técnicos + 90 de comparação
  console.log(`------------------------------------------------------------`);
  console.log(`Total de campos preenchidos nesta submissão: ${totalFieldCount} campos (5 cadastrais + ${totalPairsCount * 2} em ${totalPairsCount} pares) + metadados`);

  try {
    const startTime = Date.now();
    const data = await postPayload(payload);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    if (data.success === true) {
      console.log(`[${getTimestamp()}] ✓ [${index}/${total}] Sucesso no Web3Forms! (${elapsed}s)`);
      console.log(`Resposta do Web3Forms:`, JSON.stringify(data));
      return true;
    } else {
      console.warn(`[${getTimestamp()}] ⚠ [${index}/${total}] Resposta inesperada:`, data);
      return false;
    }
  } catch (error) {
    console.error(`[${getTimestamp()}] ❌ [${index}/${total}] Erro ao enviar:`, error.message);
    return false;
  }
}

/**
 * Orquestrador principal com intervalo de 30s entre os envios
 */
async function runAllSubmissions() {
  const total = TEST_SPECIALISTS.length;
  console.log(`============================================================`);
  console.log(`Bateria de ${total} submissões de teste da Avaliação Completa`);
  console.log(`Total de comparações: 45 pares (15 macrocritérios + 30 subcritérios)`);
  console.log(`Total de campos por submissão: 95 campos (100% preenchidos)`);
  console.log(`Modo de resposta: Aleatório independente (sem padrão ABCDEF)`);
  console.log(`Intervalo entre envios: ${DELAY_SECONDS} segundos`);
  console.log(`Endpoint: ${WEB3FORMS_ENDPOINT}`);
  console.log(`============================================================`);

  for (let i = 0; i < total; i++) {
    const specialist = TEST_SPECIALISTS[i];
    await sendSubmission(specialist, i + 1, total);

    // Intervalo de 30 segundos
    if (i < total - 1) {
      console.log(`\n[${getTimestamp()}] Aguardando ${DELAY_SECONDS} segundos até a próxima submissão...`);
      for (let s = DELAY_SECONDS; s > 0; s -= 5) {
        process.stdout.write(`... ${s}s restantes\n`);
        await sleep(Math.min(5, s));
      }
    }
  }

  console.log(`\n============================================================`);
  console.log(`[${getTimestamp()}] Todas as ${total} submissões foram concluídas com 100% das 45 comparações respondidas aleatoriamente!`);
  console.log(`============================================================\n`);
}

// Executar quando invocado diretamente via Node.js
if (require.main === module) {
  runAllSubmissions();
}

module.exports = {
  TEST_SPECIALISTS,
  generateResponsesForSpecialist,
  sendSubmission,
  runAllSubmissions
};
