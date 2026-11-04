"""Demonstração Didática e Interativa: Simulação de Monte Carlo no Modelo Fuzzy-AHP.

Desenvolvido para apresentar conceitos estocásticos de forma intuitiva, visual e acessível
para tomadores de decisão, engenheiros e pesquisadores sem formação aprofundada em estatística.

Roteiro Didático em 13 Passos:
 1. O Ponto de Partida: Julgamento Rígido vs Incerteza Humana Real
 2. O Número Fuzzy Triangular (TFN): A Geometria da Dúvida
 3. O que é Monte Carlo? A Analogia dos Dados e Roletas
 4. A Hipótese Metodológica: TFN como Densidade de Probabilidade
 5. Uma Rodada Isolada (k=1): Um Cenário Fictício e o Cálculo de Buckley
 6. Múltiplos Especialistas: Duas Incertezas e a Agregação AIP
 7. Poucas Rodadas (N=10): O Caos e a Instabilidade do Acaso
 8. Acumulando Tentativas (N=100): A Lei dos Grandes Números
 9. O Teorema Central do Limite (N=500): A Mágica do Sino de Gauss
10. Convergência Total (N=10.000): O Retrato Fiel do Consenso do Comitê
11. O Nível de Cobertura (INPUT): A Decisão de Cortar Caudas (95%)
12. O Intervalo Empírico de Incerteza (OUTPUT): Os Limites Revelados
13. Síntese do Modelo: Quadro Consolidado de Inputs e Outputs

Uso:
    python .conceitos/simulacao_monte_carlo.py
"""

from __future__ import annotations

import sys

# Configura backend não-interativo caso executado em testes ou exportação
if "--headless" in sys.argv or "--export" in sys.argv:
    import matplotlib
    matplotlib.use("Agg")

from typing import Any
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.axes import Axes
from scipy import stats

from demo_helpers import (
    InteractiveStepViewer,
    StepState,
    add_unique_legend,
    configure_card_axes,
    configure_stats_axes,
)

RNG = np.random.default_rng(42)

# Limites centrais do eixo X para exibir AMBOS os lados da distribuição de pesos de forma simétrica
X_LIMITS_PESOS = (36.0, 72.0)


