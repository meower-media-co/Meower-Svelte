/**
 * @file The "main" CloudLink instance provider, also providing some handy utility functions.
 */

import ConnectionFailedModal from "./modals/ConnectionFailed.svelte";
import LoggedOutModal from "./modals/LoggedOut.svelte";
import AccountBannedModal from "./modals/safety/AccountBanned.svelte";

import Cloudlink from "./cloudlink.js";
import {
	screen,
	relationships,
	chats,
	ulist,
	user,
	authHeader,
	spinner,
	intentionalDisconnect,
	reconnecting,
	disconnected,
	disconnectReason,
} from "./stores.js";
import unloadedProfile from "./unloadedprofile.js";
import {stringToTheme, applyTheme, removeTheme} from "./CustomTheme.js";
import {linkUrl, apiUrl} from "./urls.js";
import * as modals from "./modals.js";

import {tick} from "svelte";

/**
 * A list of status codes that indicate the client will be disconnected.
 */
const disconnectCodes = [
	"E:018 | Account Banned",
	"E:020 | Kicked",
	"I:024 | Logged out",
	"E:119 | IP Blocked",
];

let _user = unloadedProfile();
let _userLoaded = false;
user.subscribe(v => {
	if (_userLoaded) {
		_user = v;
		if (_user.theme.startsWith("custom:")) {
			try {
				applyTheme(stringToTheme(_user.theme));
			} catch (e) {
				console.error(`Failed to apply custom theme: ${e}`);
				removeTheme();
			}
		} else {
			removeTheme();
		}
		localStorage.setItem(
			"meower_savedconfig",
			JSON.stringify({
				theme: _user.theme,
				mode: _user.mode,
				sfx: _user.sfx,
				bgm: _user.bgm,
				bgm_song: _user.bgm_song,
				layout: _user.layout,
			})
		);
	} else {
		_user = v;
		_userLoaded = true;
	}
});

let _authHeader = null;
authHeader.subscribe(v => {
	_authHeader = v;
	if (_authHeader.username && _authHeader.token) {
		localStorage.setItem("meower_savedusername", _authHeader.username);
		localStorage.setItem("meower_savedpassword", _authHeader.token);
	}
});

let _relationships = null;
relationships.subscribe(v => (_relationships = v));

let _chats = null;
chats.subscribe(v => (_chats = v));

/**
 * Listens to username and token updates that could happen by other tabs.
 */
addEventListener("storage", event => {
	if (event.key === "meower_savedusername") {
		if (event.newValue !== _authHeader.username) {
			authHeader.set({
				..._authHeader,
				username: event.newValue,
			});
			link.disconnect(1000, "Intentional disconnect");
		}
	} else if (event.key === "meower_savedpassword") {
		if (event.newValue !== _authHeader.token) {
			authHeader.set({
				..._authHeader,
				token: event.newValue,
			});
		}
	}
});

// Load saved config from local storage
if (localStorage.getItem("meower_savedconfig")) {
	const savedConfig = JSON.parse(localStorage.getItem("meower_savedconfig"));
	_user.theme = savedConfig.theme;
	_user.mode = savedConfig.mode;
	_user.sfx = savedConfig.sfx;
	_user.bgm = savedConfig.bgm;
	_user.bgm_song = savedConfig.bgm_song;
	_user.layout = savedConfig.layout;
	user.set(_user);
}

export function fix_ulist_blocked_users(_ulist) {
	if (_user.hide_blocked_users) {
		_ulist = _ulist.filter(
			theuser => _relationships[theuser] !== 2
		);
	}
	return _ulist
}

/**
 * The single CloudLink instance used by the manager.
 */
export const link = new Cloudlink();
// @ts-ignore
window.cljs = link;

link.log("manager", "started");

/**
 * A variable used to keep track of the manager's main connect event.
 * @type any
 */
