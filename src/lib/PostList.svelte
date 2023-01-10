<script>
	import {
		authHeader,
		user,
		ulist,
		spinner,
		lastTyped,
		mainPage as page,
	} from "../lib/stores.js";
	import {shiftHeld} from "../lib/keyDetect.js";
	import {playNotification} from "../lib/sounds.js";
	import PagedList from "../lib/PagedList.svelte";
	import Post from "../lib/Post.svelte";
	import TypingIndicator from "../lib/TypingIndicator.svelte";
	import * as clm from "../lib/clmanager.js";
	import {apiUrl, encodeApiURLParams} from "../lib/urls.js";

	export let fetchUrl = "home";
	export let postOrigin = "home";
	export let canPost = true;

	// @ts-ignore
	import {autoresize} from "svelte-textarea-autoresize";

	import {fly} from "svelte/transition";
	import {flip} from "svelte/animate";
	import {onDestroy} from "svelte";

	// comments probably from blocs:
	// import AddMember from "src/lib/modals/AddMember.svelte";
	// Zed just told me the cl4 port will move the mod panel to a seperate site

	let id = 0;
	let postErrors = "";

	// As we use a Load More button and the home is sorted newest-first,
	// we need an offset for posts to be continuous.
	let postOffset = 0;

	let postInput;

	// PagedList stuff
	let list;
	let items = [];

	/**
	 * Loads a page.
	 * @param {number} page
	 * @returns {Promise<{
	 * 	numPages: number,
	 * 	result: Array<import("./types.js").ListPost>
	 * }>}
	 */
	async function loadPage(page = 1) {
		let result;

		let numPages = 0;

		let path = `${fetchUrl}?page=`;
		if (encodeApiURLParams) path = encodeURIComponent(path);
		const resp = await fetch(`${apiUrl}${path}${page}`, {
			headers: $authHeader,
		});

		if (!resp.ok) {
			throw new Error(
				"Response code is not OK; code is " + resp.status
			);
		}
		/**
		 * @type {import("./types.js").ServerPostList}
		 */
		const json = await resp.json();

		/**
		 * @type {Array<import("./types.js").ListPost>}
		 */
		result = json.autoget.map(post => ({
			id: id++,
			post_id: post.post_id,
			user: post.u,
			content: post.p,
			date: post.t.e,
		}));

		return {
			numPages,
			result
		};
	}

	function post(url = "", data = {}) {
		fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
	}

	let destroy = () => {};
	onDestroy(() => destroy());

	/**
	 * Adds events to listen for live post updates.
	 */
	function listenOnLink() {
		const evId = clm.link.on("direct", cmd => {
			if (!cmd.val) return;
			if (!cmd.val.mode || !cmd.val.post_id) return;
			if (cmd.val.post_origin !== postOrigin) return;

			list.addItem({
				post_id: cmd.val._id,
				user: cmd.val.u,
				content: cmd.val.p,
				date: cmd.val.t.e,
			});

			if ($user.sfx && cmd.val.u !== $user.name) {
				playNotification();
			}
			if (cmd.val.mode === "delete") {
				items = items.filter(post => post.post_id !== cmd.val.id);
			}
		});
		destroy = () => clm.link.off(evId);
	}
	if (postOrigin) {
		if (clm.link.ws.readyState === 1) {
			listenOnLink();
		} else {
			clm.link.once("connected", listenOnLink);
		}
	}

	let _ulist = $ulist;
	ulist.subscribe(val => {
		_ulist = val;
	});
</script>

<div>
	<!-- I think we discussed that guest posting will not be in
		the official client, due to moderation reasons -->
	{#if canPost && $user.name}
		<form
			class="createpost"
			autocomplete="off"
			on:submit|preventDefault={/** @type {SubmitEvent} */e => {
				postErrors = "";

				// @ts-ignore
				const input = e.target.elements.input;
				// @ts-ignore
				const content = e.target.elements.input.value;
				// @ts-ignore
				const submitBtn = e.target.elements.submit;

				if (!content.trim()) {
					postErrors = "You cannot send an empty post!";
					return false;
				}

				spinner.set(true);


				submitBtn.disabled = true;
				if ($user.name) {
					clm.meowerRequest({
						cmd: "direct",
						val: {
							cmd: postOrigin === "home" ? "post_home" : "post_chat",
							val: postOrigin === "home" ? content : {
								p: content,
								chatiFd: postOrigin
							},
						},
					}).then(data => {
						submitBtn.disabled = false;

						if (data === "I:100 | OK" || !data) {
							input.value = "";
							input.rows = "1";
							input.style.height = "45px";
						} else if (
							data === "E:106 | Too many requests"
						) {
							postErrors = "You're posting too fast!";
						} else {
							postErrors =
								"Unexpected " + data + " error!";
						}
					});
					return false;
				} else {
					post("https://webhooks.meower.org/post/home", {
						post: content
					});
					submitBtn.disabled = false;
					input.value = "";
					input.rows = "1";
					input.style.height = "45px";
					spinner.set(false);
				}
			}}
		>
			<textarea
				type="text"
				class="white"
				placeholder="Write something..."
				name="input"
				autocomplete="false"
				maxlength="360"
				rows="1"
				use:autoresize
				on:input={() => {
					if ($lastTyped + 1500 < +new Date()) {
						lastTyped.set(+new Date());
						clm.link.send({
							cmd: "direct",
							val: {
								cmd: "set_chat_state",
								val: {
									chatid: "livechat",
									state: 101,
								},
							},
							listener: "typing_indicator",
						});
					}
				}}
				on:keydown={event => {
					if (event.key == "Enter" && !shiftHeld) {
						event.preventDefault();
						document.getElementById("submitpost").click();
					}
				}}
				bind:this={postInput}
			/>
			<button name="submit">Post</button>
		</form>
	{/if}
	<div class="post-errors">{postErrors}</div>
	<TypingIndicator />
	<PagedList
		bind:items
		{loadPage}
		bind:this={list}
	>
		<svelte:fragment slot="loaded" let:items>
			{#each items as post (post.id)}
				<div
					transition:fly|local={{y: -50, duration: 250}}
					animate:flip={{duration: 250}}
				>
					<Post {post} input={postInput} />
				</div>
			{/each}
		</svelte:fragment>
		<svelte:fragment slot="error" let:error>
			Error loading posts. Please try again.
			<pre><code>{error}</code></pre>
		</svelte:fragment>
		<svelte:fragment slot="empty">
			{#if $user.name}
				No posts here. Check back later or be the first to post!
			{:else}
				No posts here. Check back later!
			{/if}
		</svelte:fragment>
	</PagedList>
</div>

<style>
	.createpost {
		display: flex;
		margin-bottom: 0.5em;
	}
	.createpost textarea {
		flex-grow: 1;
		margin-right: 0.25em;
		resize: none;
		max-height: 300px;
	}

	.post-errors {
		color: red;
		font-size: 75%;
		font-weight: bold;
		margin: 0.25em 0;
	}
</style>
