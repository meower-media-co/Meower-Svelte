/**
 * @file Server-related URL constants.
 */

export const beta = false;
export const linkUrl =
	localStorage.getItem("meower_linkurl") ||
	"wss://meower-ws.showierdata.xyz/";
export const apiUrl =
	localStorage.getItem("meower_apiurl") ||
	"https://meower-api.showierdata.xyz/";
export const encodeApiURLParams =
	localStorage.getItem("meower_encodeapi") || false;