let connectEvent = null;
/**
 * A variable used to keep track of the manager's main disconnect event.
 * @type any
 */
let disconnectEvent = null;
/**
 * A variable used to keep track of the manager's main ulist event.
 * @type any
 */
let ulistEvent = null;
/**
 * A variable used to keep track of the manager's main auth event.
 * @type any
 */
let authEvent = null;
/**
 * A variable used to keep track of banned events.
 * @type any
 */
let bannedEvent = null;
/**
 * A variable used to keep track of new inbox messages.
 * @type any
 */
let inboxMessageEvent = null;
/**
 * A variable used to keep track of relationship state updates.
 */
let relationshipUpdateEvent = null;
/**
 * A variable used to keep track of user config updates.
 * @type any
 */
let configUpdateEvent = null;
/**
 * A variable used to keep track of chat creations.
 * @type any
 */
let chatCreateEvent = null;
/**
 * A variable used to keep track of chat updates.
 * @type any
 */
let chatUpdateEvent = null;
/**
 * A variable used to keep track of chat deletes.
 * @type any
 */
let chatDeleteEvent = null;
/**
 * A variable used to keep track of chat messages to open DMs if it's not already open.
 * @type any
 */
let chatMsgEvent = null;
/**
 * A variable used to keep track of any disconnection requests.
 * @type any
 */
let disconnectRequest = null;
/**
 * A variable used to keep track of the manager's pinger interval.
 * @type any
 */
let pingInterval = null;

/**
 * Connect to the server, initializing some other things such as pinging.
 *
 * @returns {Promise<string>} statusCode A status code.
 */
