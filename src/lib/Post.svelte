<!-- A post. Profile pictures not appearing while not logged in is intentional. -->
<script>
	import Container from "../lib/Container.svelte";
	import PFP from "../lib/PFP.svelte";
	import FormattedDate from "./FormattedDate.svelte";
	import Badge from "./Badge.svelte";
	import LiText from "./LiText.svelte";
	import Attachment from "./Attachment.svelte";

	import ConfirmHyperlinkModal from "./modals/ConfirmHyperlink.svelte";
	import DeletePostModal from "./modals/DeletePost.svelte";
	import ReportPostModal from "./modals/safety/ReportPost.svelte";
	import ModeratePostModal from "./modals/moderation/ModeratePost.svelte";

	import {authHeader, user, chat, ulist} from "../lib/stores.js";
	import {adminPermissions, hasPermission} from "../lib/bitField.js";
	import {apiUrl} from "./urls.js";
	import {shiftHeld} from "../lib/keyDetect.js";
	import * as modals from "./modals.js";

	import {IMAGE_HOST_WHITELIST} from "./hostWhitelist.js";

	import {default as loadProfile} from "../lib/loadProfile.js";

	// @ts-ignore
	import {autoresize} from "svelte-textarea-autoresize";
	import MarkdownIt from "markdown-it";
	import twemoji from "twemoji";
	import {goto} from "@roxi/routify";
	import {onMount, tick} from "svelte";

	export let post = {
		content: ""
	};
	export let buttons = true;
	export let input = null;
	export let adminView = false;

	let bridged = false;
	let webhook = false;

	let images = [];

	let editing = false;
	let editError = "";
	let editContentInput, editSaveButton;

	let deleteButton;

	let adminDeleteButton, adminRestoreButton;

	// TODO: make bridged tag a setting

	/**
	 * Initialize this post's special behavior (user profile, images)).
	 */
	export async function initPostUser() {
		if (!post.user) return;

		if (post.content.includes(":")) {
			bridged =
				post.user === "Discord" ||
				post.user === "revolt" ||
				post.user === "Revower";
			webhook = post.user == "Webhooks";
		}

		if (bridged || webhook) {
			post.user = post.content.split(": ")[0];
			post.content = post.content.slice(post.content.indexOf(": ") + 2);
		}

		if (!webhook) loadProfile(post.user);
	}

	$: {
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

			if (
				IMAGE_HOST_WHITELIST.some(o =>
					result.value[2].toLowerCase().startsWith(o.toLowerCase())
				)
			) {
				images.push({
					title: result.value[1],
					url: result.value[2],
				});

				if (images.length >= 3) break;
			}
		}
	}

	function confirmLink(link) {
		if (
			link.startsWith(
				`${window.location.protocol}//${window.location.host}`
			) ||
			link.startsWith(window.location.host)
		) {
			$goto(
				link
					.replace(
						`${window.location.protocol}//${window.location.host}`,
						""
					)
					.replace(window.location.host, "")
			);
		} else {
			modals.showModal(ConfirmHyperlinkModal, {link});
		}
		return false;
	}
	// @ts-ignore
	window.confirmLink = confirmLink;

	/** @param {string} content */
	async function addFancyElements(content) {
		// markdown (which has HTML escaping built-in)
		var renderedContent;

		try {
			const md = new MarkdownIt("default", {
				breaks: true,
				linkify: true,
				typographer: true,
			});
			md.linkify.add("@", {
				validate: function (text, pos) {
					var tail = text.slice(pos);
					return tail.match(/[a-zA-Z0-9-_]{1,20}/gs)[0].length;
				},
				normalize: function (match) {
					match.url =
						window.location.host +
						"/users/" +
						match.url.replace(/^@/, "");
				},
			});
			const tokens = md.parse(
				content
					.replaceAll(/\[([^\]]+?): (https:\/\/[^\]]+?)\]/gs, "")
					.replaceAll(/\*\*\*\*/gs, "\\*\\*\\*\\*"),
				{}
			);
			for (const token of tokens) {
				if (token.children) {
					for (const childToken of token.children) {
						if (childToken.type === "image") {
							const srcPos = childToken.attrs.findIndex(
								attr => attr[0] === "src"
							);
							if (
								!IMAGE_HOST_WHITELIST.some(o =>
									childToken.attrs[srcPos][1]
										.toLowerCase()
										.startsWith(o.toLowerCase())
								)
							) {
								childToken.attrs[srcPos][1] = "about:blank";
								console.log(childToken);
							}
						}
						if (childToken.type === "link_open") {
							const href = childToken.attrs.find(
								attr => attr[0] === "href"
							)[1];
							childToken.attrs.push([
								"onclick",
								`return confirmLink('${href}')`,
							]);
						}
					}
				}
			}

			renderedContent = md.renderer.render(tokens, md.options);

			// add quote containers to blockquotes (although, quotes are currently broken)
			renderedContent = renderedContent.replaceAll(
				/<blockquote>(.+?)<\/blockquote>/gms,
				'<blockquote><p>$1</p></blockquote>'
			);

			if ($user.embeds_enabled) {
				let youtubeMatches = [
					...new Set(
						content.match(
							/(\<|)(http|https):\/\/(www.youtube.com\/watch\?v=|youtube.com\/watch\?v=|youtu.be\/)(\S{11})(\>|)?/gm
						)
					),
				];
				for (const watchURL of youtubeMatches) {
					if (watchURL.startsWith("<") && watchURL.endsWith(">"))
						continue;
					let response = await (
						await fetch(
							`https://youtube.com/oembed?url=${watchURL}`
						)
					).json();
					renderedContent += `<div class="youtube-container">
						<h4>${response.title}</h4>
						<span style="color: #606060; font-size: 1.1rem">${response.author_name}</span><br><br>
						<img src="${response.thumbnail_url}" height=180 width=240 loading="lazy" alt="Thumbnail for ${response.title}">
					</div>`;
				}
			}
		} catch (e) {
			// this is to stop any possible XSS attacks by bypassing the markdown lib
			// which is responsible for escaping HTML
			return `Failed rendering post: ${e}`;
		}

		// twemoji
		renderedContent = twemoji.parse(renderedContent, {
			folder: "svg",
			ext: ".svg",
			size: 20,
		});

		return renderedContent;
	}

	async function adminDelete() {
		adminDeleteButton.disabled = true;
		try {
			const resp = await fetch(`${apiUrl}admin/posts/${post.post_id}`, {
				method: "DELETE",
				headers: $authHeader,
			});
			if (!resp.ok) {
				throw new Error(
					"Response code is not OK; code is " + resp.status
				);
			}
			post.isDeleted = true;
			post.mod_deleted = true;
			post.deleted_at = Math.floor(Date.now() / 1000);
		} catch (e) {
			editError = e;
		}
		adminDeleteButton.disabled = false;
	}

	async function adminRestore() {
		adminRestoreButton.disabled = true;
		try {
			const resp = await fetch(
				`${apiUrl}admin/posts/${post.post_id}/restore`,
				{
					method: "POST",
					headers: $authHeader,
				}
			);
			if (!resp.ok) {
				throw new Error(
					"Response code is not OK; code is " + resp.status
				);
			}
			post.isDeleted = false;
			post.mod_deleted = null;
			post.deleted_at = null;
		} catch (e) {
			editError = e;
		}
		adminRestoreButton.disabled = false;
	}

	onMount(initPostUser);

	$: noPFP =
		post.user === "Notification" ||
		post.user.startsWith("Notification to ") ||
		post.user === "Announcement" ||
		post.user === "Server" ||
		webhook;
