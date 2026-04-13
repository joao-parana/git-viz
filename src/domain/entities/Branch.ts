export interface Branch {
  readonly name: string;
  readonly color: string;           // hex, atribuído automaticamente por lane
  readonly tipCommitId: string | null;
  readonly lane: number;            // posição vertical no gráfico (0 = master)
}