export async function connect() {
	if (connectEvent) {
		link.off(connectEvent);
		disconnectEvent = null;
	}
	if (disconnectEvent) {
		link.off(disconnectEvent);
		disconnectEvent = null;
	}
	if (ulistEvent) {
		link.off(ulistEvent);
		ulistEvent = null;
	}
	if (authEvent) {
		link.off(authEvent);
		authEvent = null;
	}
	if (bannedEvent) {
		link.off(bannedEvent);
		bannedEvent = null;
	}
	if (inboxMessageEvent) {
		link.off(inboxMessageEvent);
		inboxMessageEvent = null;
	}
	if (relationshipUpdateEvent) {
		link.off(relationshipUpdateEvent);
		relationshipUpdateEvent = null;
	}
	if (configUpdateEvent) {
		link.off(configUpdateEvent);
		configUpdateEvent = null;
	}
	if (chatCreateEvent) {
		link.off(chatCreateEvent);
		chatCreateEvent = null;
	}
	if (chatUpdateEvent) {
		link.off(chatUpdateEvent);
		chatUpdateEvent = null;
	}
	if (chatDeleteEvent) {
		link.off(chatDeleteEvent);
		chatDeleteEvent = null;
	}
	if (chatMsgEvent) {
		link.off(chatMsgEvent);
		chatMsgEvent = null;
	}
	if (disconnectRequest) {
		link.off(disconnectRequest);
		disconnectRequest = null;
	}
	if (pingInterval) {
		clearInterval(pingInterval);
		pingInterval = null;
	}

	disconnected.set(false);
	disconnectReason.set("");

	connectEvent = link.on("connected", () => {
		disconnected.set(false);
		pingInterval = setInterval(() => {
			link.send({cmd: "ping", val: ""});
		}, 10000);
	});
	disconnectEvent = link.on("disconnected", async e => {
		// make sure connection was started (we can know by checking if pingInterval is set)
		if (!pingInterval) return;

		// clear ping interval
		clearInterval(pingInterval);
		pingInterval = null;

		// show disconnected modal if disconnect reason is set
		disconnectReason.subscribe(v => {
			if (v) {
				disconnected.set(true);
				return;
			}
		});

		let _intentionalDisconnect;
		intentionalDisconnect.subscribe(v => {
			_intentionalDisconnect = v;
		});
		if (_intentionalDisconnect) return;

		const onErrorEv = link.on("error", async e => {
			link.error("manager", "auto-reconnection failed:", e);
			reconnecting.set(true);
			try {
				await link.connect(linkUrl);
			} catch (e) {
				link.error("manager", "connection error:", e);
				link.off(onErrorEv);
				modals.showModal(ConnectionFailedModal);
			}
		});
		link.once("connected", async () => {
			link.log("manager", "connection restored");
			link.off(onErrorEv);

			// re-authenticate
			if (_authHeader.username && _authHeader.token) {
				try {
					await meowerRequest({
						cmd: "direct",
						val: {
							cmd: "authpswd",
							val: {
								username: _authHeader.username,
								pswd: _authHeader.token,
							},
						},
					});
				} catch (e) {
					console.error(e);
					modals.showModal(LoggedOutModal);
				}
			}

			// refresh screen
			screen.set("blank");
			await tick();
			screen.set("main");

			// hide modal
			reconnecting.set(false);
		});
		try {
			link.warn("manager", "connection lost with error:", e.code);
			await link.connect(linkUrl);
		} catch (e) {
			link.error("manager", "connection error:", e);
			link.off(onErrorEv);
			modals.showModal(ConnectionFailedModal);
		}
	});
	ulistEvent = link.on("ulist", cmd => {
		var _ulist = cmd.val.split(";");
		if (_ulist[_ulist.length - 1] === "") {
			_ulist.pop();
		}
		_ulist = fix_ulist_blocked_users(_ulist)
		ulist.set(_ulist);
	});
	authEvent = link.on("direct", async cmd => {
		if (cmd.val.mode === "auth") {
			// set user, auth header, and relationships
			user.update(v =>
				Object.assign(v, {
					...cmd.val.payload.account,
					name: cmd.val.payload.username,
				})
			);
			authHeader.set({
				username: cmd.val.payload.username,
				token: cmd.val.payload.token,
			});
			_relationships = {};
			for (let relationship of cmd.val.payload.relationships) {
				_relationships[relationship.username] = relationship.state;
			}
			relationships.set(_relationships);

			// get and set chats
			await tick();
			const resp = await fetch(`${apiUrl}chats?autoget=1`, {
				headers: _authHeader,
			});
			const json = await resp.json();
			chats.set(json.autoget);
		}
	});
	bannedEvent = link.on("direct", async cmd => {
		if (cmd.val.mode === "banned") {
			modals.showModal(AccountBannedModal, {ban: cmd.val.payload});
		}
	});
	inboxMessageEvent = link.on("direct", cmd => {
		if (cmd.val.mode === "inbox_message") {
			_user.unread_inbox = true;
			user.set(_user);
		}
	});
	relationshipUpdateEvent = link.on("direct", async cmd => {
		if (cmd.val.mode === "update_relationship") {
			_relationships[cmd.val.payload.username] = cmd.val.payload.state;
			relationships.set(_relationships);
			link.send({cmd: "get_ulist", val:""})
		}
	});
	configUpdateEvent = link.on("direct", async cmd => {
		if (cmd.val.mode === "update_config") {
			_user = {
				..._user,
				...cmd.val.payload,
			};
			user.set(_user);
			link.send({cmd: "get_ulist", val:""})
		}
	});
	chatCreateEvent = link.on("direct", cmd => {
		if (cmd.val.mode === "create_chat") {
			let itemIndex = _chats.findIndex(
				chat => chat._id === cmd.val.payload._id
			);
			if (itemIndex !== -1) return;
			_chats.push(cmd.val.payload);
			chats.set(_chats);
		}
	});
	chatUpdateEvent = link.on("direct", cmd => {
		if (cmd.val.mode === "update_chat") {
			let itemIndex = _chats.findIndex(
				chat => chat._id === cmd.val.payload._id
			);
			if (itemIndex === -1) return;
			_chats[itemIndex] = Object.assign(
				_chats[itemIndex],
				cmd.val.payload
			);
			chats.set(_chats);
		}
	});
	chatDeleteEvent = link.on("direct", cmd => {
		if (cmd.val.mode === "delete") {
			_chats = _chats.filter(chat => chat._id !== cmd.val.id);
			chats.set(_chats);
		}
	});
	chatMsgEvent = link.on("direct", async cmd => {
		if (cmd.val.state === 2 && cmd.val.post_origin !== "livechat") {
			let chatIndex = _chats.findIndex(
				chat => chat._id === cmd.val.post_origin
			);
			if (chatIndex === -1) {
				try {
					const resp = await fetch(
						`${apiUrl}chats/${cmd.val.post_origin}`,
						{
							method: "GET",
							headers: _authHeader,
						}
					);
					if (!resp.ok) {
						throw new Error(
							"Response code is not OK; code is " + resp.status
						);
					}
					const chat = await resp.json();
					_chats.push(chat);
					chats.set(_chats);
				} catch (e) {
					console.error(
						`Failed getting chat ${cmd.val.post_origin}: ${e}`
					);
				}
			} else {
				_chats[chatIndex].last_active = cmd.val.t.e;
				chats.set(_chats);
			}
		}
	});
	disconnectRequest = link.on("direct", async cmd => {
		if (disconnectCodes.includes(cmd.val)) {
			link.log("manager", "Requested disconnect:", cmd.val);
			modals.showModal(LoggedOutModal);
			await disconnect();
		}
	});

	disconnected.set(false);
	try {
		return await link.connect(linkUrl);
	} catch (e) {
		link.error("manager", "connection error:", e);
		modals.showModal(ConnectionFailedModal);
		return e;
	}
}

