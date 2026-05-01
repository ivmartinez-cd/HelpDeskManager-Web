# Antigravity Skills: Core Principles & Methodology

This document serves as the foundational reference for the application and development of Antigravity Skills within this project. It is based on the [guanyang/antigravity-skills](https://github.com/guanyang/antigravity-skills) repository and manual.

## 🚀 Core Philosophy

1.  **Modular Expertise**: Skills are not just documentation; they are encapsulated, domain-specific expert capabilities. Each skill allows the agent to adopt a specific professional persona (e.g., UI/UX Designer, Performance Engineer, Security Auditor).
2.  **Just-In-Time Loading**: Skills are loaded only when relevant to the task, preventing context bloating while ensuring the highest level of specialized knowledge is available.
3.  **Human-Expert Emulation**: The goal is to solve complex problems with the systematic methodology of a human expert, rather than just providing generic AI answers.

## 🛠️ Usage Patterns

### 1. Skill Invocation
- **Referencing**: Skills can be invoked or discussed using the `@[skill-name]` notation.
- **Loading**: When a skill is relevant, the agent should read the corresponding `SKILL.md` to internalize the methodology before proceeding.

### 2. Implementation Workflow
Every task performed under the Antigravity framework should follow these stages:
- **Phase 1: Research & Plan**: Use specialized research skills (`search-specialist`, `deep-research`) to understand the domain.
- **Phase 2: Systematic Execution**: Follow the step-by-step instructions in the loaded `SKILL.md`.
- **Phase 3: Verification**: Use testing and verification skills (`systematic-debugging`, `android_ui_verification`) to ensure correctness.

## 🎨 Visual & Design Standards
*Derived from the Antigravity Design Expert philosophy:*
- **Premium Aesthetics**: Avoid generic or "MVP" looks. Use vibrant colors, glassmorphism, and dynamic animations.
- **Micro-interactions**: Use `design-spells` to add "magic" and personality to the interface.
- **Responsive Distribution**: Ensure layouts are optimized for high-resolution (2K+) displays using advanced Flexbox/Grid strategies.

## 📁 Repository Structure Convention
- `.agent/skills/`: Local project-specific skills.
- `SKILL.md`: Mandatory entry point for any skill, containing YAML frontmatter and logic.
- `scripts/`: Supporting automation scripts for the skill.

## 📝 Continuous Improvement
This file should be updated whenever new patterns or repository-wide conventions are established through the use of Antigravity Skills.
