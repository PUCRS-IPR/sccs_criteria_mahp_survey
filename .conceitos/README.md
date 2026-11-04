# Demonstração Conceitual: Simulação de Monte Carlo & Fuzzy-AHP

Este diretório contém a demonstração visual e didática do projeto **Ahp_cave_survey**, estruturada no padrão de visualização interativa de `geomshgen/.conceitos`.

O script `simulacao_monte_carlo.py` foi especialmente projetado para **pessoas sem formação prévia em estatística**. Ele explica, passo a passo, como a opinião humana é capturada, como o computador "joga dados" para simular cenários e como os pesos convergem para uma curva em sino (Gaussiana).

---

## 🚀 Como Executar

### Opção 1: Via Python
```bash
python .conceitos/simulacao_monte_carlo.py
```

### Opção 2: Via NPM
```bash
npm run demo:monte_carlo
```

### Opção 3: Exportar Previews em Imagem (.png)
```bash
npm run demo:monte_carlo:export
```

---

## 🎮 Controles Interativos

| Ação | Botão na Tela | Teclas de Atalho |
| :--- | :--- | :--- |
| **Avançar Passo** | `Avançar ▶` | `Seta Direita`, `Espaço`, `Enter` |
| **Voltar Passo** | `◀ Voltar` | `Seta Esquerda`, `Backspace` |
| **Resetar Demonstração** | `↺ Resetar` | `Home`, `R` |
| **Acúmulo Dinâmico** | `▶ Acumular Amostras` | `A`, `P` |

> [!TIP]
> Nos **Passos 6, 7 e 8**, clique no botão **`▶ Acumular Amostras`** para assistir aos dados caindo na distribuição em tempo real e ver a curva Gaussiana se formar dinamicamente diante dos seus olhos!

---

## 🧭 O Roteiro Didático Completo em 13 Passos

```
[1. O Dilema Humano] ──────────→ [2. O Triângulo Fuzzy (TFN)]
         │                                    │
         ▼                                    ▼
[3. O que é Monte Carlo?] ─────→ [4. A Hipótese Metodológica]
         │                                    │
         ▼                                    ▼
[5. Rodada Isolada (k=1)] ─────→ [6. Múltiplos Especialistas (AIP)]
         │                                    │
         ▼                                    ▼
[7. O Caos Inicial (N=10)] ────→ [8. Lei dos Grandes Números (N=100)]
         │                                    │
         ▼                                    ▼
[9. Teorema Central do Limite] ─→ [10. Convergência Total (N=10.000)]
         │                                    │
         ▼                                    ▼
[11. INPUT: Cobertura (95%)] ──→ [12. OUTPUT: Intervalo Empírico]
         │
         ▼
[13. Quadro Consolidado: Inputs vs Outputs]
```

### 1. O Ponto de Partida: Julgamento Rígido vs Incerteza Humana Real
- **O problema do método tradicional:** Obriga um especialista a cravar que um critério é "exatamente 3.0 vezes mais importante".
- **A realidade humana:** O especialista tem dúvida: *"é por volta de 3, talvez 2, talvez até 4"*. O Fuzzy-AHP acolhe essa dúvida em vez de ignorá-la.

### 2. O Número Fuzzy Triangular (TFN): A Geometria da Dúvida
- **Como desenhar a dúvida:** Um triângulo $\tilde{a} = (l, m, u) = (2.0, 3.0, 4.0)$.
- **Pertinência $\mu(x)$:** No ponto $3.0$ a certeza é máxima ($\mu = 1.0$); nos extremos $2.0$ e $4.0$ a plausibilidade cai a zero ($\mu = 0.0$).

### 3. O que é Monte Carlo? A Analogia dos Dados e Roletas
- **Por que esse nome:** Homenagem ao Cassino de Monte Carlo em Mônaco.
- **A intuição:** Em vez de tentar resolver fórmulas analíticas insolúveis no papel, o computador joga "dados viciados" milhares de vezes, caindo com muito mais frequência perto do ápice ($3.0$) do que das pontas.

### 4. A Hipótese Metodológica: TFN como Densidade de Probabilidade
- **Aviso Metodológico:** Pertinência subjetiva fuzzy $\neq$ probabilidade estatística.
- **A ponte assumida:** Tratamos o triângulo como uma densidade contínua $f(x)$ com área total $= 1.00$ ($100\%$ de probabilidade), permitindo sorteios estocásticos controlados.

### 5. Uma Rodada Isolada ($k=1$): Um Cenário Fictício e o Cálculo de Buckley
- O computador sorteia uma matriz completa de comparações e calcula os pesos normalizados pela média geométrica de Buckley.
- Gera um peso isolado (ex: $W_1 = 50.24\%$).
- **Lição:** Uma única rodada não tem valor estatístico; precisamos de milhares de repetições para mapear o comportamento.

