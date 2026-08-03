# Changelog

## [M06-S01-T010] - 2026-08-03

### Added
- Implemented **Experiment Tracker** (`src/core/experimentTracker/`) supporting recording, comparing, replaying, and registering research experiment runs.
- Implemented **Experiment Metrics & Providers** (`experimentMetrics.ts`, `providers/`): Simulates pretraining, tokenizer, evaluation, benchmark, and custom experiment metrics outputs.
- Implemented **Experiment Validator** (`experimentValidator.ts`) auditing configurations presence, datasets, tokenizers, checkpoints, and random seed ranges.
- Implemented **Experiment Artifacts Tracker** (`experimentArtifacts.ts`) logging registered weights and settings file paths.
- Implemented **Experiment Replay Reproducibility** (`experimentReplay.ts`) comparing seed numbers and hardware compatibility profiles.
- Implemented **Experiment Comparator** (`experimentComparator.ts`) analyzing loss, accuracy, and GPU throughput deltas between runs.
- Implemented **Experiment Versioning & Registry** (`experimentRegistry.ts`) enforcing registry immutability to block overwrites.
- Implemented **Experiment Manifest & Reports** (`experimentManifest.ts`, `experimentReports.ts`) creating serialized SHA-256 manifests.
- Implemented **Experiment Dashboard** (`src/webview/components/runtime/ExperimentDashboard.tsx`): Displays research runs list, rankings leaderboard, parameter delta comparison views, replay status, and timeline events.
- Implemented **Unit Test Suite** (`tests/unit/experimentTracker.test.ts`).

## [M06-S01-T009] - 2026-08-03

### Added
- Implemented **Checkpoint Manager** (`src/core/checkpointManager/`) supporting saving, validating, compressing, restoring, and comparison deltas calculations for model checkpoints.
- Implemented **Checkpoint Storage & Providers** (`checkpointStorage.ts`, `providers/`): Saves checkpoints locally (Local Storage) and remote registries (Artifact Registry) as compressed formats.
- Implemented **Checkpoint Validator** (`checkpointValidator.ts`) auditing step contiguities, parameter state keys, checksum alignments, and optimizer/scheduler compatibility.
- Implemented **Checkpoint Retention Policies** (`checkpointRetention.ts`) executing LatestN and best loss parameters pruning.
- Implemented **Checkpoint Restorer & Recovery** (`checkpointRestorer.ts`, `checkpointRecovery.ts`) loading checkpoints and building recovery reports for resumable pipelines.
- Implemented **Checkpoint Versioning & Registry** (`checkpointVersionManager.ts`, `checkpointRegistry.ts`) linking parent-child lineages parent relationships and preventing edits.
- Implemented **Checkpoint Manifest** (`checkpointManifest.ts`) creating manifest models with file lists.
- Implemented **Checkpoint Dashboard** (`src/webview/components/runtime/CheckpointDashboard.tsx`): Displays checkpoints list, step/epoch parameters, loss parameters, retention policy, available disk space, and histories.
- Implemented **Unit Test Suite** (`tests/unit/checkpointManager.test.ts`).

## [M06-S01-T008] - 2026-08-03

### Added
- Implemented **Training Configuration System** (`src/core/trainingConfiguration/`) supporting creation, validation, and version registry tags for training parameters.
- Implemented **Hyperparameter Templates Manager & Providers** (`hyperparameterManager.ts`, `providers/`): Resolves standard configurations (Pretraining, Fine-tuning, Instruction Tuning, Evaluation, Custom) templates with customizable partial overrides.
- Implemented **Schedulers & Optimizers managers** (`schedulerManager.ts`, `optimizerManager.ts`) checking valid options (cosine, linear, constant, AdamW, SGD, Adafactor).
- Implemented **Configuration Validator** (`configurationValidator.ts`) auditing compatible tokenizers, datasets, hardware device counts, and warning on batch size overflows (OOM warnings).
- Implemented **Configuration Versioning & Registry** (`configurationVersionManager.ts`, `configurationRegistry.ts`) enforcing registry immutability to prevent configs updates.
- Implemented **Configuration Manifest** (`configurationManifest.ts`) creating configuration manifest files with SHA-256 parameter checksums.
- Implemented **Training Configuration Dashboard** (`src/webview/components/runtime/TrainingConfigurationDashboard.tsx`): Displays configurations, templates parameters, hardware profiles (device counts, precisions), and timeline histories.
- Implemented **Unit Test Suite** (`tests/unit/trainingConfiguration.test.ts`).

## [M06-S01-T007] - 2026-08-03

