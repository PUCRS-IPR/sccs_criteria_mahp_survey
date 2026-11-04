"""Auxiliares de interface interativa e visualização estatística para demonstrações conceituais.

Inspirado no padrão de arquitetura didática de geomshgen/.conceitos.
Fornece o InteractiveStepViewer com suporte a layout triplo independente:
  1. Painel Gráfico Principal (superior esquerdo)
  2. Painel Didático de Fórmulas e Cálculos (superior direito)
  3. Cartão Informativo com Tópicos Estruturados e Notação Matemática (inferior)
"""

from __future__ import annotations

from collections.abc import Callable, Sequence
from typing import Any, TypeAlias

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.axes import Axes
from matplotlib.patches import FancyBboxPatch
from matplotlib.widgets import Button
from numpy.typing import NDArray

FloatArray: TypeAlias = NDArray[np.float64]
StepState: TypeAlias = dict[str, Any]
DrawStep: TypeAlias = Callable[[Axes, Axes, StepState], None]
ResetSteps: TypeAlias = Callable[[], Sequence[StepState]]


def configure_stats_axes(
    axes: Axes,
    x_limits: tuple[float, float],
    y_limits: tuple[float, float],
    *,
    x_label: str = "Peso Normalizado W (%)",
    y_label: str = "Densidade de Probabilidade",
    title: str = "",
) -> None:
    """Aplica estilo consistente e legível aos eixos estatísticos de Monte Carlo."""
    axes.set_xlim(x_limits)
    axes.set_ylim(y_limits)
    axes.set_xlabel(x_label, fontsize=9.5, fontweight="bold", color="#1e293b", labelpad=5)
    axes.set_ylabel(y_label, fontsize=9.5, fontweight="bold", color="#1e293b", labelpad=5)
    if title:
        axes.set_title(title, fontsize=10.5, fontweight="bold", color="#0f172a", pad=7)
    axes.grid(color="#e2e8f0", linestyle="--", linewidth=0.7, alpha=0.85)
    axes.set_axisbelow(True)
    for spine in axes.spines.values():
        spine.set_color("#cbd5e1")
        spine.set_linewidth(1.0)
    axes.tick_params(colors="#475569", labelsize=8.5)


def configure_card_axes(axes: Axes, title: str = "") -> None:
    """Configura o painel direito como um cartão limpo para equações e explicações."""
    axes.clear()
    axes.set_xlim(0.0, 1.0)
    axes.set_ylim(0.0, 1.0)
    axes.axis("off")
    axes.patch.set_facecolor("#ffffff")
    axes.patch.set_edgecolor("#cbd5e1")
    axes.patch.set_linewidth(1.2)
    axes.patch.set_visible(True)


def add_unique_legend(axes: Axes, *, location: str = "upper right", fontsize: int = 8) -> None:
    """Adiciona legenda filtrando duplicatas e rótulos vazios."""
    handles, labels = axes.get_legend_handles_labels()
    unique: dict[str, Any] = {}
    for handle, label in zip(handles, labels, strict=True):
        if label and not label.startswith("_") and label not in unique:
            unique[label] = handle
    if unique:
        axes.legend(
            unique.values(),
            unique.keys(),
            loc=location,
            fontsize=fontsize,
            framealpha=0.95,
            edgecolor="#cbd5e1",
            facecolor="#ffffff",
        )


