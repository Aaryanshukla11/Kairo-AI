# Risk Management

This document registers project risks, probability, impact, and mitigation procedures.

## Active Risk Register

### Risk: Environment Terminal Access Limitation
- **Category**: Technical / Execution Sandbox
- **Probability**: High
- **Impact**: Medium
- **Mitigation**: Rely on built-in filesystem tools (`write_to_file`, `replace_file_content`) to construct workspace layout and file modifications; document exceptions when terminal actions fail.
- **Current Status**: Active limit observed; mitigated via filesystem API.
- **Owner**: AI Developer Agent / User
- **Review Date**: 2026-07-16

### Risk: Context Window Limitations (Model Context Size)
- **Category**: Resource Constraints
- **Probability**: Medium
- **Impact**: High
- **Mitigation**: Split documentation into distinct concerns (`MODULES.md`, `DEPENDENCIES.md`, `ROADMAP.md`), keeping active files concise. Maintain prompt index mapping inside `FILE_INDEX.md`.
- **Current Status**: Under control.
- **Owner**: Developer Agent
- **Review Date**: 2026-07-16
