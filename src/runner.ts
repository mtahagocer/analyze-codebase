import { analyzeCodebase } from "./analyze";
import { IAnalysisOptions } from "./types";

export interface IRunnerProps extends IAnalysisOptions {

    directory: string;
}


export default function runner(props: IRunnerProps) {

    analyzeCodebase(props);

}