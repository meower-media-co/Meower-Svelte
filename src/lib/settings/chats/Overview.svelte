<script>
	import { chat } from './../../stores.js';
	import Container from "../../Container.svelte";
	import { authHeader } from "../../stores.js";
	import { apiUrl } from "../../urls.js";
	import { params } from '@roxi/routify';
	let nickname = $chat.nickname;
	let loading, error;

</script>

<Container>
	<h2> Chat Overview </h2>
	<form
	on:change={() => (error = "")}
	on:submit|preventDefault={async () => {
		loading = true;
		try {
			const resp = await fetch(
				`${apiUrl}${$params.admin ? "admin/" : ""}chats/${
					$chat._id
				}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						...$authHeader,
					},
					body: JSON.stringify({nickname: nickname}),
				}
			);
			if (!resp.ok) {
				if (resp.status === 429) {
					throw new Error(
						"Too many requests! Try again later."
					);
				}
				throw new Error(
					"Response code is not OK; code is " + resp.status
				);
			}
			if ($params.admin) {
				$chat = await resp.json();
			}
		} catch (e) {
			loading = false;
			error = e;
		}
	}}
>
	<label for="nickname" style={error ? "color: crimson;" : ""}
		><b>Nickname</b>
		{#if error}<i>- {error}</i>{/if}</label
	>
	<input
		id="nickname"
		type="text"
		class="modal-input white"
		placeholder="Chat Nickname"
		maxlength="32"
		disabled={loading}
		bind:value={nickname}
	/><br />
	<br />

</form></Container>
