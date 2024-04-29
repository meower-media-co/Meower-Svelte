<script>
// @ts-nocheck

	// @ts-ignore
	import Members from '../../../lib/settings/chats/Members.svelte';
	import {adminPermissions} from "./../../../lib/bitField.js";
	import {params, goto} from "@roxi/routify";
	import {onMount, onDestroy, prevent_default} from "svelte/internal";
	import {mobile} from "../../../lib/responsiveness.js";
	import {authHeader, chat, chats, user} from "../../../lib/stores.js";
	import Badge from "../../../lib/Badge.svelte";
	import Chat from "../../../assets/chat.svg";
	import * as modals from "../../../lib/modals.js";
	import BasicModal from "../../../lib/modals/Basic.svelte";

	import {
		User,
		Paintbrush,
		Lock,
		Smartphone,
		Contact,
		ShieldBan,
		Flag,
		Info,
	} from "lucide-svelte";
	import {apiUrl} from "../../../lib/urls.js";
	import {hasPermission} from "../../../lib/bitField.js";
	import Invites from "../../../lib/settings/chats/Invites.svelte";
	import Banned from "../../../lib/settings/chats/Banned.svelte";
	import Overview from '../../../lib/settings/chats/Overview.svelte';

	let showTabs = !$mobile;
	let hoveringTab = "";
	let selectedTab = $user.name ? "overview" : "appearance";

	export let chatid = $params.chatid;
	let resp;
	onMount(async () => {
		if (chatid === "livechat") {
			$goto("/chats");
		}
		try {
			if ($params.admin) {
				resp = await fetch(`${apiUrl}admin/chats/${$params.chatid}`, {
					headers: $authHeader,
				});
				if (!resp.ok) {
					throw new Error(
						"Response code is not OK; code is " + resp.status
					);
				}
			} else {
				resp = await fetch(`${apiUrl}chats/${$params.chatid}`, {
					headers: $authHeader,
				});
				if (!resp.ok) {
					if (resp.status === 404) {
						throw new Error(
							`The chat you requested (${$params.chatid}) doesn't exist or you don't have access to it.`
						);
					}
					throw new Error(
						"Response code is not OK; code is " + resp.status
					);
				}
			}
		} catch (e) {
			modals.showModal(BasicModal, {
				title: "Failed getting chat",
				desc: e,
			});
			return $goto("/chats");
		}

		chat.set(await resp.json());
		if (
			$chat.owner !== $user.name && !(hasPermission(adminPermissions.EDIT_CHATS) && $params.admin)
		) {
			$goto(`/chats/${$params.chatid}/`);
		}
	});
</script>

<div class="settings">
	<div id="tabs">
		<div class="top">
			<h2 class="tabs-title">Chat Settings</h2>
		</div>

		<div id="tabs-inner">
			{#if $user.name}
				<button
					class="tab-button"
					class:selected={selectedTab == "overview"}
					on:click={() => (selectedTab = "overview")}
					on:mouseenter={() => (hoveringTab = "overview")}
					on:mouseleave={() => (hoveringTab = "")}
					><img src={Chat} alt="Chat Icon"/>Overview</button
				>
			{/if}

			<button
				class="tab-button"
				class:selected={selectedTab == "invites"}
				on:click={() => (selectedTab = "invites")}
				on:mouseenter={() => (hoveringTab = "invites")}
				on:mouseleave={() => (hoveringTab = "")}
				><Paintbrush
					color={!$user.mode || selectedTab == "invites"
						? "#fff"
						: "#000"}
					strokeWidth="2.5"
				/>Invites</button
			>

			{#if $user.name}
				<hr style="width: 90%;" />

				<button
					class="tab-button"
					class:selected={selectedTab == "BannedUsers"}
					on:click={() => (selectedTab = "BannedUsers")}
					on:mouseenter={() => (hoveringTab = "BannedUsers")}
					on:mouseleave={() => (hoveringTab = "")}
					><ShieldBan
						color={!$user.mode || selectedTab == "BannedUsers"
							? "#fff"
							: "#000"}
						strokeWidth="2.5"
					/>Banned Users</button
				>

				<button
					class="tab-button"
					class:selected={selectedTab == "members"}
					on:click={() => (selectedTab = "members")}
					on:mouseenter={() => (hoveringTab = "members")}
					on:mouseleave={() => (hoveringTab = "")}
					><User
						color={!$user.mode || selectedTab == "members"
							? "#fff"
							: "#000"}
						strokeWidth="2.5"
					/>Members</button
				>
			{/if}
		</div>
	</div>

	<div id="chat" class:active={!showTabs}>
		{#if selectedTab == "invites"}
			<Invites />
		{:else if selectedTab == "BannedUsers"}
			<Banned />
		{:else if selectedTab == "members"}
			<Members />
		{:else if selectedTab == "overview"}
			<Overview />
		{/if}
	</div>
</div>

<style>
	.tab-button {
		width: 100%;

		background-color: transparent;
		color: var(--foreground);
		border: none;

		position: relative;
		text-align: left;

		cursor: pointer;

		display: flex;
		align-items: center;
		gap: 6px;
		flex-grow: 1;
		min-width: 0;

		margin: 0;
		margin-bottom: 4px;
	}

	.selected {
		background-color: var(--orange);
		cursor: default;
		color: var(--foreground-orange);
	}

	/* repetition because of CSS specificity */
	:global(main.input-hover) .tab-button.tab-button:hover,
	.tab-button.tab-button:focus-visible {
		background-color: #7773;
	}
	:global(#main) .tab-button.tab-button:active {
		background-color: #7776;
	}

	.settings {
		display: flex;
		flex-wrap: nowrap;
		flex-direction: row;
		gap: 0.4em;
	}
	#chat {
		flex-shrink: 1;
		flex-grow: 1;
		overflow: auto;
	}
	#tabs {
		height: var(--view-height);
		width: min(45%, 12em);

		background-color: var(--background);
		background-color: var(--background);
		border: solid 2px var(--orange);
		border-radius: 5px;
		box-sizing: border-box;

		position: sticky;
		top: 0;

		flex-shrink: 0;
		flex-grow: 0;
	}
	:global(#main.layout-mobile) #tabs {
		width: 100%;
	}
	#tabs-inner {
		position: relative;

		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: none;

		height: calc(100% - 2.25em);
		margin-top: 2.25em;

		padding-inline: 5px;
	}

	.top {
		position: absolute;
		top: 0;
		width: 100%;
	}

	.tabs-title {
		margin: 0.25em;
	}
</style>
