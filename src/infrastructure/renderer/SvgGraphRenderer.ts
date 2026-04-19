import type { IRenderer } from "../../application/ports/IRenderer";
import type { GitRepository } from "../../domain/entities/Repository";
import type { Commit } from "../../domain/entities/Commit";

const SPACING_X = 100;
const SPACING_Y = 90;
const PADDING = 60;
const SVG_NS = "http://www.w3.org/2000/svg";

interface CommitLayout extends Commit {
  x: number;
  y: number;
}

export interface SvgGraphRendererOptions {
  onCommitClick: (commitId: string) => void;
  onBackgroundClick: () => void;
}

export class SvgGraphRenderer implements IRenderer {
  private layouts: CommitLayout[] = [];
  private lastSize = { width: 800, height: 400 };

  constructor(
    private readonly svgEl: SVGSVGElement,
    private readonly containerEl: HTMLElement,
    private readonly options: SvgGraphRendererOptions,
  ) {
    svgEl.addEventListener("click", (e) => {
      if (e.target === svgEl) this.options.onBackgroundClick();
    });
  }

  render(repo: GitRepository, selectedCommitId: string | null): void {
    this.layouts = this.computeLayout(repo);

    const width = Math.max(
      800,
      PADDING * 2 + (repo.commits.length + 1) * SPACING_X,
    );
    const lanes = Math.max(1, Object.keys(repo.branches).length);
    const height = Math.max(400, PADDING * 2 + lanes * SPACING_Y);
    this.lastSize = { width, height };

    this.svgEl.setAttribute("viewBox", `0 0 ${width} ${height}`);
    this.svgEl.innerHTML = "";

    this.renderEdges(repo);
    this.renderNodes(repo, selectedCommitId);
    this.renderBranchLabels(repo);
  }

  centerOnCommit(commitId: string): void {
    const layout = this.layouts.find((l) => l.id === commitId);
    if (!layout) return;
    const rect = this.containerEl.getBoundingClientRect();
    const scaleX = rect.width / this.lastSize.width;
    const scaleY = rect.height / this.lastSize.height;
    const targetX = layout.x * scaleX - rect.width * 0.4;
    const targetY = layout.y * scaleY - rect.height * 0.4;
    this.containerEl.scrollTo({
      left: targetX,
      top: targetY,
      behavior: "smooth",
    });
  }

  getCommitClientPosition(commitId: string): { x: number; y: number } | null {
    const layout = this.layouts.find((l) => l.id === commitId);
    if (!layout) return null;
    const rect = this.containerEl.getBoundingClientRect();
    const scaleX = rect.width / this.lastSize.width;
    const scaleY = rect.height / this.lastSize.height;
    return {
      x: layout.x * scaleX - this.containerEl.scrollLeft,
      y: layout.y * scaleY - this.containerEl.scrollTop,
    };
  }

  private computeLayout(repo: GitRepository): CommitLayout[] {
    return repo.commits.map((c, i) => ({
      ...c,
      timeIndex: i,
      x: PADDING + i * SPACING_X,
      y: PADDING + (repo.branches[c.branchName]?.lane ?? 0) * SPACING_Y,
    }));
  }

  private renderEdges(repo: GitRepository): void {
    for (const layout of this.layouts) {
      for (const parentId of layout.parentIds) {
        const parent = this.layouts.find((l) => l.id === parentId);
        if (!parent) continue;
        const mx = (parent.x + layout.x) / 2;
        const d = `M ${parent.x} ${parent.y} C ${mx} ${parent.y}, ${mx} ${layout.y}, ${layout.x} ${layout.y}`;
        const edge = this.createEl("path");
        edge.setAttribute("d", d);
        edge.setAttribute("class", "edge");
        edge.setAttribute(
          "stroke",
          repo.branches[layout.branchName]?.color ?? "#95a3ff",
        );
        this.svgEl.appendChild(edge);
      }
    }
  }

  private renderNodes(
    repo: GitRepository,
    selectedCommitId: string | null,
  ): void {
    for (const layout of this.layouts) {
      const isSelected = layout.id === selectedCommitId;
      const circle = this.createEl("circle") as SVGCircleElement;
      circle.setAttribute("cx", String(layout.x));
      circle.setAttribute("cy", String(layout.y));
      circle.setAttribute("r", "12");
      circle.setAttribute(
        "class",
        `commit-node${isSelected ? " selected" : ""}`,
      );
      circle.setAttribute(
        "fill",
        repo.branches[layout.branchName]?.color ?? "#6ee7b7",
      );
      circle.dataset["id"] = layout.id;
      circle.addEventListener("click", () =>
        this.options.onCommitClick(layout.id),
      );
      this.svgEl.appendChild(circle);

      const text = this.createEl("text");
      text.setAttribute("x", String(layout.x));
      text.setAttribute("y", String(layout.y));
      text.setAttribute("class", "commit-id");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.textContent = layout.id;
      this.svgEl.appendChild(text);
    }
  }

  private renderBranchLabels(repo: GitRepository): void {
    for (const bName of Object.keys(repo.branches)) {
      const branch = repo.branches[bName];
      const tip = this.layouts.find((l) => l.id === branch.tipCommitId);
      if (!tip) continue;

      const isHead = repo.head.branchName === bName;
      const labelX = tip.x + 16;
      const labelY = tip.y - 14;

      const label = document.createElementNS(SVG_NS, "text") as SVGTextElement;
      label.setAttribute("x", String(labelX));
      label.setAttribute("y", String(labelY));
      label.setAttribute("class", "label");
      label.textContent = `${bName}${isHead ? " (HEAD)" : ""}`;
      this.svgEl.appendChild(label);

      const bbox = label.getBBox();
      const padX = 10;
      const padY = 6;
      const tagBg = this.createEl("rect");
      tagBg.setAttribute("x", String(bbox.x - padX));
      tagBg.setAttribute("y", String(bbox.y - padY));
      tagBg.setAttribute("rx", "10");
      tagBg.setAttribute("ry", "10");
      tagBg.setAttribute("width", String(bbox.width + padX * 2));
      tagBg.setAttribute("height", String(bbox.height + padY * 2));
      tagBg.setAttribute("class", "branch-tag");
      this.svgEl.insertBefore(tagBg, label);
    }
  }

  private createEl(tag: string): SVGElement {
    return document.createElementNS(SVG_NS, tag) as SVGElement;
  }
}