class MonteCarloFAHPDemo:
    """Modelo didático completo em 13 passos para explicar Monte Carlo, Especialistas e F-AHP."""

    def __init__(
        self,
        *,
        l: float = 2.0,
        m: float = 3.0,
        u: float = 4.0,
        nivel_cobertura: float = 0.95,
        n_max: int = 10000,
    ) -> None:
        self.l = l
        self.m = m
        self.u = u
        self.nivel_cobertura = nivel_cobertura
        self.alpha = 1.0 - nivel_cobertura
        self.p_inf = (self.alpha / 2.0) * 100.0        # 2.5%
        self.p_sup = (1.0 - self.alpha / 2.0) * 100.0  # 97.5%
        self.n_max = n_max

        self._precompute_simulation_data()
        self.steps = self._build_steps()

    def _precompute_simulation_data(self) -> None:
        """Pré-computa pesos de Monte Carlo pelo método da média geométrica de Buckley."""
        c12 = (self.m - self.l) / (self.u - self.l)
        samples_12 = stats.triang.rvs(c12, loc=self.l, scale=self.u - self.l, size=self.n_max, random_state=42)

        c13 = (2.0 - 1.0) / (3.0 - 1.0)
        samples_13 = stats.triang.rvs(c13, loc=1.0, scale=2.0, size=self.n_max, random_state=43)

        c23 = (0.5 - 0.333) / (1.0 - 0.333)
        samples_23 = stats.triang.rvs(c23, loc=0.333, scale=1.0 - 0.333, size=self.n_max, random_state=44)

        r1 = (1.0 * samples_12 * samples_13) ** (1.0 / 3.0)
        r2 = ((1.0 / samples_12) * 1.0 * samples_23) ** (1.0 / 3.0)
        r3 = ((1.0 / samples_13) * (1.0 / samples_23) * 1.0) ** (1.0 / 3.0)

        sum_r = r1 + r2 + r3
        self.weights_c1 = (r1 / sum_r) * 100.0  # Em porcentagem (%)
        self.samples_12 = samples_12
        self.samples_13 = samples_13
        self.samples_23 = samples_23
        self.r1 = r1
        self.r2 = r2
        self.r3 = r3
        self.sum_r = sum_r

        # Estatísticas consolidadas da amostra completa
        self.global_mean = float(np.mean(self.weights_c1))
        self.global_std = float(np.std(self.weights_c1))
        self.global_median = float(np.median(self.weights_c1))
        self.global_q_inf = float(np.percentile(self.weights_c1, self.p_inf))
        self.global_q_sup = float(np.percentile(self.weights_c1, self.p_sup))

        # Modelagem didática de 3 especialistas do comitê com visões distintas
        self.mean_e1, self.std_e1 = 48.5, 3.8
        self.mean_e2, self.std_e2 = 58.2, 3.5
        self.mean_e3, self.std_e3 = 54.9, 3.2

    def _build_steps(self) -> list[StepState]:
        """Constrói os 13 passos didáticos da demonstração com valores reais da simulação."""
        q_inf_str = f"{self.global_q_inf:.2f}%"
        q_sup_str = f"{self.global_q_sup:.2f}%"
        mean_str = f"{self.global_mean:.2f}%"
        std_str = f"{self.global_std:.2f}%"

        steps: list[StepState] = [
            # Passo 1
            {
                "id": 1,
                "title": "O Ponto de Partida: Julgamento Rígido vs Incerteza Humana",
                "phase": "DILEMMA",
                "badge": "PASSO 1 DE 13 • O DILEMA HUMANO",
                "badge_bg": "#fef3c7",
                "badge_fg": "#b45309",
                "bullets": [
                    "▸ O AHP Tradicional: Força o especialista a cravar um número único rígido (ex: 'importância = 3.0').",
                    "▸ O Problema Real: Seres humanos não pensam como robôs! Nenhum especialista possui certeza matemática exata.",
                    "▸ A Realidade da Opinião Humana: O especialista pensa: 'É por volta de 3, mas pode ser 2 ou até 4'.",
                    "▸ A Solução Fuzzy: Substitui o valor cravado por uma faixa elástica contínua que respeita a margem de dúvida.",
                ],
                "takeaway": "[CONCEITO CHAVE] Forçar um número único ignora a incerteza do decisor. O Fuzzy-AHP acolhe essa dúvida de forma matemática.",
                "takeaway_kind": "insight",
            },
            # Passo 2
            {
                "id": 2,
                "title": "O Número Fuzzy Triangular (TFN): A Geometria da Dúvida",
                "phase": "TFN",
                "badge": "PASSO 2 DE 13 • MODELAGEM FUZZY",
                "badge_bg": "#eff6ff",
                "badge_fg": "#1d4ed8",
                "bullets": [
                    "▸ Como Modelar a Dúvida? A matemática utiliza um triângulo chamado TFN: ã = (l, m, u) = (2.0, 3.0, 4.0).",
                    "▸ Os Três Vértices do Triângulo:",
                    "  • l = 2.0 (Limite Inferior): Menor valor plausível admitido pelo especialista. Pertinência μ(2.0) = 0.0.",
                    "  • m = 3.0 (Ápice / Modo): Palpite principal e mais confortável. Pertinência máxima μ(3.0) = 1.0.",
                    "  • u = 4.0 (Limite Superior): Maior valor plausível admitido. Pertinência μ(4.0) = 0.0.",
                ],
                "takeaway": "[GEOMETRIA FUZZY] O grau de pertinência μ(x) mede quão compatível cada valor é com a opinião do especialista.",
                "takeaway_kind": "insight",
            },
            # Passo 3
            {
                "id": 3,
                "title": "O que é Monte Carlo? A Analogia dos Dados e Roletas",
                "phase": "WHAT_IS_MC",
                "badge": "PASSO 3 DE 13 • CONCEITO DE MONTE CARLO",
                "badge_bg": "#f0fdf4",
                "badge_fg": "#15803d",
                "bullets": [
                    "▸ Origem Histórica: Criado por matemáticos que se inspiraram nos jogos de probabilidade do Cassino de Monte Carlo.",
                    "▸ A Ideia Genial: Em vez de tentar resolver equações impossíveis no papel, o computador 'joga dados' milhares de vezes.",
                    "▸ Dados Viciados pelo Triângulo: O sorteio não é cego; ele sorteia muito mais valores perto de 3.0 do que nas pontas.",
                    "▸ Simulação Computacional: Cada rodada da roleta cria um cenário hipotético plausível de avaliação paritária.",
                ],
                "takeaway": "[INTUIÇÃO] Monte Carlo descobre a resposta correta jogando os dados da incerteza milhares de vezes e observando o padrão.",
                "takeaway_kind": "insight",
            },
            # Passo 4
            {
                "id": 4,
                "title": "A Hipótese Metodológica: TFN como Densidade de Probabilidade",
                "phase": "TRIANG_PDF",
                "badge": "PASSO 4 DE 13 • HIPÓTESE ASSUMIDA",
                "badge_bg": "#fef2f2",
                "badge_fg": "#b91c1c",
                "bullets": [
                    "▸ Distinção Epistemológica: Originalmente, o triângulo fuzzy expressa 'pertinência linguística', NÃO probabilidade!",
                    "▸ A Ponte Metodológica Necessária: Para rodar Monte Carlo, assumimos formalmente a hipótese:",
                    "  • O triângulo é interpretado como uma Distribuição Contínua de Probabilidade Triangular f(x).",
                    "  • A área total sob o triângulo é normalizada para exatamente 1.00 (100% de chance).",
                    "  • Altura do pico: h = 2 / (u - l) = 2 / (4.0 - 2.0) = 1.00 no ponto modal m = 3.0.",
                ],
                "takeaway": "[NOTA TÉCNICA] Essa conversão é a chave que permite aplicar a simulação de Monte Carlo aos julgamentos fuzzy.",
                "takeaway_kind": "insight",
            },
            # Passo 5
            {
                "id": 5,
                "title": "Uma Rodada Isolada (k=1): Um Cenário Fictício e o Cálculo de Buckley",
                "phase": "SINGLE_SAMPLE",
                "badge": "PASSO 5 DE 13 • RODADA INDIVIDUAL (k=1)",
                "badge_bg": "#fef3c7",
                "badge_fg": "#b45309",
                "bullets": [
                    "▸ Rodada k = 1: O computador sorteia valores do triângulo para cada par (ex: a₁₂ = 2.87) e toma a recíproca a₂₁ = 1 / 2.87.",
                    "▸ Média Geométrica das Linhas (Buckley): r̃ᵢ = (∏ⱼ aᵢⱼ)¹ᐟⁿ = exp( (1/n) · ∑ⱼ ln aᵢⱼ ).",
                    "▸ Normalização dos Pesos: Wᵢ = r̃ᵢ / (∑ₖ r̃ₖ)  →  Gera um único resultado pontual (W₁ = 50.24%).",
                    "▸ O Ponto Cego: Um único resultado não diz nada sobre a incerteza! Se jogarmos os dados de novo, o valor muda.",
                ],
                "takeaway": "[CENÁRIO ISOLADO] Uma única iteração é apenas uma gota no oceano. Precisamos rodar muitas vezes para enxergar o padrão.",
                "takeaway_kind": "insight",
            },
            # Passo 6 (NOVO: Múltiplos Especialistas e AIP)
            {
                "id": 6,
                "title": "Múltiplos Especialistas: Duas Incertezas e a Agregação AIP",
                "phase": "MULTI_EXPERTS",
                "badge": "PASSO 6 DE 13 • MÚLTIPLOS ESPECIALISTAS & AIP",
                "badge_bg": "#eff6ff",
                "badge_fg": "#1d4ed8",
                "bullets": [
                    "▸ O Desafio do Comitê: A survey do F-AHP recebe respostas de múltiplos especialistas com visões e pesos diferentes.",
                    "▸ Duas Camadas de Incerteza:",
                    "  • 1. Incerteza Intra-Especialista (Dúvida Pessoal): modelada pelo triângulo TFN de cada indivíduo.",
                    "  • 2. Variabilidade Inter-Especialistas (Divergência): a discordância natural entre membros do grupo.",
                    "▸ Agregação AIP (Aggregation of Individual Priorities): Cada especialista é simulado individualmente 10.000 vezes.",
                    "▸ Média por Iteração: Em cada rodada k, os pesos de todos os especialistas são combinados pela média do grupo.",
                ],
                "takeaway": "[CONSENSO EQUILIBRADO] Nenhum especialista é descartado. A curva final sintetiza a visão coletiva do comitê com total equilíbrio.",
                "takeaway_kind": "insight",
            },
            # Passo 7
            {
                "id": 7,
                "title": "Poucas Rodadas (N = 10): O Caos e a Instabilidade do Acaso",
                "phase": "SAMPLE_10",
                "n_samples": 10,
                "can_animate": True,
                "badge": "PASSO 7 DE 13 • O CAOS INICIAL (N=10)",
                "badge_bg": "#eff6ff",
                "badge_fg": "#1d4ed8",
                "bullets": [
                    "▸ Rodando 10 Vezes: O computador sorteia 10 matrizes independentes e calcula 10 pesos agregados do comitê.",
                    "▸ Dispersão no Rug Plot: Os pontos azuis na base caem espalhados e desordenados ao longo de todo o eixo.",
                    "▸ Histograma Caótico: Com apenas 10 dados, as barras são tortas, desiguais e cheias de lacunas vazias.",
                    "▸ Erro Amostral Alto: A média provisória oscila fortemente (SE ≈ ±1.1%). Não é seguro tomar decisões com N = 10.",
                ],
                "takeaway": "[AÇÃO DINÂMICA] Clique em '▶ Acumular Amostras' para assistir aos pontos caindo e a curva se formando ao vivo!",
                "takeaway_kind": "action",
            },
            # Passo 8
            {
                "id": 8,
                "title": "Acumulando Tentativas (N = 100): A Lei dos Grandes Números",
                "phase": "SAMPLE_100",
                "n_samples": 100,
                "can_animate": True,
                "badge": "PASSO 8 DE 13 • LEI DOS GRANDES NÚMEROS (N=100)",
                "badge_bg": "#eff6ff",
                "badge_fg": "#1d4ed8",
                "bullets": [
                    "▸ Rodando 100 Vezes: As oscilações desordenadas começam a se cancelar mutuamente.",
                    f"▸ O Centro Começa a Subir: Como os ápices do comitê são mais prováveis, os pesos perto de {mean_str} acumulam mais dados.",
                    "▸ Redução do Erro: O erro padrão da média cai para SE ≈ ±0.33% (uma redução de mais de 70% em relação a N = 10).",
                    "▸ A Lei dos Grandes Números em Ação: Mais amostras geram estimativas cada vez mais próximas da realidade.",
                ],
                "takeaway": "[AÇÃO DINÂMICA] O padrão simétrico está emergindo! Clique em '▶ Acumular Amostras' para avançar a simulação.",
                "takeaway_kind": "action",
            },
            # Passo 9
            {
                "id": 9,
                "title": "O Teorema Central do Limite (N = 500): A Mágica do Sino de Gauss",
                "phase": "SAMPLE_500",
                "n_samples": 500,
                "can_animate": True,
                "badge": "PASSO 9 DE 13 • TEOREMA CENTRAL DO LIMITE (N=500)",
                "badge_bg": "#f0fdf4",
                "badge_fg": "#15803d",
                "bullets": [
                    "▸ O Sino de Gauss Emerge: O histograma adquire o formato simétrico e suave de uma curva Normal N(μ, σ²).",
                    "▸ Por que ambos os lados aparecem? A média geométrica equivale à média das variáveis no espaço logarítmico.",
                    "  Pelo Teorema Central do Limite, a combinação de variáveis independentes converge para a curva Normal simétrica!",
                    "▸ Precisão Elevada: A curva analítica vermelha N(w̄, s²) encaixa com enorme fidelidade sobre ambos os lados do histograma.",
                ],
                "takeaway": "[REGULARIDADE MATEMÁTICA] O caos dos julgamentos individuais se organiza naturalmente em uma elegante curva em sino.",
                "takeaway_kind": "insight",
            },
            # Passo 10
            {
                "id": 10,
                "title": "Convergência Total (N = 10.000): O Retrato Fiel da Incerteza do Comitê",
                "phase": "SAMPLE_FULL",
                "n_samples": 10000,
                "badge": "PASSO 10 DE 13 • CONVERGÊNCIA COMPLETA (N=10.000)",
                "badge_bg": "#f0fdf4",
                "badge_fg": "#15803d",
                "bullets": [
                    f"▸ Estabilidade Absoluta: Com 10.000 iterações, a média (w̄ = {mean_str}) e o desvio padrão (s = {std_str}) estão congelados.",
                    "▸ Curva Completa: Ambos os lados (da cauda inferior de ~40% até a superior de ~65%) estão perfeitamente visíveis.",
                    "▸ Erro Amostral Praticamente Nulo: SE = s / √10000 = ±0.033% (garante precisão em todas as casas decimais).",
                    "▸ Por que NÃO usar 1.000.000? Aumentar de 10.000 para 1 milhão só consome processamento sem alterar em nada a decisão.",
                ],
                "takeaway": "[MAPA COMPLETO] O Monte Carlo finalizou sua missão: conhecemos a probabilidade de qualquer valor de peso possível!",
                "takeaway_kind": "insight",
            },
            # Passo 11
            {
                "id": 11,
                "title": "O Nível de Cobertura (INPUT): A Decisão de Cortar Caudas (95%)",
                "phase": "COVERAGE_INPUT",
                "n_samples": 10000,
                "badge": "PASSO 11 DE 13 • INPUT DO PESQUISADOR (95%)",
                "badge_bg": "#eff6ff",
                "badge_fg": "#1d4ed8",
                "bullets": [
                    "▸ O que é Nível de Cobertura? Toda distribuição tem chances minúsculas de cenários ultra bizarros nos extremos.",
                    "▸ A Decisão Humana (INPUT): O pesquisador decide previamente reter os 95% centrais mais realistas (γ = 0.95).",
                    "▸ Corte Simétrico das Caudas (5% de descarte total):",
                    "  • Cauda Inferior (área vermelha à esquerda): descarta os 2.5% cenários mais pessimistas (p_inf = 2.5%).",
                    "  • Cauda Superior (área vermelha à direita): descarta os 2.5% cenários mais otimistas (p_sup = 97.5%).",
                ],
                "takeaway": "[INPUT vs OUTPUT] O 95% é uma DECISÃO prévia do analista. Ele NÃO diz quais serão os números dos limites!",
                "takeaway_kind": "insight",
            },
            # Passo 12
            {
                "id": 12,
                "title": "O Intervalo Empírico de Incerteza (OUTPUT): Os Limites Revelados",
                "phase": "UNCERTAINTY_OUTPUT",
                "n_samples": 10000,
                "badge": "PASSO 12 DE 13 • OUTPUT DA SIMULAÇÃO",
                "badge_bg": "#f0fdf4",
                "badge_fg": "#15803d",
                "bullets": [
                    f"▸ Os Limites Revelados pela Simulação (OUTPUTS):",
                    f"  • Limite Inferior: Q₂,₅% = {q_inf_str}  (deixa 2.5% da massa para trás).",
                    f"  • Limite Superior: Q₉₇,₅% = {q_sup_str}  (deixa 2.5% da massa à frente).",
                    f"▸ O Intervalo Empírico Resultante: [{q_inf_str}, {q_sup_str}] com Média = {mean_str}.",
                    "▸ Aplicação Prática: Temos 95% de certeza que, sob a incerteza dos especialistas, a importância do critério está nessa faixa!",
                ],
                "takeaway": "[RESULTADO CONCRETO] O decisor agora tem limites sólidos e confiáveis para o planejamento estratégico do projeto.",
                "takeaway_kind": "insight",
            },
            # Passo 13
            {
                "id": 13,
                "title": "Quadro Consolidado: Entradas vs Saídas do Modelo",
                "phase": "SUMMARY_DEFENSE",
                "n_samples": 10000,
                "badge": "PASSO 13 DE 13 • QUADRO CONSOLIDADO",
                "badge_bg": "#f0fdf4",
                "badge_fg": "#15803d",
                "bullets": [
                    "▸ Entradas do Modelo (Inputs): Os julgamentos paritários (TFNs), o número de iterações (10.000) e a regra de cobertura (95%).",
                    f"▸ Saídas Calculadas (Outputs): A distribuição completa dos pesos, o valor médio ({mean_str}) e o intervalo de incerteza [{q_inf_str}, {q_sup_str}].",
                    "▸ Intervalo de Incerteza vs IC Clássico: Não se trata de uma pesquisa amostral com pessoas na rua, mas da propagação das dúvidas do comitê.",
                    "▸ Tomada de Decisão Prática: Em vez de um palpite único, os gestores dispõem de limites seguros para avaliar cenários favoráveis e desfavoráveis.",
                ],
                "takeaway": "[SÍNTESE PRÁTICA] A simulação de Monte Carlo converte as incertezas dos especialistas em limites numéricos objetivos e acionáveis.",
                "takeaway_kind": "insight",
            },
        ]
        return steps

    def draw_step(self, ax_plot: Axes, ax_calc: Axes, state: StepState) -> None:
        """Renderiza a combinação de gráfico à esquerda e painel explicativo à direita."""
        phase = state.get("phase", "DILEMMA")

        if phase == "DILEMMA":
            self._draw_dilemma(ax_plot, ax_calc)
        elif phase == "TFN":
            self._draw_tfn(ax_plot, ax_calc)
        elif phase == "WHAT_IS_MC":
            self._draw_what_is_mc(ax_plot, ax_calc)
        elif phase == "TRIANG_PDF":
            self._draw_triang_pdf(ax_plot, ax_calc)
        elif phase == "SINGLE_SAMPLE":
            self._draw_single_sample(ax_plot, ax_calc)
        elif phase == "MULTI_EXPERTS":
            self._draw_multi_experts(ax_plot, ax_calc)
        elif phase in {"SAMPLE_10", "SAMPLE_100", "SAMPLE_500"}:
            n = int(state.get("n_samples", 10))
            show_g = (phase == "SAMPLE_500")
            self._draw_sample_distribution(ax_plot, ax_calc, n, show_gaussian=show_g)
        elif phase == "SAMPLE_FULL":
            self._draw_sample_distribution(ax_plot, ax_calc, 10000, show_gaussian=True, show_kde=True)
        elif phase == "COVERAGE_INPUT":
            self._draw_coverage_input(ax_plot, ax_calc)
        elif phase == "UNCERTAINTY_OUTPUT":
            self._draw_uncertainty_output(ax_plot, ax_calc)
        elif phase == "SUMMARY_DEFENSE":
            self._draw_summary_defense(ax_plot, ax_calc)

    # -------------------------------------------------------------------------
    # PASSO 1: O DILEMA (RÍGIDO VS FUZZY)
    # -------------------------------------------------------------------------
    def _draw_dilemma(self, ax: Axes, ax_calc: Axes) -> None:
        configure_stats_axes(
            ax,
            x_limits=(0.5, 5.5),
            y_limits=(-0.2, 2.2),
            x_label="Escala de Julgamento Paritário (Importância Relativa)",
            y_label="Nível Conceitual de Certeza",
            title="Comparação: Julgamento Rígido Convencional vs Realidade Humana",
        )

        ax.scatter([3.0], [1.5], color="#dc2626", s=140, zorder=6, label="AHP Clássico: Valor Fixo (3.0)")
        ax.plot([1.0, 5.0], [1.5, 1.5], color="#cbd5e1", linestyle="--", linewidth=1.0)
        ax.annotate(
            "AHP Convencional:\n'Exatamente 3.0 vezes mais importante'\n(Falsa Certeza Absoluta - Incerteza = 0%)",
            xy=(3.0, 1.5),
            xytext=(3.0, 1.78),
            ha="center",
            fontsize=9.0,
            fontweight="bold",
            color="#991b1b",
            bbox=dict(boxstyle="round,pad=0.35", facecolor="#fef2f2", edgecolor="#f87171"),
        )

        ax.plot([2.0, 3.0, 4.0], [0.1, 0.7, 0.1], color="#2563eb", linewidth=2.5, label="Fuzzy-AHP: Faixa Elástica (2, 3, 4)")
        ax.fill_between([2.0, 3.0, 4.0], [0.1, 0.1, 0.1], [0.1, 0.7, 0.1], color="#93c5fd", alpha=0.45)
        ax.scatter([3.0], [0.7], color="#1d4ed8", s=80, zorder=5)

        ax.annotate(
            "Fuzzy-AHP Realista:\n'Por volta de 3.0, variando entre 2.0 e 4.0'\n(Acolhe a dúvida cognitiva do especialista)",
            xy=(3.0, 0.7),
            xytext=(3.0, 0.95),
            ha="center",
            fontsize=9.0,
            fontweight="bold",
            color="#1e40af",
            bbox=dict(boxstyle="round,pad=0.35", facecolor="#eff6ff", edgecolor="#93c5fd"),
        )

        add_unique_legend(ax, location="upper right")

        configure_card_axes(ax_calc)
        ax_calc.text(0.04, 0.93, "1. O Desafio da Decisão em Engenharia", fontsize=10.5, fontweight="bold", color="#1e293b")

        ax_calc.text(0.04, 0.83, "Por que números fixos falham na prática?", fontsize=9.2, fontweight="bold", color="#334155")
        ax_calc.text(0.04, 0.75, "• Em cavernas de sal e armazenamento de CO2,\n  os critérios envolvem geologia, riscos e custos.", fontsize=8.8, color="#475569")
        ax_calc.text(0.04, 0.65, "• Dizer 'geologia é 3 vezes mais importante'\n  ignora que um especialista pensa 2.5 e outro 3.5.", fontsize=8.8, color="#475569")

        ax_calc.text(0.04, 0.52, "A Abordagem dos Conjuntos Fuzzy (Zadeh):", fontsize=9.2, fontweight="bold", color="#1e3a8a")
        ax_calc.text(0.04, 0.44, "• Em vez de escolher 'Preto ou Branco',\n  o modelo permite 'Tons de Cinza'.", fontsize=8.8, color="#0f172a")
        ax_calc.text(0.04, 0.36, "• Permite traduzir palavras humanas como\n  'moderadamente mais importante' em números.", fontsize=8.8, color="#0f172a")

        takeaway_box = (
            "CONCLUSÃO DO PASSO 1:\n"
            "O Fuzzy-AHP não joga a incerteza para debaixo do tapete.\n"
            "Ele transforma a dúvida humana em uma estrutura geométrica\n"
            "que o computador consegue calcular."
        )
        ax_calc.text(0.04, 0.12, takeaway_box, fontsize=8.4, color="#166534",
                     bbox=dict(boxstyle="round,pad=0.35", facecolor="#f0fdf4", edgecolor="#86efac"))

    # -------------------------------------------------------------------------
    # PASSO 2: O TFN (Número Fuzzy Triangular)
    # -------------------------------------------------------------------------
    def _draw_tfn(self, ax: Axes, ax_calc: Axes) -> None:
        configure_stats_axes(
            ax,
            x_limits=(1.0, 5.0),
            y_limits=(-0.05, 1.25),
            x_label="Valor de Julgamento Paritário x",
            y_label="Grau de Pertinência μ(x)",
            title="Número Fuzzy Triangular (TFN): (2, 3, 4)",
        )

        x_vals = np.array([1.2, 2.0, 3.0, 4.0, 4.8])
        y_vals = np.array([0.0, 0.0, 1.0, 0.0, 0.0])
        ax.plot(x_vals, y_vals, color="#2563eb", linewidth=2.8, label="Pertinência μ_A(x)")
        ax.fill_between([2.0, 3.0, 4.0], [0.0, 1.0, 0.0], color="#93c5fd", alpha=0.35, label="Região Fuzzy A")

        ax.scatter([2.0, 3.0, 4.0], [0.0, 1.0, 0.0], color="#1d4ed8", s=65, zorder=5)
        ax.axvline(3.0, color="#64748b", linestyle=":", linewidth=1.2)
        ax.axhline(1.0, color="#64748b", linestyle=":", linewidth=1.2)

        ax.annotate("l = 2.0\n(Mínimo: μ = 0)", xy=(2.0, 0.0), xytext=(2.0, 0.22),
                    arrowprops=dict(arrowstyle="->", color="#1d4ed8"), ha="center", fontsize=8.8, fontweight="bold")
        ax.annotate("m = 3.0\n(Ápice / Moda: μ = 1.0)", xy=(3.0, 1.0), xytext=(3.0, 1.12),
                    arrowprops=dict(arrowstyle="->", color="#1d4ed8"), ha="center", fontsize=8.8, fontweight="bold")
        ax.annotate("u = 4.0\n(Máximo: μ = 0)", xy=(4.0, 0.0), xytext=(4.0, 0.22),
                    arrowprops=dict(arrowstyle="->", color="#1d4ed8"), ha="center", fontsize=8.8, fontweight="bold")

        add_unique_legend(ax, location="upper right")

        configure_card_axes(ax_calc)
        ax_calc.text(0.04, 0.93, "2. A Anatomia do Triângulo Fuzzy", fontsize=10.5, fontweight="bold", color="#1e293b")
        ax_calc.text(0.04, 0.85, r"$\tilde{a}_{ij} = (l, m, u) = (2.0, \, 3.0, \, 4.0)$", fontsize=11, color="#2563eb")

        ax_calc.text(0.04, 0.74, "O que significa o grau de pertinência μ(x)?", fontsize=9.2, fontweight="bold", color="#334155")
        ax_calc.text(0.04, 0.67, "• μ = 1.0 (Ápice): Plena certeza do especialista.", fontsize=8.8, color="#0f172a")
        ax_calc.text(0.04, 0.61, "• μ = 0.5: Meio caminho entre a dúvida e a certeza.", fontsize=8.8, color="#475569")
        ax_calc.text(0.04, 0.55, "• μ = 0.0: O especialista descarta que seja menor que 2 ou maior que 4.", fontsize=8.8, color="#475569")

        ax_calc.text(0.04, 0.43, "A Fórmula da Rampa Triangular:", fontsize=9.2, fontweight="bold", color="#334155")
        ax_calc.text(0.06, 0.36, r"$\mu(x) = \frac{x - 2}{3 - 2} = x - 2 \quad (2.0 \leq x \leq 3.0)$", fontsize=9.0, color="#0f172a")
        ax_calc.text(0.06, 0.29, r"$\mu(x) = \frac{4 - x}{4 - 3} = 4 - x \quad (3.0 < x \leq 4.0)$", fontsize=9.0, color="#0f172a")

        mat_text = "Matriz Paritária do Especialista:\nCritério 1 vs Critério 2: (2, 3, 4)\nCritério 2 vs Critério 1: (1/4, 1/3, 1/2) [Recíproco]"
        ax_calc.text(0.04, 0.12, mat_text, fontsize=8.4, fontfamily="monospace", color="#1e293b",
                     bbox=dict(boxstyle="square,pad=0.35", facecolor="#f8fafc", edgecolor="#cbd5e1"))

    # -------------------------------------------------------------------------
    # PASSO 3: O QUE É MONTE CARLO? (A ROLETA DOS DADOS)
    # -------------------------------------------------------------------------
    def _draw_what_is_mc(self, ax: Axes, ax_calc: Axes) -> None:
        configure_stats_axes(
            ax,
            x_limits=(1.0, 5.0),
            y_limits=(-0.1, 1.35),
            x_label="Valor de Julgamento Sorteado x",
            y_label="Densidade de Sorteio",
            title="A Analogia de Monte Carlo: 'Dardos' Caindo no Triângulo",
        )

        ax.plot([2.0, 3.0, 4.0], [0.0, 1.0, 0.0], color="#059669", linewidth=2.5, label="Alvo Triangular f(x)")
        ax.fill_between([2.0, 3.0, 4.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], color="#a7f3d0", alpha=0.3)

        sample_pts = stats.triang.rvs(0.5, loc=2.0, scale=2.0, size=45, random_state=123)
        y_jitter = RNG.uniform(0.04, 0.35, size=len(sample_pts))
        ax.scatter(sample_pts, y_jitter, color="#047857", s=28, alpha=0.75, zorder=6, label="Sorteios de Monte Carlo (Dardos)")

        ax.axvline(3.0, color="#047857", linestyle="--", linewidth=1.2)
        ax.text(3.0, 1.15, "Mais dados caem aqui!\n(Maior probabilidade perto de 3.0)",
                ha="center", fontsize=9.0, fontweight="bold", color="#065f46",
                bbox=dict(boxstyle="round,pad=0.3", facecolor="#ffffff", edgecolor="#059669"))

        ax.text(1.5, 0.2, "Quase nenhum\ndado cai aqui", ha="center", fontsize=8.5, color="#64748b")
        ax.text(4.5, 0.2, "Quase nenhum\ndado cai aqui", ha="center", fontsize=8.5, color="#64748b")

        add_unique_legend(ax, location="upper right")

        configure_card_axes(ax_calc)
        ax_calc.text(0.04, 0.93, "3. Como Funciona o Motor de Monte Carlo?", fontsize=10.5, fontweight="bold", color="#1e293b")

        ax_calc.text(0.04, 0.83, "A Máquina de Gerar Números Aleatórios:", fontsize=9.2, fontweight="bold", color="#334155")
        ax_calc.text(0.04, 0.75, "1. O computador gera um número uniforme U de 0 a 1\n   (como rodar uma roleta perfeitamente justa).", fontsize=8.8, color="#0f172a")
        ax_calc.text(0.04, 0.65, "2. Esse número U é transformado pela função matemática\n   do triângulo (Função Quantil Inversa F⁻¹(U)).", fontsize=8.8, color="#0f172a")
        ax_calc.text(0.04, 0.55, "3. Resultado: o computador joga milhares de dados\n   respeitando a geometria de preferência do especialista.", fontsize=8.8, color="#0f172a")

        py_box = (
            "Comando Python Equivalente:\n"
            "import scipy.stats as stats\n"
            "sorteio = stats.triang.rvs(c=0.5, loc=2.0, scale=2.0)"
        )
        ax_calc.text(0.04, 0.32, py_box, fontsize=8.5, fontfamily="monospace", color="#1e293b",
                     bbox=dict(boxstyle="square,pad=0.35", facecolor="#f1f5f9", edgecolor="#cbd5e1"))

        ax_calc.text(0.04, 0.12, "Cada sorteio representa uma hipótese plausível.\nMas como combinar isso em pesos normalizados?\nVeja no próximo passo!",
                     fontsize=8.5, color="#475569", style="italic")

    # -------------------------------------------------------------------------
    # PASSO 4: A HIPÓTESE METODOLÓGICA (DE FUZZY PARA PROBABILIDADE)
    # -------------------------------------------------------------------------
    def _draw_triang_pdf(self, ax: Axes, ax_calc: Axes) -> None:
        configure_stats_axes(
            ax,
            x_limits=(1.0, 5.0),
            y_limits=(-0.05, 1.35),
            x_label="Valor Amostrado x",
            y_label="Densidade de Probabilidade f(x)",
            title="Hipótese Metodológica: TFN interpretado como f(x) Triangular",
        )

        h = 2.0 / (self.u - self.l)
        x_pts = np.linspace(1.2, 4.8, 400)
        c = (self.m - self.l) / (self.u - self.l)
        pdf_pts = stats.triang.pdf(x_pts, c, loc=self.l, scale=self.u - self.l)

        ax.plot(x_pts, pdf_pts, color="#059669", linewidth=2.8, label="Densidade f(x) contínua")
        ax.fill_between(x_pts, pdf_pts, color="#a7f3d0", alpha=0.45, label="Área Total = 1.0 (Probabilidade 100%)")

        ax.scatter([self.m], [h], color="#047857", s=75, zorder=5)
        ax.axvline(self.m, color="#047857", linestyle="--", linewidth=1.2)

        ax.text(3.0, 0.45, r"$\int_{-\infty}^{\infty} f(x) \, dx = 1.00$", fontsize=12, fontweight="bold",
                color="#065f46", ha="center", bbox=dict(boxstyle="round", facecolor="#ffffff", edgecolor="#059669", alpha=0.9))

        ax.annotate(f"Pico de Densidade:\nh = 2 / (u - l) = {h:.2f}", xy=(self.m, h), xytext=(self.m + 0.35, h + 0.15),
                    arrowprops=dict(arrowstyle="->", color="#047857"), fontsize=8.8, fontweight="bold")

        add_unique_legend(ax, location="upper right")

        configure_card_axes(ax_calc)
        ax_calc.text(0.04, 0.93, "4. A Ponte Metodológica: Fuzzy para Probabilidade", fontsize=10, fontweight="bold", color="#dc2626")

        warning_box = (
            "HIPÓTESE METODOLÓGICA ASSUMIDA:\n"
            "Números fuzzy triangulares definem pertinência subjetiva.\n"
            "Aqui são assumidos adicionalmente como densidades de\n"
            "probabilidade contínuas para permitir Monte Carlo."
        )
        ax_calc.text(0.04, 0.77, warning_box, fontsize=8.4, color="#991b1b",
                     bbox=dict(boxstyle="round,pad=0.4", facecolor="#fee2e2", edgecolor="#ef4444"))

        ax_calc.text(0.04, 0.64, "Equação da Densidade Contínua f(x):", fontsize=9.2, fontweight="bold", color="#334155")
        ax_calc.text(0.06, 0.57, r"$f(x) = \frac{2(x - l)}{(u - l)(m - l)} = x - 2 \quad (2.0 \leq x < 3.0)$", fontsize=9.0, color="#0f172a")
        ax_calc.text(0.06, 0.50, r"$f(x) = \frac{2(u - x)}{(u - l)(u - m)} = 4 - x \quad (3.0 \leq x \leq 4.0)$", fontsize=9.0, color="#0f172a")

        ax_calc.text(0.04, 0.40, "Parâmetros do Gerador Estocástico:", fontsize=9.2, fontweight="bold", color="#334155")
        ax_calc.text(0.04, 0.33, r"• $loc = l = 2.0, \quad scale = u - l = 2.0$", fontsize=8.8, color="#475569")
        ax_calc.text(0.04, 0.27, r"• Ponto modal relativo: $c = (m - l)/(u - l) = 0.5$", fontsize=8.8, color="#475569")
        ax_calc.text(0.04, 0.21, r"• Altura máxima no pico: $h = \frac{2}{4.0 - 2.0} = 1.00$", fontsize=8.8, color="#047857")

        ax_calc.text(0.04, 0.10, "Essa formalização estabelece a ligação conceitual entre\na incerteza dos julgamentos e o algoritmo de Monte Carlo.",
                     fontsize=8.4, color="#1e3a8a", style="italic")

    # -------------------------------------------------------------------------
    # PASSO 5: UMA RODADA ISOLADA (k = 1)
    # -------------------------------------------------------------------------
    def _draw_single_sample(self, ax: Axes, ax_calc: Axes) -> None:
        configure_stats_axes(
            ax,
            x_limits=X_LIMITS_PESOS,
            y_limits=(-0.02, 0.16),
            x_label="Peso Normalizado do Critério 1: W1 (%)",
            y_label="Densidade de Ocorrência",
            title="Uma Única Iteração de Monte Carlo (k = 1)",
        )

        single_w = float(self.weights_c1[0])  # ~ 50.24%
        ax.scatter([single_w], [0.0], color="#dc2626", s=130, zorder=6, label=f"Amostra k=1 (W1 = {single_w:.2f}%)")
        ax.axvline(single_w, color="#dc2626", linestyle="--", linewidth=1.8)

        ax.annotate(
            f"Iteração k=1:\nW1 = {single_w:.2f}%\n(Cenário isolado)",
            xy=(single_w, 0.0),
            xytext=(single_w - 9.0, 0.08),
            arrowprops=dict(arrowstyle="->", color="#dc2626", linewidth=1.5),
            fontsize=9.2,
            fontweight="bold",
            color="#991b1b",
            bbox=dict(boxstyle="round,pad=0.4", facecolor="#fef2f2", edgecolor="#f87171"),
        )

        ax.text(54.0, 0.13, "Uma única iteração não possui significado estatístico!\nPrecisamos de milhares de realizações.",
                ha="center", fontsize=9.0, color="#475569", style="italic")

        add_unique_legend(ax, location="upper right")

        configure_card_axes(ax_calc)
        ax_calc.text(0.04, 0.93, "5. Da Matriz Sorteada ao Peso do Critério", fontsize=10.5, fontweight="bold", color="#1e293b")

        a12 = float(self.samples_12[0])
        a13 = float(self.samples_13[0])
        a23 = float(self.samples_23[0])
        ax_calc.text(0.04, 0.86, f"Sorteios: a12 = {a12:.2f}, a13 = {a13:.2f}, a23 = {a23:.2f}", fontsize=8.8, color="#2563eb", fontweight="bold")

        ax_calc.text(0.04, 0.76, "Média Geométrica das Linhas (Buckley):", fontsize=9.2, fontweight="bold", color="#334155")
        ax_calc.text(0.06, 0.69, r"$\tilde{r}_i = \left( \prod_{j=1}^n a_{ij} \right)^{1/n} = \exp\left( \frac{1}{n} \sum \ln a_{ij} \right)$",
                     fontsize=9.0, color="#0f172a")

        r1_val = float(self.r1[0])
        r2_val = float(self.r2[0])
        r3_val = float(self.r3[0])
        sum_r_val = float(self.sum_r[0])

        ax_calc.text(0.04, 0.58, "Cálculo dos Raios Geométricos (k = 1):", fontsize=9.0, fontweight="bold", color="#334155")
        ax_calc.text(0.04, 0.51, f"• r1 = (1.0 × {a12:.2f} × {a13:.2f})^0.333 = {r1_val:.3f}", fontsize=8.5, color="#475569")
        ax_calc.text(0.04, 0.45, f"• r2 = (1/{a12:.2f} × 1.0 × {a23:.2f})^0.333 = {r2_val:.3f}", fontsize=8.5, color="#475569")
        ax_calc.text(0.04, 0.39, f"• r3 = (1/{a13:.2f} × 1/{a23:.2f} × 1.0)^0.333 = {r3_val:.3f}", fontsize=8.5, color="#475569")
        ax_calc.text(0.04, 0.32, f"• Soma: ∑ rk = {r1_val:.3f} + {r2_val:.3f} + {r3_val:.3f} = {sum_r_val:.3f}", fontsize=8.5, color="#0f172a", fontweight="bold")

        ax_calc.text(0.04, 0.22, "Normalização do Vetor de Pesos:", fontsize=9.2, fontweight="bold", color="#334155")
        ax_calc.text(0.06, 0.15, r"$W_i = \frac{r_i}{\sum_{k=1}^n r_k}$", fontsize=10.5, color="#059669")
        ax_calc.text(0.04, 0.07, f"Peso C1: W1 = {r1_val:.3f} / {sum_r_val:.3f} = {single_w:.2f}%", fontsize=9.5, fontweight="bold", color="#059669")

    # -------------------------------------------------------------------------
    # PASSO 6: MÚLTIPLOS ESPECIALISTAS E AGREGAÇÃO AIP
    # -------------------------------------------------------------------------
    def _draw_multi_experts(self, ax: Axes, ax_calc: Axes) -> None:
        configure_stats_axes(
            ax,
            x_limits=X_LIMITS_PESOS,
            y_limits=(-0.015, 0.165),
            x_label="Peso Normalizado W1 (%)",
            y_label="Densidade de Probabilidade",
            title="Múltiplos Especialistas: Da Opinião Individual ao Consenso do Comitê",
        )

        x_grid = np.linspace(X_LIMITS_PESOS[0], X_LIMITS_PESOS[1], 400)
        pdf_e1 = stats.norm.pdf(x_grid, loc=self.mean_e1, scale=self.std_e1)
        pdf_e2 = stats.norm.pdf(x_grid, loc=self.mean_e2, scale=self.std_e2)
        pdf_e3 = stats.norm.pdf(x_grid, loc=self.mean_e3, scale=self.std_e3)
        pdf_global = stats.norm.pdf(x_grid, loc=self.global_mean, scale=self.global_std)

        # Três especialistas individuais
        ax.plot(x_grid, pdf_e1, color="#ea580c", linestyle="--", linewidth=1.8, label=f"Especialista 1 (w̄ = {self.mean_e1:.1f}%)")
        ax.plot(x_grid, pdf_e2, color="#0284c7", linestyle="--", linewidth=1.8, label=f"Especialista 2 (w̄ = {self.mean_e2:.1f}%)")
        ax.plot(x_grid, pdf_e3, color="#7c3aed", linestyle="--", linewidth=1.8, label=f"Especialista 3 (w̄ = {self.mean_e3:.1f}%)")

        # Curva de Consenso Agregada (AIP)
        ax.plot(x_grid, pdf_global, color="#1e3a8a", linewidth=2.8, label=f"Consenso AIP do Comitê (w̄ = {self.global_mean:.1f}%)")
        ax.fill_between(x_grid, pdf_global, color="#93c5fd", alpha=0.35, label="Distribuição Global Agregada")

        ax.axvline(self.global_mean, color="#1e3a8a", linestyle="-", linewidth=1.8)

        add_unique_legend(ax, location="upper right")

        # PAINEL DIDÁTICO
        configure_card_axes(ax_calc)
        ax_calc.text(0.04, 0.93, "6. Agregação de Múltiplos Especialistas (AIP)", fontsize=10.2, fontweight="bold", color="#1e293b")

        ax_calc.text(0.04, 0.84, "Duas Fontes Distintas de Incerteza:", fontsize=9.0, fontweight="bold", color="#334155")
        ax_calc.text(0.04, 0.76, "1. Incerteza Intra-Especialista (Dúvida Pessoal):\n   O próprio especialista responde com um TFN (l, m, u).", fontsize=8.5, color="#0f172a")
        ax_calc.text(0.04, 0.65, "2. Variabilidade Inter-Especialistas (Divergência):\n   A diferença natural de opinião e formação entre profissionais.", fontsize=8.5, color="#0f172a")

        ax_calc.text(0.04, 0.52, "Como a Simulação Combina as Respostas? (AIP)", fontsize=9.0, fontweight="bold", color="#1e3a8a")
        ax_calc.text(0.04, 0.45, "• Em cada iteração k, cada especialista gera seu peso w_e.\n• O consenso da rodada k é a média direta do comitê:", fontsize=8.5, color="#334155")
        ax_calc.text(0.06, 0.36, r"$W_{\mathrm{global}}^{(k)} = \frac{1}{E}\sum_{e=1}^E w_{e}^{(k)}$", fontsize=10.0, color="#1e3a8a")

        ax_calc.text(0.04, 0.25, "Exemplo Numérico da Iteração k = 1:", fontsize=8.8, fontweight="bold", color="#334155")
        ax_calc.text(0.04, 0.18, f"• Esp. 1: 48.2% | Esp. 2: 58.1% | Esp. 3: 54.3%\n• Consenso k=1: (48.2 + 58.1 + 54.3)/3 = 53.5%", fontsize=8.4, color="#475569")

        ax_calc.text(0.04, 0.08, "Efeito: A curva azul final equilibra as opiniões,\nfiltrando extremos e refletindo a visão do grupo.", fontsize=8.2, color="#166534", style="italic")

    # -------------------------------------------------------------------------
    # PASSOS 7, 8, 9, 10: ACÚMULO E CONVERGÊNCIA DO COMITÊ
    # -------------------------------------------------------------------------
    def _draw_sample_distribution(
        self,
        ax: Axes,
        ax_calc: Axes,
        n_samples: int,
        *,
        show_gaussian: bool = False,
        show_kde: bool = False,
    ) -> None:
        configure_stats_axes(
            ax,
            x_limits=X_LIMITS_PESOS,
            y_limits=(-0.015, 0.155),
            x_label="Peso Normalizado W1 (%)",
            y_label="Densidade Empírica",
            title=f"Distribuição Acumulada: N = {n_samples:,} Iterações",
        )

        subset = self.weights_c1[:n_samples]
        media = float(np.mean(subset))
        std = float(np.std(subset))
        bins = min(50, max(8, int(np.sqrt(n_samples) * 1.5)))

        counts, edges, patches = ax.hist(
            subset,
            bins=bins,
            range=(40.0, 66.0) if n_samples >= 100 else None,
            density=True,
            color="#93c5fd",
            edgecolor="#1d4ed8",
            alpha=0.65,
            label=f"Amostras Simuladas (N={n_samples})",
        )

        rug_y = np.full_like(subset[:min(n_samples, 250)], -0.006) + RNG.uniform(-0.002, 0.002, size=min(n_samples, 250))
        ax.scatter(subset[:min(n_samples, 250)], rug_y, color="#1e40af", s=14, alpha=0.5, label="Pontos simulados (rug)")

        x_grid = np.linspace(X_LIMITS_PESOS[0], X_LIMITS_PESOS[1], 400)
        if show_gaussian and std > 0:
            gauss_pdf = stats.norm.pdf(x_grid, loc=media, scale=std)
            ax.plot(x_grid, gauss_pdf, color="#dc2626", linewidth=2.5, label=f"Ajuste Normal N({media:.1f}%, {std:.1f}%)")

        if show_kde and n_samples >= 1000:
            kde = stats.gaussian_kde(subset)
            ax.plot(x_grid, kde(x_grid), color="#059669", linestyle="--", linewidth=2.0, label="Densidade Kernel (KDE)")

        ax.axvline(media, color="#0f172a", linestyle="-", linewidth=1.8, label=f"Média = {media:.2f}%")

        add_unique_legend(ax, location="upper right")

        # PAINEL DIDÁTICO
        configure_card_axes(ax_calc)
        step_title = (
            f"7. O Caos Inicial (N = {n_samples:,})" if n_samples <= 15 else
            (f"8. A Lei dos Grandes Números (N = {n_samples:,})" if n_samples <= 150 else
             (f"9. O Teorema Central do Limite (N = {n_samples:,})" if n_samples <= 800 else
              f"10. Estabilização Total (N = {n_samples:,})"))
        )
        ax_calc.text(0.04, 0.93, step_title, fontsize=10.5, fontweight="bold", color="#1e293b")

        ax_calc.text(0.04, 0.84, "Estimadores Amostrais de Monte Carlo:", fontsize=9.2, fontweight="bold", color="#334155")
        ax_calc.text(0.06, 0.77, r"• Média: $\bar{W} = \frac{1}{N}\sum_{k=1}^N W^{(k)}$", fontsize=9.0, color="#0f172a")
        ax_calc.text(0.06, 0.70, r"• Desvio Padrão: $s = \sqrt{\frac{1}{N-1}\sum (W^{(k)} - \bar{W})^2}$", fontsize=9.0, color="#0f172a")
        ax_calc.text(0.06, 0.63, r"• Erro Padrão da Média: $\mathrm{SE} = \frac{s}{\sqrt{N}}$", fontsize=9.0, color="#0f172a")

        se_val = std / np.sqrt(n_samples) if n_samples > 0 else 0.0
        ax_calc.text(0.04, 0.52, "Valores Numéricos Computados:", fontsize=9.2, fontweight="bold", color="#334155")
        ax_calc.text(0.04, 0.44, f"• Média Amostral (w̄): {media:.2f}%", fontsize=9, color="#0f172a", fontweight="bold")
        ax_calc.text(0.04, 0.38, f"• Desvio Padrão (s): {std:.2f}%", fontsize=9, color="#475569")
        ax_calc.text(0.04, 0.32, f"• Erro Padrão (SE): ±{se_val:.3f}%", fontsize=9, color="#dc2626")

        if show_gaussian:
            tcl_box = (
                "POR QUE FORMA UM SINO SIMÉTRICO (GAUSSIANA)?\n"
                "A média geométrica multiplica variáveis incertas.\n"
                "No espaço logarítmico, multiplicações viram somas:\n"
                "ln(r) = (1/n) * sum(ln a_ij).\n"
                "Pelo Teorema Central do Limite, somas de variáveis\n"
                "aleatórias convergem SEMPRE para a curva Normal!"
            )
            ax_calc.text(0.04, 0.12, tcl_box, fontsize=8.2, color="#1e3a8a",
                         bbox=dict(boxstyle="round,pad=0.35", facecolor="#eff6ff", edgecolor="#93c5fd"))
        else:
            instab_box = (
                "INSTABILIDADE DA PEQUENA AMOSTRA:\n"
                f"Com apenas N = {n_samples}, o erro padrão (SE = ±{se_val:.2f}%)\n"
                "é expressivo. Se rodarmos outra semente aleatória,\n"
                "a média sofrerá desvios perceptíveis."
            )
            ax_calc.text(0.04, 0.12, instab_box, fontsize=8.2, color="#9a3412",
                         bbox=dict(boxstyle="round,pad=0.35", facecolor="#fff7ed", edgecolor="#fdba74"))

    # -------------------------------------------------------------------------
    # PASSO 11: O NÍVEL DE COBERTURA (INPUT)
    # -------------------------------------------------------------------------
    def _draw_coverage_input(self, ax: Axes, ax_calc: Axes) -> None:
        configure_stats_axes(
            ax,
            x_limits=X_LIMITS_PESOS,
            y_limits=(-0.015, 0.155),
            x_label="Peso Normalizado W1 (%)",
            y_label="Densidade de Probabilidade f(W)",
            title="INPUT Metodológico: Nível de Cobertura (95%) e Corte das Caudas",
        )

        x_grid = np.linspace(X_LIMITS_PESOS[0], X_LIMITS_PESOS[1], 500)
        gauss_pdf = stats.norm.pdf(x_grid, loc=self.global_mean, scale=self.global_std)
        ax.plot(x_grid, gauss_pdf, color="#1e293b", linewidth=2.2, label="Densidade Normal Ajustada")

        q_inf = self.global_q_inf
        q_sup = self.global_q_sup

        mask_inf = x_grid <= q_inf
        ax.fill_between(x_grid[mask_inf], gauss_pdf[mask_inf], color="#fca5a5", alpha=0.75, label="Cauda Inf. (2.5%)")

        mask_mid = (x_grid >= q_inf) & (x_grid <= q_sup)
        ax.fill_between(x_grid[mask_mid], gauss_pdf[mask_mid], color="#93c5fd", alpha=0.6, label="Massa de Cobertura (95%)")

        mask_sup = x_grid >= q_sup
        ax.fill_between(x_grid[mask_sup], gauss_pdf[mask_sup], color="#fca5a5", alpha=0.75, label="Cauda Sup. (2.5%)")

        ax.axvline(q_inf, color="#dc2626", linestyle="--", linewidth=1.8)
        ax.axvline(q_sup, color="#dc2626", linestyle="--", linewidth=1.8)

        ax.text(42.5, 0.025, "Cauda Inf.\n2.5%", color="#991b1b", fontweight="bold", ha="center", fontsize=8.8)
        ax.text(self.global_mean, 0.050, f"Área Central Coberta:\n{self.nivel_cobertura*100:.0f}% dos pesos",
                color="#1e40af", fontweight="bold", ha="center", fontsize=10.0,
                bbox=dict(boxstyle="round", facecolor="#ffffff", edgecolor="#3b82f6"))
        ax.text(64.5, 0.025, "Cauda Sup.\n2.5%", color="#991b1b", fontweight="bold", ha="center", fontsize=8.8)

        add_unique_legend(ax, location="upper right")

        configure_card_axes(ax_calc)
        ax_calc.text(0.04, 0.93, "11. O Nível de Cobertura como INPUT", fontsize=10.5, fontweight="bold", color="#1e293b")

        input_box = (
            "REGRA DE COBERTURA (INPUT DO PESQUISADOR):\n"
            "O pesquisador decide antecipadamente:\n"
            "'Desejo reter os 95% centrais da distribuição simulada.'\n"
            "Isso NÃO diz quais números serão os limites!\n"
            "Apenas comanda o descarte simétrico de 2.5% em cada lado."
        )
        ax_calc.text(0.04, 0.76, input_box, fontsize=8.4, color="#1e3a8a",
                     bbox=dict(boxstyle="round,pad=0.35", facecolor="#dbeafe", edgecolor="#60a5fa"))

        ax_calc.text(0.04, 0.58, "Cálculo das Probabilidades das Caudas:", fontsize=9.2, fontweight="bold", color="#334155")
        ax_calc.text(0.04, 0.50, r"• Nível de Cobertura: $\gamma = 0.95 \rightarrow$ 95.0%", fontsize=9, color="#0f172a")
        ax_calc.text(0.04, 0.44, r"• Nível de Significância: $\alpha = 1.0 - \gamma = 0.05 \rightarrow$ 5.0%", fontsize=9, color="#475569")
        ax_calc.text(0.04, 0.38, r"• Cauda Inferior: $p_{inf} = (\alpha / 2) \times 100 =$ 2.5%", fontsize=9, color="#dc2626")
        ax_calc.text(0.04, 0.32, r"• Cauda Superior: $p_{sup} = (1 - \alpha / 2) \times 100 =$ 97.5%", fontsize=9, color="#dc2626")

        analog_box = (
            "Analogia simples:\n"
            "É como pedir ao computador: 'Gere a curva inteira e\n"
            "mostre-me a fatia de 95% do meio'.\n"
            "O computador precisa do input 95%, mas os valores\n"
            "dos limites só serão descobertos após a simulação."
        )
        ax_calc.text(0.04, 0.12, analog_box, fontsize=8.4, color="#475569", style="italic",
                     bbox=dict(boxstyle="round,pad=0.35", facecolor="#f8fafc", edgecolor="#cbd5e1"))

    # -------------------------------------------------------------------------
    # PASSO 12: O INTERVALO EMPÍRICO DE INCERTEZA (OUTPUT)
    # -------------------------------------------------------------------------
    def _draw_uncertainty_output(self, ax: Axes, ax_calc: Axes) -> None:
        configure_stats_axes(
            ax,
            x_limits=X_LIMITS_PESOS,
            y_limits=(-0.015, 0.155),
            x_label="Peso Normalizado W1 (%)",
            y_label="Densidade de Probabilidade",
            title="OUTPUT da Simulação: Intervalo Empírico de Incerteza (95%)",
        )

        subset = self.weights_c1
        counts, edges, patches = ax.hist(subset, bins=50, range=(40.0, 66.0), density=True, color="#cbd5e1", edgecolor="#94a3b8", alpha=0.5)

        q_inf = self.global_q_inf
        q_sup = self.global_q_sup
        media = self.global_mean
        mediana = self.global_median

        x_grid = np.linspace(X_LIMITS_PESOS[0], X_LIMITS_PESOS[1], 500)
        gauss_pdf = stats.norm.pdf(x_grid, loc=media, scale=self.global_std)
        ax.plot(x_grid, gauss_pdf, color="#0f172a", linewidth=2.0, label="Densidade Normal")

        mask_mid = (x_grid >= q_inf) & (x_grid <= q_sup)
        ax.fill_between(x_grid[mask_mid], gauss_pdf[mask_mid], color="#10b981", alpha=0.35, label="Intervalo Empírico (95%)")

        ax.axvline(q_inf, color="#dc2626", linestyle="--", linewidth=2.2, label=f"Q_2.5% = {q_inf:.2f}%")
        ax.axvline(q_sup, color="#dc2626", linestyle="--", linewidth=2.2, label=f"Q_97.5% = {q_sup:.2f}%")
        ax.axvline(media, color="#1e40af", linestyle="-", linewidth=2.0, label=f"Média = {media:.2f}%")
        ax.axvline(mediana, color="#d97706", linestyle=":", linewidth=2.0, label=f"Mediana = {mediana:.2f}%")

        ax.annotate(f"Limite Inf. (Q_2.5%)\n{q_inf:.2f}%", xy=(q_inf, 0.05), xytext=(q_inf - 7.2, 0.09),
                    arrowprops=dict(arrowstyle="->", color="#dc2626", linewidth=1.5),
                    fontweight="bold", color="#dc2626", fontsize=8.8)

        ax.annotate(f"Limite Sup. (Q_97.5%)\n{q_sup:.2f}%", xy=(q_sup, 0.05), xytext=(q_sup + 1.2, 0.09),
                    arrowprops=dict(arrowstyle="->", color="#dc2626", linewidth=1.5),
                    fontweight="bold", color="#dc2626", fontsize=8.8)

        ax.annotate(f"Intervalo Empírico de 95%:\n[{q_inf:.2f}%, {q_sup:.2f}%]",
                    xy=(media, 0.12), xytext=(media, 0.130), ha="center",
                    fontweight="bold", color="#065f46", fontsize=10.0,
                    bbox=dict(boxstyle="round,pad=0.4", facecolor="#d1fae5", edgecolor="#10b981"))

        add_unique_legend(ax, location="upper right")

        configure_card_axes(ax_calc)
        ax_calc.text(0.04, 0.93, "12. Os Limites de Decisão Revelados", fontsize=10.5, fontweight="bold", color="#1e293b")

        ax_calc.text(0.04, 0.83, "O que o computador calculou?", fontsize=9.2, fontweight="bold", color="#334155")
        ax_calc.text(0.04, 0.75, f"• Percentil Inferior: Q_2.5% = {q_inf:.2f}%", fontsize=9, color="#dc2626", fontweight="bold")
        ax_calc.text(0.04, 0.69, f"• Ponto Médio (Consenso): Média = {media:.2f}%", fontsize=9, color="#1e40af", fontweight="bold")
        ax_calc.text(0.04, 0.63, f"• Percentil Superior: Q_97.5% = {q_sup:.2f}%", fontsize=9, color="#dc2626", fontweight="bold")

        ax_calc.text(0.04, 0.51, "Como usar isso na tomada de decisão?", fontsize=9.2, fontweight="bold", color="#334155")
        ax_calc.text(0.04, 0.43, f"• Não prometa à diretoria um número cravado!\n  Prometa a faixa segura: [{q_inf:.2f}%, {q_sup:.2f}%].", fontsize=8.8, color="#0f172a")
        ax_calc.text(0.04, 0.33, f"• Mesmo no pior caso plausível dos especialistas,\n  o Critério 1 mantém peso mínimo de ~{q_inf:.1f}%.", fontsize=8.8, color="#0f172a")
        ax_calc.text(0.04, 0.23, f"• No melhor caso plausível, atinge no máximo ~{q_sup:.1f}%.", fontsize=8.8, color="#0f172a")

        ax_calc.text(0.04, 0.10, "Isso confere robustez e segurança a decisões\nde alto investimento em cavernas de sal.",
                     fontsize=8.4, color="#166534", style="italic")

    # -------------------------------------------------------------------------
    # PASSO 13: RESUMO METODOLÓGICO CONSOLIDADO
    # -------------------------------------------------------------------------
    def _draw_summary_defense(self, ax: Axes, ax_calc: Axes) -> None:
        configure_stats_axes(
            ax,
            x_limits=X_LIMITS_PESOS,
            y_limits=(-0.015, 0.155),
            x_label="Peso Normalizado W1 (%)",
            y_label="Densidade de Probabilidade",
            title="Síntese do Modelo: Distribuição e Faixa de Incerteza",
        )

        subset = self.weights_c1
        ax.hist(subset, bins=50, range=(40.0, 66.0), density=True, color="#e2e8f0", edgecolor="#94a3b8", alpha=0.6)

        x_grid = np.linspace(X_LIMITS_PESOS[0], X_LIMITS_PESOS[1], 500)
        gauss_pdf = stats.norm.pdf(x_grid, loc=self.global_mean, scale=self.global_std)
        ax.plot(x_grid, gauss_pdf, color="#0f172a", linewidth=2.0)

        mask_mid = (x_grid >= self.global_q_inf) & (x_grid <= self.global_q_sup)
        ax.fill_between(x_grid[mask_mid], gauss_pdf[mask_mid], color="#10b981", alpha=0.35, label="Intervalo de 95%")
        ax.axvline(self.global_q_inf, color="#dc2626", linestyle="--", linewidth=1.8)
        ax.axvline(self.global_q_sup, color="#dc2626", linestyle="--", linewidth=1.8)
        ax.axvline(self.global_mean, color="#1e40af", linestyle="-", linewidth=2.0, label="Média")

        ax.text(self.global_mean, 0.08, f"Distribuição Completa dos Pesos\nFaixa de 95%: [{self.global_q_inf:.2f}%, {self.global_q_sup:.2f}%]",
                ha="center", fontsize=9.8, fontweight="bold", color="#0f172a",
                bbox=dict(boxstyle="round,pad=0.4", facecolor="#ffffff", edgecolor="#cbd5e1"))

        add_unique_legend(ax, location="upper right")

        configure_card_axes(ax_calc)
        ax_calc.text(0.04, 0.93, "13. Tabela Consolidada: INPUTS vs OUTPUTS", fontsize=9.8, fontweight="bold", color="#1e293b")

        headers = ["Elemento", "Classificação", "Valor"]
        rows = [
            ["TFN (l, m, u)", "Input (Modelo)", "(2.0, 3.0, 4.0)"],
            ["Nº Iterações (N)", "Input (Config)", f"{self.n_max:,}"],
            ["Nível de Cobertura", "Input (Decisão)", "95.0%"],
            ["Média (w̄)", "Output (Simulação)", f"{self.global_mean:.2f}%"],
            ["Mediana", "Output (Simulação)", f"{self.global_median:.2f}%"],
            ["Q_2.5% (Inf.)", "Output (Simulação)", f"{self.global_q_inf:.2f}%"],
            ["Q_97.5% (Sup.)", "Output (Simulação)", f"{self.global_q_sup:.2f}%"],
            ["Intervalo Empírico", "Output Final", f"[{self.global_q_inf:.2f}%, {self.global_q_sup:.2f}%]"],
        ]

        y_pos = 0.84
        ax_calc.text(0.04, y_pos, f"{headers[0]:<18} {headers[1]:<17} {headers[2]}", fontsize=8.5, fontweight="bold", color="#0f172a")
        ax_calc.axhline(y_pos - 0.015, color="#cbd5e1", linewidth=0.8)

        for row in rows:
            y_pos -= 0.045
            is_hl = "Output Final" in row[1]
            color = "#047857" if is_hl else ("#1e3a8a" if "Output" in row[1] else "#475569")
            weight = "bold" if is_hl else "normal"
            ax_calc.text(0.04, y_pos, f"{row[0]:<18} {row[1]:<17} {row[2]}", fontsize=8.2, color=color, fontweight=weight)

        why_box = (
            "DISTINÇÃO CONCEITUAL (Intervalo de Incerteza vs IC):\n"
            "• IC Clássico: Estima a média de uma população real em campo.\n"
            "• Intervalo Empírico de Incerteza (95%):\n"
            f"  Mostra onde 95% dos pesos simulados recaem quando\n"
            "  consideramos as dúvidas expressas pelos especialistas.\n"
            "Fornece uma margem de segurança clara para a tomada de decisão."
        )
        ax_calc.text(0.04, 0.16, why_box, fontsize=8.0, color="#1e293b",
                     bbox=dict(boxstyle="round,pad=0.35", facecolor="#f1f5f9", edgecolor="#94a3b8"))


