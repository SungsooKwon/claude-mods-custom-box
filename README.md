<h1 align="center">claude-mods-custom-box</h1>

<p align="center">
  <a href="https://github.com/SungsooKwon/claude-mods-custom-box"><img src="https://img.shields.io/github/stars/SungsooKwon/claude-mods-custom-box?style=flat&amp;label=%E2%98%85&amp;color=08C" alt="GitHub stars" /></a>
  <img src="https://img.shields.io/badge/license-MIT-08C?style=flat" alt="License: MIT" />
  <img src="https://img.shields.io/badge/Claude%20Code-mods-D97757?style=flat" alt="Claude Code mods" />
  <img src="https://img.shields.io/badge/terminal-macOS%20%7C%20Windows%20%7C%20Linux-4493F8?style=flat-square" alt="Runs in the Claude Code terminal on macOS, Windows and Linux" />
</p>

<p align="center">
  <sub>English · <a href="README.ko.md">한국어</a></sub>
</p>

<p align="center">
  <strong>A growing box of Claude Code mods.</strong><br/>
  Each mod does one small thing. Install only the ones you want.
</p>

## Mods

<!-- mods:start -->
| Preview | Mod | What it does |
| --- | --- | --- |
| <img src="plugins/usagi-code/assets/preview.gif" alt="usagi-code" width="200" /> | [**usagi-code**](plugins/usagi-code) | Usagi acts out what Claude is doing in a pane above the prompt, with the order, subagents and progress beside it. |
<!-- mods:end -->

More mods are on the way. Click a mod's name for its features and usage.

## Install

Add the marketplace once, then install any mod in it by name. At the prompt of a Claude Code terminal session:

```
/plugin marketplace add SungsooKwon/claude-mods-custom-box
/plugin install <mod>@claude-mods-custom-box
```

To pick up newly added mods, refresh the list:

```
/plugin marketplace update claude-mods-custom-box
```

_In one line:_ `/plugin install <mod> --marketplace SungsooKwon/claude-mods-custom-box` (answer `y` to add the marketplace, then Enter for the user scope).

_From a shell:_ replace the leading `/` with `claude ` (e.g. `claude plugin install <mod>@claude-mods-custom-box`).

_In the desktop app_ (where `/plugin` does not run): click **+** next to the prompt box → **Plugins** → **Add marketplace** with `SungsooKwon/claude-mods-custom-box` → **Add plugin**.

## Making a mod

```
plugins/<mod>/                    one mod (plugin.json, hooks/, tests/, README.md, assets/)
.claude-plugin/marketplace.json   the list of installable mods
scripts/new-mod.sh                scaffold a mod and list it in the marketplace and README tables
scripts/check.sh                  check list, README and folders agree, then validate and test
```

```bash
scripts/new-mod.sh <mod-name> "One-line description" "한 줄 설명"
claude --plugin-dir plugins/<mod-name>      # run Claude Code with it loaded
scripts/check.sh [mod-name ...]             # all mods when no name
```

Before you push: fill in the mod's `README.md`, put a preview at `plugins/<mod>/assets/preview.gif` and swap the `—` in the README tables for it, and make sure `scripts/check.sh` passes. `new-mod.sh` needs `jq`.

## Community &amp; Support

- **Feedback &amp; ideas:** [Open an issue](https://github.com/SungsooKwon/claude-mods-custom-box/issues) — bugs, requests, or a mod you'd like to see.
- **Show support:** [Star](https://github.com/SungsooKwon/claude-mods-custom-box) this repo to follow new mods.

## License

[MIT License](LICENSE). A mod ported from another project keeps the original author's notice in its own folder's `LICENSE`.