</script>

<Container>
	<div class="post-header">
		{#if buttons}
			<div class="settings-controls">
				{#if adminView && hasPermission(adminPermissions.DELETE_POSTS)}
					{#if post.isDeleted}
						<button
							class="circle restore"
							title="Restore post"
							bind:this={adminRestoreButton}
							on:click={adminRestore}
						/>
					{:else}
						<button
							class="circle trash"
							title="Delete post"
							bind:this={adminDeleteButton}
							on:click={adminDelete}
						/>
					{/if}
				{:else if !adminView}
					{#if !editing && hasPermission(adminPermissions.VIEW_POSTS)}
						<button
							class="circle admin"
							on:click={() =>
								modals.showModal(ModeratePostModal, {
									postid: post.post_id,
								})}
						/>
					{/if}
					{#if input && !input.disabled && !noPFP && !editing}
						{#if post.user === $user.name}
							{#if !bridged}
								<button
									class="circle pen"
									on:click={async () => {
										editError = "";
										editing = true;
										await tick();
										editContentInput.value =
											post.unfiltered_content || post.content;
										editContentInput.focus();
										autoresize(editContentInput);
									}}
								/>
							{:else}
								<button
									class="circle pen"
									disabled
									title="You cannot edit bridged messages."
								/>
							{/if}
						{/if}
						<button
							class="circle reply"
							on:click={() => {
								let existingText = input.value.trim();

								const mentionRegex = /^@\w+\s*/i;
								const mention = "@" + post.user + " ";

								if (mentionRegex.test(existingText)) {
									existingText = existingText
										.trim()
										.replace(mentionRegex, mention);
								} else {
									existingText = mention + existingText.trim();
								}
								existingText += "\n";
								let snipped = false;
								/* @type {string[]} */
								let iter = post.content.split("\n");


								iter.forEach(element => {

									if (element.replaceAll(/\s/g, '').startsWith(">")) {
										if (!snipped) {
											snipped = true;
											existingText += "> > [snip]\n";
											return;
										}
										return;
									}
									snipped = false;
									existingText += "> " + element + "\n";
								});
								existingText += "\n";
								input.value = existingText;

								input.focus();
							}}
						/>
						{#if post.user === $user.name || (post.post_origin === $chat._id && $chat.owner === $user.name)}
							{#if !bridged}
								<button
									class="circle trash"
									bind:this={deleteButton}
									on:click={async () => {
										if (shiftHeld) {
											deleteButton.disabled = true;
											try {
												const resp = await fetch(
													`${apiUrl}posts?id=${post.post_id}`,
													{
														method: "DELETE",
														headers: $authHeader,
													}
												);
												if (!resp.ok) {
													if (resp.status === 429) {
														throw new Error(
															"Too many requests! Try again later."
														);
													}
													throw new Error(
														"Response code is not OK; code is " +
															resp.status
													);
												}
											} catch (e) {
												editError = e;
											}
											deleteButton.disabled = false;
										} else {
											modals.showModal(DeletePostModal, {
												post,
											});
										}
									}}
								/>
							{:else}
								<button
									class="circle trash"
									disabled
									title="You cannot delete bridged messages."
								/>
							{/if}
						{:else}
							<button
								class="circle report"
								on:click={() =>
									modals.showModal(ReportPostModal, {post})}
							/>
						{/if}
					{/if}
				{/if}
			</div>
		{/if}
		<button
			class="pfp"
			on:click={async () => {
				if (noPFP) return;
				$goto(`/users/${post.user}`);
			}}
		>
			{#await noPFP ? Promise.resolve(true) : loadProfile(post.user)}
				<PFP
					icon={-2}
					alt="{post.user}'s profile picture"
					online={$ulist.includes(post.user)}
				/>
			{:then profile}
				<PFP
					icon={noPFP
						? post.user === "Server"
							? 102
							: post.post_origin === "inbox" &&
							  (post.user === "Announcement" ||
									post.user === "Notification" ||
									post.user.startsWith("Notification to"))
							? 101
							: -2
						: profile.pfp_data}
					alt="{post.user}'s profile picture"
					online={$ulist.includes(post.user)}
				/>
			{:catch}
				<PFP
					icon={-2}
					alt="{post.user}'s profile picture"
					online={$ulist.includes(post.user)}
				/>
			{/await}
		</button>
		<div class="creatordate">
			<div class="creator">
				<h2>
					<LiText text={post.user} />
				</h2>

				{#if bridged}
					<Badge
						text="BRIDGED"
						title="This post is bridged from an external service by a bot"
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
			{#if post.edited_at}
				<i
					>(<FormattedDate
						date={post.edited_at}
						customText="edited"
					/>)</i
				>
			{/if}
			{#if post.isDeleted && post.mod_deleted}
				<i
					>(<FormattedDate
						date={post.deleted_at}
						customText="deleted by moderator"
					/>)</i
				>
			{:else if post.isDeleted}
				<i
					>(<FormattedDate
						date={post.deleted_at}
						customText="self-deleted"
					/>)</i
				>
			{/if}
		</div>
	</div>
	{#if editing}
		<textarea
			type="text"
			class="white"
			name="input"
			autocomplete="off"
			maxlength="4000"
			rows="1"
			bind:this={editContentInput}
			use:autoresize
			on:keydown={event => {
				if (event.key == "Enter" && !shiftHeld) {
					event.preventDefault();
					if (!editSaveButton.disabled) editSaveButton.click();
				} else if (event.key == "Escape") {
					editing = false;
				}
			}}
		/>
		<div style="display: flex; justify-content: space-between;">
			<button on:click={() => (editing = false)}>Cancel</button>
			<button
				bind:this={editSaveButton}
				on:click={async () => {
					if (editContentInput.value.trim() === "") {
						modals.showModal(DeletePostModal, {post});
						return;
					}

					editing = false;
					try {
						const resp = await fetch(
							`${apiUrl}posts?id=${post.post_id}`,
							{
								method: "PATCH",
								headers: {
									"Content-Type": "application/json",
									...$authHeader,
								},
								body: JSON.stringify({
									content: editContentInput.value,
								}),
							}
						);
						if (!resp.ok) {
							if (resp.status === 429) {
								throw new Error(
									"Too many requests! Try again later."
								);
							}
							throw new Error(
								"Response code is not OK; code is " +
									resp.status
							);
						}
					} catch (e) {
						editError = e;
					}
				}}>Save</button
			>
		</div>
	{:else}
		<p class="post-content" style="border-left-color: #4b5563;">
			{#await addFancyElements(post.content) then content}
				{@html content}
			{/await}
		</p>
	{/if}
	{#if editError}
		<p style="color: crimson;">{editError}</p>
	{/if}
	{#if !editing}
		<div class="post-images">
			{#each images as { title, url }}
				<Attachment {title} {url} />
			{/each}
		</div>
	{/if}
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

	.post-images {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25em;
	}

	textarea {
		margin-top: 0.5em;
		margin-bottom: 0.5em;
		width: 100%;
	}

	:global(.youtube-container) {
		border: solid 2px var(--orange);
		padding: 10px;
		border-radius: 10px;
		width: 50%;
	}


	:global(blockquote) {
		margin: 0.25em;
		border-left: 4px solid var(--orange-dark);
	}

	:global(blockquote p) {
		margin-left: 1em;
	}
	:global(blockquote blockquote) {
		margin-left: 1em;
	}

</style>
