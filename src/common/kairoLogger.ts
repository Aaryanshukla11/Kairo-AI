export function logKairoStage(
  stageName: string,
  event: 'ENTER' | 'EXIT' | 'ERROR',
  executionId: string,
  inputSummary?: any,
  outputSummary?: any,
  executionTime?: number,
  error?: any
) {
  const logObj = {
    timestamp: Date.now(),
    executionTimeMs: executionTime || 0,
    inputSummary: inputSummary !== undefined ? inputSummary : '',
    outputSummary: outputSummary !== undefined ? outputSummary : '',
    error: error ? error.message || String(error) : '',
    executionId
  };
  console.log(`[KAIRO][${stageName}][${event}] ${JSON.stringify(logObj)}`);
}
