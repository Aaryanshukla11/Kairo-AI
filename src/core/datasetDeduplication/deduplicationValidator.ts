import { DuplicateCluster } from './deduplicationTypes';

export class DeduplicationValidator {
  public validateClusterIntegrity(cluster: DuplicateCluster): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Ensure representative exists
    if (!cluster.representativeSample) {
      errors.push(`Cluster ${cluster.clusterId} is missing its representative sample.`);
    } else {
      // 2. Ensure representative has provenance record
      if (!cluster.representativeSample.provenance) {
        errors.push(`Representative sample of cluster ${cluster.clusterId} is missing provenance.`);
      } else {
        const id = cluster.representativeSample.provenance.sampleId;
        if (!id) {
          errors.push(`Representative sample of cluster ${cluster.clusterId} has an empty sampleId.`);
        }
      }
    }

    // 3. Ensure duplicates list is not empty
    if (!cluster.duplicateSamples || cluster.duplicateSamples.length === 0) {
      errors.push(`Cluster ${cluster.clusterId} contains zero duplicates.`);
    } else {
      for (const dup of cluster.duplicateSamples) {
        if (!dup.provenance) {
          errors.push(`Duplicate sample ${dup.filePath} in cluster ${cluster.clusterId} has no provenance.`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const deduplicationValidator = new DeduplicationValidator();
export default deduplicationValidator;
