module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: ["eslint:recommended", "plugin:svelte/recommended"],
	overrides: [
		{
			env: {
				node: true,
			},
			files: [".eslintrc.{js,cjs}"],
			parserOptions: {
				sourceType: "script",
			},
		},
		{
			files: ["*.svelte"],
			parser: "svelte-eslint-parser",
		},
	],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	rules: {
		"svelte/no-at-html-tags": "off",
		// blocks while (true) { ... } loops
		"no-constant-condition": "off",
		// regex stuff i dont understand, and catches <a />
		"no-useless-escape": "off",
		"no-unused-vars": [
			"error",
			{
				argsIgnorePattern: "^_",
				varsIgnorePattern: "^_",
				caughtErrorsIgnorePattern: "^_",
			},
		],
		// empty catch blocks are fine
		"no-empty": "off",
		// spaces for minor indentation, tabs for major indentation
		"no-mixed-spaces-and-tabs": "off",
	},
};
