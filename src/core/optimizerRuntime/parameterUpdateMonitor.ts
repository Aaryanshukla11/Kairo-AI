import { ParameterUpdateReportModel } from './optimizerTypes';

export class ParameterUpdateMonitor {
  public monitorUpdates(
    gradNorm: number,
    learningRate: number
  ): ParameterUpdateReportModel {
    const reportId = `PARAM-UPD-${Date.now()}`;
    const updatesNorm = parseFloat((gradNorm * learningRate).toFixed(6));
    
    // Simulate weight parameter updates ratio
    const ratioUpdated = parseFloat((updatesNorm / 100.0).toFixed(6));

    const isValid = updatesNorm >= 0 && ratioUpdated < 0.1; // check update size validity bounds

    return {
      reportId,
      updatesNorm,
      ratioUpdated,
      isValid
    };
  }
}

export const parameterUpdateMonitor = new ParameterUpdateMonitor();
export default parameterUpdateMonitor;
