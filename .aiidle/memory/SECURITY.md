# Security Specification

## Security Model
The project adopts a sandboxed design model prioritizing validation, limited file permission structures, and command safety policies.

## Permissions
- Standard workspace permissions.
- Deny wildcard (`*`) access or root levels unless explicitly approved.

## File Access Rules
- Restrict read/write operations within the project workspace.
- Temporary files must reside in dedicated scratch paths only.

## Terminal Safety & Command Validation
- All executions must rely on safe command prefixes.
- Interactive or risky CLI scripts are proposed for explicit developer confirmation before run.

## Known Risks
- *No security vulnerabilities identified.*

## Mitigations
- Maintain regular audits of external code modules.
- Strict input validation patterns.
