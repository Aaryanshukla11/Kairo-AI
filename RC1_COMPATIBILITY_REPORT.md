# Kairo-AI Compatibility Report

Generated: Tue, 04 Aug 2026 21:30:00 GMT
Target Version: Release Candidate 1 (RC1)

## System OS Support Matrix
| Platform | Support Level | Required Architecture | Details |
|---|---|---|---|
| Windows | 🟢 Full Support | x86_64, ARM64 | Windows 10/11 |
| macOS | 🟢 Full Support | Apple Silicon, Intel x86_64 | macOS Big Sur+ |
| Linux | 🟢 Full Support | x86_64, AArch64 | glibc 2.31+ |

## Execution Environments Compatibilities
- **Node.js**:
  - v16.x: Compatible (tested on v16.14.0)
  - v18.x: Compatible (tested on v18.16.0)
  - v20.x: Recommended (tested on v20.5.0)
- **VS Code API Target**:
  - Supports engines version ^1.80.0
- **Hardware Acceleration Support**:
  - ONNX Runtime Execution: CPU, DirectML (Windows GPU), CoreML (Mac GPU)
  - PyTorch: CPU execution, CUDA 11.8+ (Linux GPU acceleration)

## Hardware Allocation Thresholds
- **Minimum Allocation**: 4 Cores CPU, 8GB System RAM, 2GB Free Storage.
- **Recommended Allocation**: 8 Cores CPU, 16GB System RAM, 4GB VRAM GPU, 10GB SSD Storage.