### Added
- Implemented **Evaluation Harness** (`src/core/evaluation/`) executing reproducible benchmark suites for tokenizers, model checkpoints, and inference configs.
- Implemented **Benchmark Registry & Executor** (`benchmarkRegistry.ts`, `benchmarkExecutor.ts`) storing task configs and executing target tasks via provider hooks.
- Implemented **Benchmark Providers** (`providers/`): Tokenizer, Coding, Reasoning, Inference, and Custom benchmark runners.
- Implemented **Score Aggregator** (`scoreAggregator.ts`) averaging metrics scores into weighted aggregates.
- Implemented **Benchmark Comparator** (`benchmarkComparator.ts`) comparing deltas on accuracy, latency, and tokens/sec speeds.
- Implemented **Evaluation Validator** (`evaluationValidator.ts`) auditing metrics completeness and monitoring failure rates.
- Implemented **Historical Leaderboards & Result Exporter** (`evaluationHistory.ts`, `resultExporter.ts`) logging runs and exporting reports in JSON or CSV.
- Implemented **Evaluation Manifest & Reports** (`evaluationManifest.ts`, `evaluationReports.ts`) creating run manifestations and tracking timeline histories.
- Implemented **Evaluation Dashboard** (`src/webview/components/runtime/EvaluationDashboard.tsx`): Displays completed runs, rankings leaderboard, delta comparisons, execution logs, and exports options.
- Implemented **Unit Test Suite** (`tests/unit/evaluationHarness.test.ts`).

## [M06-S01-T006] - 2026-08-03

### Added
- Implemented **Tokenizer Training Pipeline** (`src/core/tokenizerTraining/`) with modular subword providers, validator engines, benchmarks, evaluators, manifests compilers, compatibility checkers, and event pub/sub.
- Implemented **Tokenizer Trainer & Providers** (`tokenizerTrainer.ts`, `providers/`): Simulates SentencePiece, BPE, Unigram, and WordPiece training algorithms.
- Implemented **Vocabulary Validator** (`tokenizerValidator.ts`) auditing contiguity, special tokens presence, duplicate mapping indices, and stable round-trip encoding/decoding.
- Implemented **Tokenizer Benchmark** (`tokenizerBenchmark.ts`) tracking compression ratio, average tokens per file, vocabulary coverage, unknown token rates, encoding speed, decoding speed, and memory workloads.
- Implemented **Tokenizer Evaluator & Compatibility** (`tokenizerEvaluator.ts`, `tokenizerCompatibility.ts`) analyzing character coverage ratio checks and issuing warnings.
- Implemented **Tokenizer Versioning & Registry** (`tokenizerVersionManager.ts`, `tokenizerRegistry.ts`) enforcing registry immutability to prevent overwrites.
- Implemented **Tokenizer Manifest** (`tokenizerManifest.ts`) creating version manifest files with checksum calculations.
- Implemented **Tokenizer Dashboard** (`src/webview/components/runtime/TokenizerDashboard.tsx`): Displays tokenizer versions, vocab sizes, compression metrics, coverage rates, speed tests, algorithm matrix comparison, and timeline histories.
- Implemented **Unit Test Suite** (`tests/unit/tokenizerTraining.test.ts`).

## [M06-S01-T005] - 2026-08-03

### Added
- Implemented **Dataset Version Manager** (`src/core/datasetVersioning/`) with version registry, comparator engines, snapshot builders, and lineage trackers.
- Implemented **Lineage Tracker** (`lineageTracker.ts`) storing transformation stages and parent-child linkages in dataset tree graphs.
- Implemented **Version Comparator** (`versionComparator.ts`) comparing sample counts, estimated token volumes, added/removed languages list, quality metrics, and checksum matches.
- Implemented **Version Builder & Registry** (`versionBuilder.ts`, `versionRegistry.ts`) generating `DatasetVersionModel` objects and locking them immutably.
- Implemented **Semantic Versioning parser** (`semanticVersioning.ts`) validating strings and supporting increments.
- Implemented **Version Manifest & Snapshots** (`versionManifest.ts`, `datasetSnapshot.ts`) saving copies of datasets in providers.
- Implemented **Version Validator** (`versionValidator.ts`) confirming lineage connections and snapshot alignments.
- Implemented **Versioning Provider plugins** (`providers/`): Manifest, Metadata, and Snapshot registry providers.
- Implemented **Dataset Version Dashboard** (`src/webview/components/runtime/DatasetVersionDashboard.tsx`): Displays registered versions, parent-child comparisons, lineage tree graphs, snapshot lists, and timelines.
- Implemented **Unit Test Suite** (`tests/unit/datasetVersioning.test.ts`).

## [M06-S01-T004] - 2026-08-03

### Added
- Implemented **Dataset Deduplication Engine** (`src/core/datasetDeduplication/`) executing a multi-stage duplicate check pipeline: load dataset, fingerprint generation, exact matching, structural analysis, semantic similarity shingle check, clustering, duplicate resolving, and reports compilation.
- Implemented **Similarity Engine** (`similarityEngine.ts`) integrating three matching paradigms:
  - `exactMatchDetector.ts`: Cryptographic SHA-256 exact match checks.
  - `structuralSimilarity.ts`: Structural hash comparisons.
  - `semanticSimilarity.ts`: MinHash Jaccard semantic overlap approximation checks.
