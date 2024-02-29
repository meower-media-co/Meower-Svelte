// Custom themes.

// Helper functions to remove from hex color

export function extractOctets(hex) {
	const octetsRegex = /^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
	return hex.match(octetsRegex);
}

export function addHexColor(c1, c2) {
	const m1 = extractOctets(c1);
	const m2 = extractOctets(c2);
	if (!m1 || !m2) {
		throw new Error(`invalid hex color triplet(s): ${c1} / ${c2}`);
	}
	return [1, 2, 3]
		.map(i => {
			var sum = parseInt(m1[i], 16) + parseInt(m2[i], 16);
			if (sum > 0xff) sum = 0xff;
			return sum.toString(16).padStart(2, "0");
		})
		.join("");
}

export function removeHexColor(c1, c2) {
	const m1 = extractOctets(c1);
	const m2 = extractOctets(c2);
	if (!m1 || !m2) {
		throw new Error(`invalid hex color triplet(s): ${c1} / ${c2}`);
	}
	return [1, 2, 3]
		.map(i => {
			var sum = parseInt(m1[i], 16) - parseInt(m2[i], 16);
			if (sum < 0x00) sum = 0x00;
			return sum.toString(16).padStart(2, "0");
		})
		.join("");
}

// Actual code

export let fallback = {
	v: 1,
	orange: "#f9a636",
	background: "#ffffff",
	foreground: "#000000",
	foregroundOrange: "#ffffff",
	tinting: "#252525",
};

export let fallback_fallback = {
	v: 1,
	orange: "#f9a636",
	background: "#ffffff",
	foreground: "#000000",
	foregroundOrange: "#ffffff",
	tinting: "#252525",
}; // for some reason fallback can be overwritten

import {useCustomTheme, customTheme as currentCustomTheme} from "./stores.js";

export function themeToString(theme) {
	return "custom:" + JSON.stringify(theme);
}

export function stringToTheme(string) {
	try {
		const json = JSON.parse(string.replace("custom:", ""));
		return {
			v: json.v || fallback.v,
			orange: json.orange || fallback.orange,
			background: json.background || fallback.background,
			foreground: json.foreground || fallback.foreground,
			foregroundOrange:
				json.foregroundOrange || fallback.foregroundOrange,
			tinting: json.tinting || fallback.tinting,
		};
	} catch (e) {
		console.error("Error loading custom theme: " + e);
		return fallback;
	}
}


export function applyTheme(theme) {
	if (!theme.v)
		throw new Error("required field 'v' is not defined or is null");
	if (!theme.orange)
		throw new Error("required field 'orange' is not defined or is null");
	if (!theme.background)
		throw new Error(
			"required field 'background' is not defined or is null"
		);
	if (!theme.foreground)
		throw new Error(
			"required field 'foreground' is not defined or is null"
		);
	if (!theme.foregroundOrange)
		throw new Error(
			"required field 'foregroundOrange' is not defined or is null"
		);
	if (!theme.tinting)
		throw new Error("required field 'tinting' is not defined or is null");

	if (![1].includes(theme.v))
		throw new Error(`invalid theme version (${theme.v})`);

	currentCustomTheme.set(theme);
	useCustomTheme.set(true);
}

export function getTintColor(dark,theme) {
	if (dark) {
		return "#" + addHexColor(theme.orange.slice(1), theme.tinting.slice(1));
	} else {
		return "#" + removeHexColor(theme.orange.slice(1), theme.tinting.slice(1));
	}
}

export function removeTheme() {
	useCustomTheme.set(false);
	currentCustomTheme.set(fallback);
}

export function get_True_Fallback() {
	if (fallback == fallback_fallback) {
		return fallback
	} else {
		console.warn("Fallback theme is not correct, resetting to fallback 2");
		return fallback_fallback
	}
}