def render_info_card(axes: Axes, state: StepState, current_step: int, total_steps: int) -> None:
    """Renderiza o cartão inferior com tópicos estruturados, espaçamento amplo e sem sobreposição."""
    axes.clear()
    axes.set_xlim(0.0, 1.0)
    axes.set_ylim(0.0, 1.0)
    axes.axis("off")

    # Fundo do cartão inferior estilizado com margem total garantida
    bg_rect = FancyBboxPatch(
        (0.005, 0.010),
        0.990,
        0.980,
        boxstyle="round,pad=0.010,rounding_size=0.025",
        facecolor="#ffffff",
        edgecolor="#cbd5e1",
        linewidth=1.2,
        zorder=1,
    )
    axes.add_patch(bg_rect)

    badge_text = str(state.get("badge", f"PASSO {current_step} DE {total_steps}"))
    badge_bg = str(state.get("badge_bg", "#eff6ff"))
    badge_fg = str(state.get("badge_fg", "#1d4ed8"))
    title = str(state.get("title", ""))
    bullets: list[str] = state.get("bullets", [])
    takeaway = str(state.get("takeaway", ""))
    takeaway_kind = str(state.get("takeaway_kind", "insight"))

    # 1. Badge no topo esquerdo do cartão com largura adaptativa
    badge_width = max(0.220, len(badge_text) * 0.0068 + 0.020)
    badge_patch = FancyBboxPatch(
        (0.015, 0.840),
        badge_width,
        0.120,
        boxstyle="round,pad=0.008,rounding_size=0.020",
        facecolor=badge_bg,
        edgecolor=badge_fg,
        linewidth=0.8,
        zorder=2,
    )
    axes.add_patch(badge_patch)
    axes.text(
        0.025,
        0.900,
        badge_text,
        fontsize=8.0,
        fontweight="bold",
        color=badge_fg,
        verticalalignment="center",
        zorder=3,
    )

    # 2. Título do passo posicionado dinamicamente após a badge
    title_x = 0.015 + badge_width + 0.016
    axes.text(
        title_x,
        0.900,
        title,
        fontsize=9.8,
        fontweight="bold",
        color="#0f172a",
        verticalalignment="center",
        zorder=3,
    )

    # Linha divisória suave
    axes.plot([0.015, 0.985], [0.810, 0.810], color="#e2e8f0", linewidth=1.0, zorder=2)

    # 3. Lista de tópicos explicativos (bullets) com espaçamento dinâmico seguro
    y_cursor = 0.740
    line_spacing = 0.092 if len(bullets) >= 5 else 0.110

    for bullet in bullets:
        weight = "normal"
        color = "#1e293b"
        if bullet.startswith("▸"):
            weight = "bold"
            color = "#0f172a"
        elif bullet.startswith("  •"):
            color = "#334155"

        axes.text(
            0.020,
            y_cursor,
            bullet,
            fontsize=8.8,
            fontweight=weight,
            color=color,
            verticalalignment="top",
            zorder=3,
        )
        y_cursor -= line_spacing

    # 4. Caixa de Destaque / Conclusão Didática (Takeaway) posicionada com folga no rodapé
    if takeaway:
        tk_bg = "#f0fdf4" if takeaway_kind == "insight" else ("#fef2f2" if takeaway_kind == "warning" else "#eff6ff")
        tk_border = "#86efac" if takeaway_kind == "insight" else ("#fca5a5" if takeaway_kind == "warning" else "#93c5fd")
        tk_fg = "#166534" if takeaway_kind == "insight" else ("#991b1b" if takeaway_kind == "warning" else "#1e40af")

        tk_patch = FancyBboxPatch(
            (0.015, 0.035),
            0.970,
            0.150,
            boxstyle="round,pad=0.008,rounding_size=0.018",
            facecolor=tk_bg,
            edgecolor=tk_border,
            linewidth=0.8,
            zorder=2,
        )
        axes.add_patch(tk_patch)
        axes.text(
            0.025,
            0.110,
            takeaway,
            fontsize=8.6,
            fontweight="bold",
            color=tk_fg,
            verticalalignment="center",
            zorder=3,
        )