- Implemented **Duplicate Resolver** (`duplicateResolver.ts`) choosing representative candidates according to quality scores, metadata counts, and collection timestamp values.
- Implemented **Cluster Manager** (`clusterManager.ts`) compiling DuplicateClusters.
- Implemented **Deduplication Validator** (`deduplicationValidator.ts`) confirming representative validity and cluster integrity.
- Implemented **Fingerprint Generator & Hashing** (`fingerprintGenerator.ts`, `hashingEngine.ts`) constructing shingles sets and MinHash signatures based on files types.
- Implemented **Deduplication Provider preprocessors** (`providers/`): Source Code, Markdown, JSON, Text, and Documentation preprocessors.
- Implemented **Deduplication Dashboard** (`src/webview/components/runtime/DeduplicationDashboard.tsx`): Renders total samples, duplicates, space saved, clusters list, removed candidates, and matching distribution categories.
- Implemented **Unit Test Suite** (`tests/unit/datasetDeduplication.test.ts`).

## [M06-S01-T003] - 2026-08-03

### Added
- Implemented **Dataset Cleaning Pipeline** (`src/core/datasetCleaning/`) including a 9-stage pipeline: Load Dataset -> Validate Samples -> Normalize Encoding -> Normalize Metadata -> Normalize Formatting -> Detect Corruption -> Repair Recoverable Samples -> Assign Quality Scores -> Generate Clean Dataset.
- Implemented **Sample Normalizer Engine** (`sampleNormalizer.ts`) orchestrating:
  - `encodingNormalizer.ts`: UTF-8 NFC character Normalization and invalid character block detection.
  - `whitespaceNormalizer.ts`: LF line endings standardization and blank line collapsing.
  - `languageNormalizer.ts`: Programming and layout language standardizations.
  - `metadataNormalizer.ts`: Provenance metadata sanitization and forward-slash file path standardization.
- Implemented **Corruption & Invalid Detectors** (`corruptionDetector.ts`, `invalidSampleDetector.ts`): Scans for null content, binary signatures, replacement characters, truncated JSON patterns, and empty fields.
- Implemented **Repair Engine** (`repairEngine.ts`) recovering malformed/cut-off JSON files by closing unclosed brackets/braces and stripping non-printable characters.
- Implemented **Quality Scorer & Analyzer** (`qualityScorer.ts`, `qualityAnalyzer.ts`): Computes weighted quality metrics (Syntax, Metadata, Format, Encoding, Docs, Completeness, Confidence, Complexity) and aggregates dataset distributions.
- Implemented **Rule-based Rejection Filters** (`cleaningRules.ts`, `cleaningValidator.ts`) guaranteeing that every accepted cleaned sample retains its full provenance and every rejected sample tracks rejection reasons.
- Implemented **Cleaner Provider plugins** (`providers/`): Source Code, Markdown, JSON, Text, and Documentation cleaners.
- Implemented **Dataset Cleaning Dashboard** (`src/webview/components/runtime/DatasetCleaningDashboard.tsx`): Displays processed counts, accepted/rejected totals, normalizations applied, quality score distributions, rejection reasons, and timeline history.
- Implemented **Unit Test Suite** (`tests/unit/datasetCleaning.test.ts`).

## [M06-S01-T002] - 2026-08-03

### Added
- Implemented **Dataset Collector Engine** (`src/core/datasetCollector/collectorEngine.ts`) with a 10-stage collection pipeline: Discover Sources -> Validate Source -> Scan Files -> Extract Metadata -> Detect License -> Generate Provenance -> Validate Integrity -> Create Manifest -> Publish Report.
- Implemented **Provenance Tracker** (`provenanceTracker.ts`) storing Sample ID, Dataset ID, Source Type, Repository, Repository URL, Commit Hash, Branch, File Path, Language, License, Collection Time, SHA-256 Checksum, and Collector Version.
- Implemented **License Detector** (`licenseDetector.ts`) supporting MIT, Apache-2.0, GPL, BSD, ISC, MPL-2.0, Creative Commons, and Unlicense detection.
- Implemented **Integrity Validator** (`integrityValidator.ts`) guaranteeing source reachability, file readability, metadata completeness, license detection, and checksum generation.
- Implemented **Metadata & Report Generator** (`metadataCollector.ts`, `sourceDiscovery.ts`) producing Source Reports, License Reports, Integrity Reports, Collection Statistics, and full Collection Reports.
- Implemented **Dataset Provider Suite** (`src/core/datasetCollector/providers/`):
  - LocalFolderProvider
  - GitRepositoryProvider
  - GithubArchiveProvider
  - MarkdownProvider
  - JsonProvider
  - DocumentationProvider
  - SourceCodeProvider
- Implemented **Dataset Collector Dashboard** (`src/webview/components/runtime/DatasetCollectorDashboard.tsx`) displaying active sources, collected files, language breakdown, collection progress, license distribution, history logs, integrity status, and assembled manifest JSON preview.
- Implemented **Unit Test Suite** (`tests/unit/datasetCollector.test.ts`).
