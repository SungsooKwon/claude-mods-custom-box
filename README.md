<h1 align="center">claude-mods-custom-box</h1>

<p align="center">
  <a href="https://github.com/SungsooKwon/claude-mods-custom-box"><img src="https://img.shields.io/github/stars/SungsooKwon/claude-mods-custom-box?style=flat&amp;label=%E2%98%85&amp;color=08C" alt="GitHub stars" /></a>
  <img src="https://img.shields.io/badge/license-MIT-08C?style=flat" alt="License: MIT" />
  <img src="https://img.shields.io/badge/Claude%20Code-mods-D97757?style=flat" alt="Claude Code mods" />
  <img src="https://img.shields.io/badge/terminal-macOS%20%7C%20Windows%20%7C%20Linux-4493F8?style=flat-square" alt="Runs in the Claude Code terminal on macOS, Windows and Linux" />
</p>

<p align="center">
  <sub>English · <a href="docs/readme/README.ko.md">한국어</a></sub>
</p>

<p align="center">
  <strong>Small mods that make Claude Code feel alive.</strong><br/>
  One marketplace, many mods — install the ones you like with a single line.
</p>

<h3 align="center"><a href="#install"><ins>Install a mod</ins></a></h3>

<p align="center">
  <img src="docs/assets/usagi-hero.gif" alt="Usagi thinking, typing at a keyboard while a tool runs, then standing still on a meadow" width="640" />
</p>

## Mods

<table>
<tr>
<td width="50%" valign="middle">

### Usagi code

A pane above the prompt where Usagi acts out what Claude is doing — typing while a tool runs, a thinking bubble between steps, standing by when it's your turn. Beside it: your order, the subagents, and live progress.

`/plugin install usagi-code --marketplace SungsooKwon/claude-mods-custom-box`

[Usage ↓](#usagi-code-usage)

</td>
<td width="50%">
  <img src="docs/assets/usagi-hero.gif" alt="Usagi code stage" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Screensaver

Walk away and the stage turns into a 90s screensaver — growing pipes, a starfield, and tiny flying mascots — until Claude moves again.

Set the idle minutes with `/plugin configure usagi-code` (0 turns it off).

</td>
<td width="50%">
  <img src="docs/assets/usagi-screensaver.gif" alt="Starfield and pipes screensaver" width="100%" />
</td>
</tr>
</table>

**Also in Usagi code:**

- **Timeline** — the order tree for this turn, the live step with its tool chain, and a progress line (steps, done, failed).
- **Subagents** — each spawned agent with its type, task, state and the tool it is using now.
- **Heads-up popups** — a permission prompt or a question pops a dialog (“Usagi: hey! i need ur OK …”); a failed tool shows its first error line.
- **Usage warnings** — context %, 5-hour and weekly limits in the status bar, with a nudge toward `/compact` and the reset time when you get close.
- **2010s skins** — Windows 7, Mac OS X and Ubuntu themes, picked from your OS or set by hand.
- **Resizable stage** — ▲ ▼ in the status bar, or `/usagi +` / `/usagi -`; the size is kept across sessions.

> The pane's labels are in Korean for now.

---

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install usagi-code --marketplace SungsooKwon/claude-mods-custom-box
```

Answer `y` to add the marketplace, then Enter for the user scope. It is active right away.

_Or from a shell:_

```bash
claude plugin install usagi-code --marketplace SungsooKwon/claude-mods-custom-box
```

_In the desktop app_ (where `/plugin` does not run): click **+** next to the prompt box → **Plugins** → **Add marketplace** with `SungsooKwon/claude-mods-custom-box` → **Add plugin**.

<a id="usagi-code-usage"></a>

### Usagi code usage

| Command | What it does |
| --- | --- |
| `/usagi` | Open or close the pane |
| `/usagi +` · `/usagi -` · `/usagi size <n>` | Resize Usagi (rows) |
| `/usagi theme <windows7 \| macos \| ubuntu>` | Switch the look for this session |

Lasting settings — open on startup, screensaver minutes, theme — live in `/plugin configure usagi-code`. Terminal only.

---

## Community &amp; Support

- **Feedback &amp; ideas:** [Open an issue](https://github.com/SungsooKwon/claude-mods-custom-box/issues) — bugs, requests, or a mod you'd like to see.
- **Show support:** [Star](https://github.com/SungsooKwon/claude-mods-custom-box) this repo to follow new mods.

---

## Developing

Each mod lives in `plugins/<name>/` and is listed in `.claude-plugin/marketplace.json`.

```bash
scripts/new-mod.sh <mod-name> "One-line description"   # scaffold a mod and list it
claude --plugin-dir plugins/<mod-name>                  # run Claude Code with it loaded
scripts/check.sh [mod-name ...]                         # validate + test (all mods when no name)
```

A new mod installs with `/plugin install <mod-name> --marketplace SungsooKwon/claude-mods-custom-box`. `new-mod.sh` needs `jq`.

## Credits

Usagi code is ported from [clockendbader/mascot-studio](https://github.com/clockendbader/mascot-studio) (MIT).

## License

Free and open source under the [MIT License](LICENSE). Usagi code keeps the original author's notice in [plugins/usagi-code/LICENSE](plugins/usagi-code/LICENSE).