def on_animate_accumulation(
    ax_plot: Axes,
    ax_calc: Axes,
    state: StepState,
    viewer: InteractiveStepViewer,
) -> None:
    """Anima dinamicamente amostras sendo acumuladas no histograma e formando a Gaussiana."""
    demo: MonteCarloFAHPDemo = state.get("demo_instance")  # type: ignore[assignment]
    if demo is None:
        return

    sample_targets = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]

    for target_n in sample_targets:
        if not plt.fignum_exists(viewer.figure.number):
            break
        ax_plot.clear()
        ax_calc.clear()
        demo._draw_sample_distribution(ax_plot, ax_calc, target_n, show_gaussian=(target_n >= 150), show_kde=(target_n >= 1000))
        viewer.figure.suptitle(
            f"F-AHP & Incerteza de Monte Carlo — Acúmulo Dinâmico: N = {target_n:,} iterações",
            fontsize=12.5,
            fontweight="bold",
            color="#0f172a",
            y=0.975,
        )
        viewer.figure.canvas.draw()
        plt.pause(0.18)

    state["n_samples"] = 10000
    viewer.render()


def main() -> None:
    """Ponto de entrada para execução da demonstração conceitual."""
    headless = "--headless" in sys.argv
    export_images = "--export" in sys.argv

    if export_images:
        import os
        os.makedirs(".conceitos/img", exist_ok=True)

    demo = MonteCarloFAHPDemo()

    for step in demo.steps:
        step["demo_instance"] = demo

    viewer = InteractiveStepViewer(
        demo.steps,
        demo.draw_step,
        window_title="GeoMshGen & FAHP — Simulação de Monte Carlo & Incerteza (13 Passos)",
        on_animate_callback=on_animate_accumulation,
        figure_size=(15.5, 10.0),
    )

    if headless or export_images:
        for i in range(len(demo.steps)):
            viewer.current_index = i
            viewer.render()
            if export_images:
                path = f".conceitos/img/passo_{i+1}_{demo.steps[i]['phase'].lower()}.png"
                viewer.figure.savefig(path, dpi=130, facecolor=viewer.figure.get_facecolor())
                print(f"Salvo preview: {path}")
        print(f"Sucesso: Todos os {len(demo.steps)} passos renderizados e exportados com sucesso!")
        return

    viewer.show()


if __name__ == "__main__":
    main()
