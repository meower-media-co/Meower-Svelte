<script>
	import {scale} from "svelte/transition";
	import {height, updateSize} from "./../../lib/responsiveness.js";
	import {authHeader, chats, user} from "./../../lib/stores.js";
	import {apiUrl} from "../../lib/urls";
	import {params, goto} from "@roxi/routify";
	import {onMount} from "svelte";
	import Container from "../../lib/Container.svelte";
	import Spinner from "../../lib/Spinner.svelte";
	import {writable} from "svelte/store";
	import RescalebleImage from "../../lib/RescalebleImage.svelte";

	let ok = true;
	let errorText = "";

	function resizeContainer(node) {
		function updateHeight() {
			const childrenHeight = [...node.children].reduce(
				(acc, item) => acc + item.offsetHeight,
				0
			);
			node.style.setProperty("height", `${childrenHeight}px`);
		}

		const observer = new MutationObserver(mutations => {
			updateHeight();
		});
		observer.observe(node, {
			characterData: true,
			subtree: true,
			childList: true,
		});

		updateHeight();

		node.style.setProperty("overflow", "hidden");
		node.style.setProperty("transition", "height 300ms ease");

		return {
			destroy() {
				observer?.disconnect();
			},
		};
	}

	onMount(() => {
		(async () => {
			let response = await fetch(
				`${apiUrl}chats/join/${$params.invite}`,
				{
					method: "GET",
					headers: {
						...$authHeader,
					},
				}
			);
			if (!response.ok) {
				ok = false;
			}

			if (response.status === 404) {
				errorText = "Invite not found";
			} else if (response.status === 403) {
				errorText = "You are not allowed to join this chat";
			} else if (!response.ok) {
				errorText = `An unexpected error occurred: ${response.status}`;
			}

			let data = await response.json();

			// Cursed code because the server does not seem to want to send a packet
			let chat = $chats.findLast(chat => chat._id === data.chat);

			if (chat.members.indexOf($user.name) === -1)
				chat.members.push($user.name);

			$goto(`/chats/${data.chat}`);
		})();
	});
</script>

<div class="invite-center">
	<Container>
		{#if ok}
			<h1>Joining Invite...</h1>
			<Spinner />
		{:else}
			<h1>Uh Oh, somthing went wrong</h1>
			<span>{errorText}</span><br /><br />
			Maybe you wanted a cat picture instead? <br /><br />
			<RescalebleImage
				src="https://meower.org/assets/nova.png"
				alt="Nova the cat"
			/>
		{/if}
	</Container>
</div>

<style>
	.invite-center {
		display: flex;
		justify-content: center;
		align-items: center;
		width: auto;
		height: auto;
		position: relative;
		margin: 5px;
	}
	:global(.invite-center *) {
		position: relative;
		width: 100%;
		height: 100%;
	}
</style>
