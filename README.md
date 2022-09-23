# BetterMeower

BetterMeower has new features and enhancements not available in vanilla Meower, such as higher character limit, linebreaks and an emoji picker. Everything posted with BetterMeower can be seen by vanilla users, except emojis on Scratch Meower.

## Developing

Requirements:
- node.js and npm or some other package manager
- git (optional, for cloning the repo)
- Preferably understanding of JavaScript and node.js, among ~~us~~ other things

To clone and run a development server on your machine (that autoupdates when you modify files):

```
git clone https://github.com/meower-media-co/Meower-Svelte
cd Meower-Svelte
npm install
npm run dev
```

For one-time building:

```
npm run build
```

(Note: A GitHub Action will usually do this for you when you push to the repo.)

------

Relevant bit of information from the original readme:

> ## Recommended IDE Setup
> [VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).
