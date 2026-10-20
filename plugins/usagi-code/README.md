<h1 align="center">Usagi code</h1>

<p align="center">
  <img src="assets/preview.gif" alt="Usagi thinking, typing at a keyboard while a tool runs, then standing still on a meadow" width="640" />
</p>

<p align="center">
  <sub>English · <a href="README.ko.md">한국어</a></sub>
</p>

A pane above the prompt where Usagi acts out what Claude is doing: typing while a tool runs, a thinking bubble between steps, standing by when it's your turn. Beside it are your order, the subagents and live progress.

```
/plugin install usagi-code@claude-mods-custom-box
```

Haven't added the marketplace yet? See [Install in the repository README](../../README.md) first.

## Features

<table>
<tr>
<td width="50%" valign="middle">

### Stage

Types while a tool runs, shows a thinking bubble between steps, and stands by when it's your turn.

</td>
<td width="50%">
  <img src="assets/preview.gif" alt="Usagi code stage" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Screensaver

Walk away and the stage turns into a 90s screensaver (growing pipes, a starfield, tiny flying mascots) until Claude moves again.

</td>
<td width="50%">
  <img src="assets/screensaver.gif" alt="Starfield and pipes screensaver" width="100%" />
</td>
</tr>
</table>

- **Timeline** — the order tree for this turn, the live step with its tool chain, and a progress line (steps, done, failed).
- **Subagents** — each spawned agent with its type, task, state and the tool it is using now.
- **Heads-up popups** — a permission prompt or a question pops a dialog (“Usagi: hey! i need ur OK …”); a failed tool shows its first error line.
- **Usage warnings** — context %, 5-hour and weekly limits in the status bar, with a nudge toward `/compact` and the reset time when you get close.
- **2010s skins** — Windows 7, Mac OS X and Ubuntu themes, picked from your OS or set by hand.
- **Resizable stage** — ▲ ▼ in the status bar, or `/usagi +` / `/usagi -`; the size is kept across sessions. It looks most natural at the default 22 rows.

> The pane's labels are in Korean for now.

## Usage

| Command | What it does |
| --- | --- |
| `/usagi` | Open or close the pane |
| `/usagi +` · `/usagi -` · `/usagi size <n>` | Resize Usagi (rows) |
| `/usagi theme <windows7 \| macos \| ubuntu>` | Switch the look for this session |

> **Usagi looks most natural at 22 rows.** At other sizes the art is scaled down and drops pixels, so the eyes can look off. `/usagi size 22` brings it back.

Lasting settings (open on startup, screensaver minutes, theme) live in `/plugin configure usagi-code`. Terminal only.

## Credits

Ported from [clockendbader/mascot-studio](https://github.com/clockendbader/mascot-studio) (MIT). The original author's notice is kept in [LICENSE](LICENSE).