### 6. Múltiplos Especialistas: Duas Incertezas e a Agregação AIP
- **O Desafio do Comitê:** A pesquisa do F-AHP recebe formulários preenchidos por múltiplos especialistas, cada um com sua experiência e visão de mundo.
- **Duas Fontes Distintas de Incerteza:**
  1. *Incerteza Intra-Especialista (Dúvida Pessoal):* Modelada pelo triângulo TFN $(l, m, u)$ individual de cada respondente.
  2. *Variabilidade Inter-Especialistas (Divergência):* A discordância natural entre diferentes profissionais (ex: $E_1 \approx 48.5\%$, $E_2 \approx 58.2\%$, $E_3 \approx 54.9\%$).
- **Agregação por Prioridades Individuais (AIP):** Em cada iteração $k$, o computador sorteia os julgamentos de cada especialista de forma independente, calcula os pesos individuais e obtém o consenso da rodada pela média do grupo:
  $$W_{\text{global}}^{(k)} = \frac{1}{E} \sum_{e=1}^E w_e^{(k)}$$
- **Resultado:** A curva final de consenso equilibra os pontos de vista e filtra os extremos sem descartar nenhum especialista.

### 7. Poucas Rodadas ($N=10$): O Caos e a Instabilidade do Acaso
- Com apenas 10 repetições, as barras do histograma são desiguais, tortas e caóticas.
- O erro amostral é alto ($\text{SE} \approx \pm 1.1\%$). Não se deve tomar decisões com $N$ pequeno.

### 8. Acumulando Tentativas ($N=100$): A Lei dos Grandes Números
- As oscilações malucas começam a se cancelar.
- As barras centrais acumulam mais ocorrências e o erro amostral despenca em mais de 70%.

### 9. O Teorema Central do Limite ($N=500$): A Mágica do Sino de Gauss
- **Por que surge uma curva de sino simétrica:** A média geométrica multiplica variáveis incertas; no espaço logarítmico, multiplicações viram somas. Pelo Teorema Central do Limite, somas de variáveis independentes convergem para uma distribuição Normal $\mathcal{N}(\mu, \sigma^2)$.
- O histograma abraça perfeitamente a curva teórica vermelha em ambos os lados.

### 10. Convergência Total ($N=10.000$): O Retrato Fiel da Incerteza do Comitê
- Média ($\bar{W}_1 \approx 53.86\%$) e desvio padrão ($s \approx 3.31\%$) congelam.
- Erro padrão residual quase nulo ($\text{SE} = \pm 0.033\%$). Ambos os lados da distribuição estão nítidos.
- **Por que não usar 1.000.000?** Aumentar de 10.000 para 1 milhão só gasta tempo de processamento sem alterar a tomada de decisão.

### 11. O Nível de Cobertura (INPUT): A Decisão de Cortar Caudas (95%)
- **A decisão do analista:** Descartar os 5% de cenários mais bizarros/extremos (2.5% super pessimistas na esquerda e 2.5% super otimistas na direita).
- O nível de 95% é um **INPUT** humano; ele comanda a proporção central que queremos utilizar, não onde os números cairão.

### 12. O Intervalo Empírico de Incerteza (OUTPUT): Os Limites Revelados
- A simulação revela onde as caudas de 2.5% cortam:
  - Limite Inferior: $Q_{2.5\%} = 46.77\%$
  - Limite Superior: $Q_{97.5\%} = 59.59\%$
- **Aplicação prática:** Em 95% dos cenários gerados pelas opiniões dos especialistas, a importância do Critério 1 situa-se na faixa $[46.77\%, 59.59\%]$.

### 13. Quadro Consolidado: Entradas vs Saídas do Modelo
- Quadro sintético separando parâmetros de entrada (inputs) e resultados numéricos gerados (outputs).
- **Distinção Conceitual:** Não se trata de um "Intervalo de Confiança" clássico (que exigiria amostragem aleatória de uma população real em campo), mas de um **Intervalo Empírico de Incerteza de 95%**, que mapeia a propagação das dúvidas do comitê de decisão.

---

## 📊 Tabela Didática de Inputs vs. Outputs

| Elemento | Classificação | Papel no Método | Exemplo Numérico |
| :--- | :--- | :--- | :--- |
| **Triângulo Fuzzy $(l, m, u)$** | **Input (Modelo)** | Opinião com margem de dúvida de cada especialista | $(2.0, 3.0, 4.0)$ |
| **Nº de Simulações ($N$)** | **Input (Configuração)** | Quantidade de rodadas de dados simulados | $10.000$ iterações |
| **Nível de Cobertura ($\gamma$)** | **Input (Decisão)** | Proporção central retida para análise de risco | $95.0\%$ ($\alpha = 0.05$) |
| **Distribuição $f(W)$** | **Output (Simulação)** | Curva simétrica de densidade de probabilidade | Sino Gaussiano |
| **Média ($\bar{W}$) e Mediana** | **Output (Simulação)** | Ponto de consenso e tendência central | $53.86\%$ e $54.12\%$ |
| **Percentil $Q_{2.5\%}$** | **Output (Simulação)** | Pior caso plausível ($2.5\%$ inferior) | $46.77\%$ |
| **Percentil $Q_{97.5\%}$** | **Output (Simulação)** | Melhor caso plausível ($2.5\%$ superior) | $59.59\%$ |
| **Intervalo Empírico** | **Output Final** | Faixa de segurança operacional de 95% | $[46.77\%, 59.59\%]$ |
