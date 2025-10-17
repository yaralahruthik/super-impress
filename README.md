# Super Impress

Super Impress is a [Frontend Hire](https://www.frontendhire.com/) initiative where we build a serious product in public as a community.

## Quick Intro

This is why I am (or hopefully, we are) building SuperImpress.

There are many LinkedIn tools out there but:

- They make excessive use of AI to create content.
- This automatically results in not-so-authentic content.
- In order to sell themselves, they are marketing writing on LinkedIn in a wrong way.

SuperImpress will:

- Be author first and AI second.
- You write, then if needed you use AI to fix the writing.
- Give you templates that are plagiarism safe.
- And more, as I myself use the product.

---

Do note that I have already built the v0 (I have taken it down) of the product and it has served me and a few other users well.

For v1, I want to re-build it both from a product and a tech perspective.

We will be documenting every decision while re-building the product and this would be stored in the `decisions` folder.

---

Join [the discord community](https://discord.gg/DWAVqksVtx) for the latest updates.

---

## Getting Started

### Pre-commit Setup

This project uses pre-commit hooks to ensure code quality and consistency.

**Steps to setup pre-commit:**

```bash
# Install pre-commit
pip install pre-commit

# or if you have uv installed
uv tool install pre-commit

# Install the git hooks
pre-commit install
```

Now pre-commit hooks will automatically run on staged files before each commit. If a hook fails, the commit will be blocked until issues are resolved.

**Manual execution (optional):**

```bash
# Run on staged files
pre-commit run

# Run on all files
pre-commit run --all-files
```
