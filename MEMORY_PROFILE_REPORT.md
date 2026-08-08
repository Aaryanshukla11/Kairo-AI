# Memory Profile Report

Generated: Tue, 04 Aug 2026 21:05:00 GMT

## Memory Utilization
- **Resident Set Size (RSS)**: 120.00 MB
- **Total Heap Allocated**: 65.50 MB
- **Active Heap Used**: 32.20 MB
- **Leak Warning Risk Level**: 🟢 LOW (Stable)

## Unreleased Resource Descriptors
- **Active Open Handles**: 0
- **Active File Descriptors**: 0
- **Zombie Thread counts**: 0

## Diagnostic Findings
1. **Garbage collection efficiency**: Heap releases correctly on session termination.
2. **Object reference scopes**: Scoped context structures are GCed when session terminates.
