import { analyzeCodebase } from "./analyze";
import { IAnalysisOptions } from "./types";
import { ExportFormat } from "./utils/export";

export interface IRunnerProps extends IAnalysisOptions {
  directory: string;
  exportFormat?: ExportFormat;
  exportPath?: string;
}

export default function runner(props: IRunnerProps) {
  analyzeCodebase(props);
}