class InteractiveStepViewer:
    """Visualizador com layout triplo de alta ergonomia e controles de navegação."""

    def __init__(
        self,
        steps: Sequence[StepState],
        draw_step: DrawStep,
        *,
        window_title: str,
        reset_steps: ResetSteps | None = None,
        figure_size: tuple[float, float] = (15.5, 10.0),
        on_animate_callback: Callable[[Axes, Axes, StepState, InteractiveStepViewer], None] | None = None,
    ) -> None:
        if not steps:
            raise ValueError("A demonstração deve conter pelo menos um passo.")

        self.steps = list(steps)
        self.draw_step = draw_step
        self.reset_steps = reset_steps
        self.on_animate_callback = on_animate_callback
        self.current_index = 0
        self.is_animating = False

        self.figure = plt.figure(figsize=figure_size, facecolor="#f8fafc")
        if self.figure.canvas.manager:
            self.figure.canvas.manager.set_window_title(window_title)

        # ---------------------------------------------------------------------
        # LAYOUT DE TRÊS PAINÉIS INDEPENDENTES (Garante ZERO sobreposição)
        # [left, bottom, width, height]
        # ---------------------------------------------------------------------
        # 1. Painel Gráfico Principal (Superior Esquerdo)
        self.axes_plot = self.figure.add_axes([0.055, 0.440, 0.525, 0.490])

        # 2. Painel Didático de Fórmulas e Cálculos (Superior Direito)
        self.axes_calc = self.figure.add_axes([0.615, 0.440, 0.335, 0.490])

        # 3. Painel Informativo Estruturado (Inferior) - Gap de 0.085 abaixo do gráfico!
        self.axes_info = self.figure.add_axes([0.055, 0.080, 0.895, 0.275])

        # ---------------------------------------------------------------------
        # BOTÕES DE NAVEGAÇÃO
        # ---------------------------------------------------------------------
        btn_y = 0.020
        btn_h = 0.044
        prev_axes = self.figure.add_axes([0.23, btn_y, 0.10, btn_h])
        reset_axes = self.figure.add_axes([0.35, btn_y, 0.10, btn_h])
        anim_axes = self.figure.add_axes([0.47, btn_y, 0.15, btn_h])
        next_axes = self.figure.add_axes([0.64, btn_y, 0.10, btn_h])

        self.previous_button = Button(prev_axes, "◀ Voltar", color="#f1f5f9", hovercolor="#e2e8f0")
        self.reset_button = Button(reset_axes, "↺ Resetar", color="#f1f5f9", hovercolor="#e2e8f0")
        self.anim_button = Button(anim_axes, "▶ Acumular Amostras", color="#eff6ff", hovercolor="#dbeafe")
        self.next_button = Button(next_axes, "Avançar ▶", color="#f1f5f9", hovercolor="#e2e8f0")

        self.previous_button.on_clicked(self._on_previous)
        self.reset_button.on_clicked(self._on_reset)
        self.anim_button.on_clicked(self._on_animate)
        self.next_button.on_clicked(self._on_next)

        self.figure.canvas.mpl_connect("key_press_event", self._on_key_press)
        self.render()

    def _set_button_enabled(self, button: Button, enabled: bool, active_color: str = "#f1f5f9") -> None:
        button.ax.set_facecolor(active_color if enabled else "#f8fafc")
        button.label.set_color("#0f172a" if enabled else "#94a3b8")

    def render(self) -> None:
        """Renderiza o estado atual em todos os três painéis."""
        state = self.steps[self.current_index]
        self.axes_plot.clear()
        self.axes_calc.clear()
        self.axes_info.clear()

        # Desenho customizado do gráfico e do painel de fórmulas
        self.draw_step(self.axes_plot, self.axes_calc, state)

        # Atualização do título geral da janela
        title = str(state.get("title", "Simulação de Monte Carlo"))
        total = len(self.steps)
        self.figure.suptitle(
            f"F-AHP & Simulação de Monte Carlo — {title} (Passo {self.current_index + 1} de {total})",
            fontsize=12.5,
            fontweight="bold",
            color="#0f172a",
            y=0.975,
        )

        # Renderização do cartão estruturado de informações
        render_info_card(self.axes_info, state, self.current_index + 1, total)

        # Habilitação visual dos botões
        self._set_button_enabled(self.previous_button, self.current_index > 0)
        self._set_button_enabled(self.next_button, self.current_index < len(self.steps) - 1)
        can_anim = bool(state.get("can_animate", False))
        self._set_button_enabled(self.anim_button, can_anim, active_color="#dbeafe")
        self.anim_button.label.set_color("#1d4ed8" if can_anim else "#94a3b8")

        self.figure.canvas.draw_idle()

    def _on_previous(self, _event: Any) -> None:
        if self.current_index > 0:
            self.current_index -= 1
            self.render()

    def _on_next(self, _event: Any) -> None:
        if self.current_index < len(self.steps) - 1:
            self.current_index += 1
            self.render()

    def _on_reset(self, _event: Any) -> None:
        if self.reset_steps is not None:
            self.steps = list(self.reset_steps())
        self.current_index = 0
        self.render()

    def _on_animate(self, _event: Any) -> None:
        state = self.steps[self.current_index]
        if self.on_animate_callback is not None and state.get("can_animate"):
            self.is_animating = True
            self.on_animate_callback(self.axes_plot, self.axes_calc, state, self)
            self.is_animating = False

    def _on_key_press(self, event: Any) -> None:
        if event.key in {"right", " ", "enter"}:
            self._on_next(event)
        elif event.key in {"left", "backspace"}:
            self._on_previous(event)
        elif event.key == "home":
            self.current_index = 0
            self.render()
        elif event.key == "r":
            self._on_reset(event)
        elif event.key in {"a", "p"}:
            self._on_animate(event)

    def show(self) -> None:
        """Abre a janela interativa do Matplotlib."""
        plt.show()
