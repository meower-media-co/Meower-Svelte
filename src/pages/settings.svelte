<!-- Brand new settings experience! -->
<script>
	import { width } from './../lib/responsiveness.js';
	// @ts-nocheck

	import {mobile} from "../lib/responsiveness.js";
	import {user} from "../lib/stores.js";
	import Badge from "../lib/Badge.svelte";

	import {
		User,
		Paintbrush,
		Lock,
		ShieldBan,
		Flag,
		Info,
	} from "lucide-svelte";

	import Profile from "../lib/settings/Profile.svelte";
	import Personalization from "../lib/settings/Personalization.svelte";
	import Security from "../lib/settings/Security.svelte";
	import Sessions from "../lib/settings/Sessions.svelte";
	import ParentalControls from "../lib/settings/ParentalControls.svelte";
	import BlockedUsers from "../lib/settings/BlockedUsers.svelte";
	import ReportHistory from "../lib/settings/ReportHistory.svelte";
	import About from "./about.svelte";

	let showTabs = !$mobile;
	let hoveringTab = "";
	let selectedTab = $user.name ? "profile" : "appearance";
</script>

<div class="settings">
	<div id="tabs">
		<div class="top">
			<h2 class="tabs-title">
				Settings <Badge
					text="BETA"
					title="The new settings experience is currently in beta."
					small={true}
				/>
			</h2>
		</div>

		<div id="tabs-inner">
			{#if $user.name}
				<button
					class="tab-button"
					class:selected={selectedTab == "profile"}
					on:click={() => (selectedTab = "profile")}
					on:mouseenter={() => (hoveringTab = "profile")}
					on:mouseleave={() => (hoveringTab = "")}
					><User
						color={!$user.mode || selectedTab == "profile"
							? "#fff"
							: "#000"}
						strokeWidth="2.5"
					/>Profile</button
				>
			{/if}
			<button
				class="tab-button"
				class:selected={selectedTab == "personalization"}
				on:click={() => (selectedTab = "personalization")}
				on:mouseenter={() => (hoveringTab = "personalization")}
				on:mouseleave={() => (hoveringTab = "")}
				><Paintbrush
					color={!$user.mode || selectedTab == "personalization"
						? "#fff"
						: "#000"}
					strokeWidth="2.5"
				/>Personalization</button
			>

			{#if $user.name}
				<hr style="width: 90%;" />

				<button
					class="tab-button"
					class:selected={selectedTab == "security"}
					on:click={() => (selectedTab = "security")}
					on:mouseenter={() => (hoveringTab = "security")}
					on:mouseleave={() => (hoveringTab = "")}
					><Lock
						color={!$user.mode || selectedTab == "security"
							? "#fff"
							: "#000"}
						strokeWidth="2.5"
					/>Security & Privacy</button
				>
				<!-- this is for once we have the auth server ready
                <button
                    class="tab-button"
                    class:selected={selectedTab == "sessions"}
                    on:click={() => selectedTab = "sessions"}
                    on:mouseenter={() => hoveringTab = "sessions"}
                    on:mouseleave={() => hoveringTab = ""}
                    ><Smartphone
                        color={!$user.mode ||
                        selectedTab == "sessions" ||
                        hoveringTab == "sessions"
                            ? "#fff"
                            : "#000"}
                        strokeWidth="2.5"
                    />Sessions</button
                >
                <button
                    class="tab-button"
                    class:selected={selectedTab == "parentalControls"}
                    on:click={() => selectedTab = "parentalControls"}
                    on:mouseenter={() => hoveringTab = "parentalControls"}
                    on:mouseleave={() => hoveringTab = ""}
                    ><Contact
                        color={!$user.mode ||
                        selectedTab == "parentalControls" ||
                        hoveringTab == "parentalControls"
                            ? "#fff"
                            : "#000"}
                        strokeWidth="2.5"
                    />Parental Controls</button
                >
                -->

				<hr style="width: 88%;" />

				<button
					class="tab-button"
					class:selected={selectedTab == "blockedUsers"}
					on:click={() => (selectedTab = "blockedUsers")}
					on:mouseenter={() => (hoveringTab = "blockedUsers")}
					on:mouseleave={() => (hoveringTab = "")}
					><ShieldBan
						color={!$user.mode || selectedTab == "blockedUsers"
							? "#fff"
							: "#000"}
						strokeWidth="2.5"
					/>Blocked Users</button
				>
				<button
					class="tab-button"
					class:selected={selectedTab == "reportHistory"}
					on:click={() => (selectedTab = "reportHistory")}
					on:mouseenter={() => (hoveringTab = "reportHistory")}
					on:mouseleave={() => (hoveringTab = "")}
					><Flag
						color={!$user.mode || selectedTab == "reportHistory"
							? "#fff"
							: "#000"}
						strokeWidth="2.5"
					/>Report History</button
				>
			{/if}

			<hr style="width: 88%;" />

			<button
				class="tab-button"
				class:selected={selectedTab == "about"}
				on:click={() => (selectedTab = "about")}
				on:mouseenter={() => (hoveringTab = "about")}
				on:mouseleave={() => (hoveringTab = "")}
				><Info
					color={!$user.mode || selectedTab == "about"
						? "#fff"
						: "#000"}
					strokeWidth="2.5"
				/>About</button
			>
		</div>
	</div>

	<div id="chat" class:active={!showTabs}>
		{#if selectedTab == "profile"}
			<Profile />
		{:else if selectedTab == "personalization"}
			<Personalization />
		{:else if selectedTab == "security"}
			<Security />
		{:else if selectedTab == "sessions"}
			<Sessions />
		{:else if selectedTab == "parentalControls"}
			<ParentalControls />
		{:else if selectedTab == "blockedUsers"}
			<BlockedUsers />
		{:else if selectedTab == "reportHistory"}
			<ReportHistory />
		{:else if selectedTab == "about"}
			<About />
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

	@media (max-width: 800px) {
		.settings {
			flex-direction: column;
		}
		#tabs {
			position: relative;
			/* the tabs should take up minumum space */
			min-height: fit-content;
			height: fit-content;
		}


		#chat {
			flex-grow: 0;
			flex-shrink: 0;
			flex-wrap: wrap;
			width: 100%;
			height: auto;
			border: none;
			border-top: solid 2px var(--orange);
		}

		:global(* .settings .profile-username) {

			word-wrap:  break-word;
			word-break: break-all;
		}

		:global(* .settings .profile-header-info) {
			height: fit-content;
		}
	}
</style>