/**
 * Safely disconnect from the server.
 */
export async function disconnect() {
	if (!link.ws) {
		link.log(
			"manager",
			"websocket not present, cancelling safe disconnect"
		);
		return new Promise(r => r());
	}
	if (link.ws.readyState !== 1) {
		link.log(
			"manager",
			"already disconnected or disconnecting, cancelling safe disconnect"
		);
		return new Promise(r => r());
	}
	link.log("manager", "safely disconnecting");
	intentionalDisconnect.set(true);
	return new Promise(resolve => {
		link.once("disconnected", resolve);
		link.disconnect(1000, "Intentional disconnect");
	});
}

/**
 * Send a "Meower request" - a packet that makes the server respond with a direct and a statuscode packet.
 *
 * @param {object} data
 * @returns {Promise<object | string>} Either an object representing the direct command's val parameter (if it resolves), or an error code as a string (if it rejects).
 */
export async function meowerRequest(data) {
	link.log("manager", "meower request", data);
	spinner.set(true);
	return new Promise((resolve, reject) => {
		let returnData = null;
		const timer = setTimeout(() => {
			reject("Timed out");
			spinner.set(false);
		}, 10000);
		const ev = link.sendListener(
			{
				...data,
				listener: "listener_" + Math.floor(Math.random() * 10000000),
			},
			cmd => {
				if (cmd.cmd === "statuscode") {
					link.off(ev);
					spinner.set(false);

					clearTimeout(timer);

					if (cmd.val === "I:100 | OK") {
						resolve(returnData);
					} else {
						reject(cmd.val);
					}
				} else if (cmd.cmd === "direct") {
					returnData = cmd.val;
				}
			}
		);
	});
}

/**
 * Sends a request to update the user's settings.
 *
 * @returns {Promise<object | string>} Either an object or an error code; see meowerRequest.
 */
export async function updateProfile(updatedValues) {
	if (!_user.name) return;
	Object.assign(_user, updatedValues);
	user.set(_user);
	return fetch(`${apiUrl}me/config`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			..._authHeader,
		},
		body: JSON.stringify(updatedValues),
	});
}
