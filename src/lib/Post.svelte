<!-- A post. Profile pictures not appearing while not logged in is intentional. -->
<script>
	import Container from "../lib/Container.svelte";
	import PFP from "../lib/PFP.svelte";
	import FormattedDate from "./FormattedDate.svelte";
	import Badge from "./Badge.svelte";

	import {
		profileClicked,
		postClicked,
		user,
		chatid,
		ulist,
		mainPage as page,
		modalShown,
		modalPage,
	} from "../lib/stores.js";
	import {shiftHeld} from "../lib/keyDetect.js";
	import * as clm from "../lib/clmanager.js";

	import {default as loadProfile, profileCache} from "../lib/loadProfile.js";

	import {onMount} from "svelte";

	export let post = {};
	export let buttons = true;
	export let input = null;

	let bridged = false;
	let webhook = false;

	let images = [];

	// IP grabber sites exist, and I don't know if hosting a proxy is feasible
	// WARNING: Put a / at the end of each URL so it can't be bypassed
	// (like https://http.meower.org@evilsite.bad)!
	const IMAGE_HOST_WHITELIST = [
		// Meower
		"https://http.meower.org/",
		"https://assets.meower.org/",
		"https://api.meower.org/",
		"https://forums.meower.org/",
		// not everyone can add urls to go.meower.org, should be fine
		"https://go.meower.org/",

		// cubeupload
		"https://u.cubeupload.com/",
		"https://cubeupload.com/",

		// imgBB
		"https://i.ibb.co/",

		// Tenor
		"https://media.tenor.com/",
		"https://tenor.com/",
		"https://c.tenor.com/",

		// Scratch (assets file uploading exists)
		"https://assets.scratch.mit.edu/",
		"https://cdn2.scratch.mit.edu/",
		"https://cdn.scratch.mit.edu/",
		"https://uploads.scratch.mit.edu/",

		// Discord
		"https://cdn.discordapp.com/",
	];

	// TODO: make bridged tag a setting

	// TODO: more then 1 img + optimize getimgs function

	/**
	 * Initialize this post's special behavior (user profile, images)).
	 */
	function initPostUser() {
		if (!post.user) return;

		if (post.content.includes(":")) {
			bridged = post.user === "Discord";
			webhook = post.user == "Webhooks";
		}

		if (bridged || webhook) {
			post.user = post.content.split(": ")[0];
			post.content = post.content.slice(post.content.indexOf(": ") + 1);
		}

		// Match image syntax
		// ([title: https://url])
		const iterator = post.content.matchAll(
			/\[([^\]]+?): (https:\/\/[^\]]+?)\]/gs
		);
		images = [];
		while (true) {
			const result = iterator.next();
			if (result.done) break;

			try {
				new URL(result.value[2]);
			} catch (e) {
				continue;
			}

			images.push({
				title: result.value[1],
				url: result.value[2],
			});
			// Prevent flooding
			if (images.length >= 3) break;
		}
		images = images;

		if (!webhook) loadProfile(post.user);
	}
	onMount(initPostUser);
</script>

<Container>
	<div class="post-header">
		<div class="settings-controls">
			{#if buttons && $user.name && $chatid !== "livechat" && post.user !== "Server"}
				{#if input && post.user !== "Notification" && post.user !== "Announcement"}
					<button
						class="circle join"
						on:click={() => {
							let existingText = input.value;

							const mentionRegex = /^@\w+\s*/i;
							const mention = "@" + post.user + " ";

							if (mentionRegex.test(existingText)) {
								input.value = existingText
									.trim()
									.replace(mentionRegex, mention);
							} else {
								input.value = mention + existingText.trim();
							}

							input.focus();
						}}
					/>
				{/if}
				{#if $user.lvl >= 1 || post.user === $user.name}
					<button
						class="circle close"
						on:click={() => {
							if (shiftHeld) {
								clm.meowerRequest({
									cmd: "direct",
									val: {
										cmd: "delete_post",
										val: post.post_id,
									},
								});
								return;
							}
							postClicked.set(post);
							modalPage.set("deletePost");
							modalShown.set(true);
						}}
					/>
				{:else}
					<button
						class="circle report"
						on:click={() => {
							postClicked.set(post);
							modalPage.set("reportPost");
							modalShown.set(true);
						}}
					/>
				{/if}
			{/if}
		</div>
		<button
			class="pfp"
			on:click={() => {
				if (
					post.user === "Notification" ||
					post.user === "Announcement" ||
					post.user === "Server" ||
					webhook
				)
					return;
				profileClicked.set(post.user);
				page.set("profile");
			}}
		>
			<PFP
				icon={$profileCache[post.user] && !webhook
					? $profileCache[post.user].pfp_data
					: -3}
				alt="{post.user}'s profile picture"
				online={$ulist.includes(post.user)}
			/>
		</button>
		<div class="creatordate">
			<div class="creator">
				<h2>
					{post.user}
				</h2>

				{#if bridged}
					<Badge
						text="BRIDGED"
						title="This post is a post bridged from a Discord server by the @Discord bot"
					/>
				{/if}

				{#if webhook}
					<Badge
						text="WEBHOOK"
						title="This post was posted by the @Webhooks bot. The username may not mean the user actually posted it!"
					/>
				{/if}

				<!-- disabled until proper bot badges are added
				{#if post.isvbot && !webhook}
					<Badge
						text="BOT"
						title="This bot has been verified"
						checkmark={true}
					/>
				{/if}

				{#if post.isuvbot && !webhook}
					<Badge text="BOT" title="This bot has not been verified" />
				{/if}
				-->
			</div>

			<FormattedDate date={post.date} />
		</div>
	</div>
	<p class="post-content">{post.content}</p>
	<div class="post-images">
		{#each images as { title, url }}
			<a href={url} target="_blank"
				><img
					src={url}
					alt={title}
					title="{title} ({url})"
					class="post-image"
				/></a
			>
		{/each}
	</div>
</Container>

<style>
	.pfp {
		margin-right: 0.2em;
		padding: 0;
		border: none;
		background: none !important;
		color: inherit;
	}
	.post-header {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		max-width: 100%;
	}

	.creatordate {
		margin-left: 0.5em;
	}
	.creator {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5em;
	}
	.creator h2 {
		font-size: 200%;
		margin: 0;
		overflow-wrap: anywhere;
	}
	:global(main.input-hover) .pfp:hover:not(:active) :global(.pfp),
	:global(main.input-touch) .pfp:active :global(.pfp),
	.pfp:focus-visible :global(.pfp) {
		transform: scale(1.1);
	}
	.post-content {
		white-space: pre-wrap;
	}
	.settings-controls {
		position: absolute;
		top: 0.25em;
		right: 0.25em;
	}
	button.circle {
		border: none;
		margin: 0;
		margin-left: 0.125em;
	}

	.post-image {
		max-height: 12em;
		max-width: 100%;
	}

	.post-images {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25em;
	}
</style>
