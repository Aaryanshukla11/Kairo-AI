export interface IntegrationStageInfo {
  id: string;
  name: string;
  subsystem: string;
  description: string;
}

export const integrationStages: IntegrationStageInfo[] = [
  {
    id: 'dataset-builder',
    name: 'Dataset Builder',
    subsystem: 'Dataset',
    description: 'Constructs initial datasets and compiles manifests.'
  },
  {
    id: 'dataset-collector',
    name: 'Dataset Collector',
    subsystem: 'Dataset',
    description: 'Retrieves external raw sources and aggregates contents.'
  },
  {
    id: 'dataset-cleaning',
    name: 'Dataset Cleaning',
    subsystem: 'Dataset',
    description: 'Applies normalizers, whitespaces fixes, and repairs sample content.'
  },
  {
    id: 'dataset-deduplication',
    name: 'Dataset Deduplication',
    subsystem: 'Dataset',
    description: 'Identifies and removes redundant or overlapping textual blocks.'
  },
  {
    id: 'dataset-version-manager',
    name: 'Dataset Version Manager',
    subsystem: 'Dataset',
    description: 'Registers stable references to clean deduplicated samples.'
  },
  {
    id: 'tokenizer-training-pipeline',
    name: 'Tokenizer Training Pipeline',
    subsystem: 'Training',
    description: 'Trains custom BPE or WordPiece tokenizer configurations.'
  },
  {
    id: 'evaluation-harness',
    name: 'Evaluation Harness',
    subsystem: 'Training',
    description: 'Runs benchmark datasets and pre-evaluation passes.'
  },
  {
    id: 'training-configuration',
    name: 'Training Configuration',
    subsystem: 'Training',
    description: 'Verifies hardware compatibilities and hyperparameter ranges.'
  },
  {
    id: 'training-engine',
    name: 'Training Engine',
    subsystem: 'Training',
    description: 'Triggers model training loops and logs loss values.'
  },
  {
    id: 'checkpoint-manager',
    name: 'Checkpoint Manager',
    subsystem: 'Registries',
    description: 'Saves weights configurations and registers artifacts.'
  },
  {
    id: 'experiment-tracker',
    name: 'Experiment Tracker',
    subsystem: 'Training',
    description: 'Tracks metrics history logs and hyperparameter changes.'
  },
  {
    id: 'fine-tuning-engine',
    name: 'Fine-Tuning Engine',
    subsystem: 'Training',
    description: 'Configures LoRA or adapter layers for specialized downstream tasks.'
  },
  {
    id: 'model-export-pipeline',
    name: 'Model Export Pipeline',
    subsystem: 'Runtime',
    description: 'Compiles and packages model weights into ONNX or JAX targets.'
  }
];
