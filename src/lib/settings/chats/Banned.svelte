<script>
	import {authHeader} from "../../stores.js";
	import {chat} from "../../stores.js";
	import {apiUrl} from "../../urls.js";
	import Container from "../../Container.svelte";
	import ProfileView from "../../ProfileView.svelte";
	import Member from "../../Member.svelte";

	let bans = [];
	async function fetchBans() {
		const resp = await fetch(`${apiUrl}chats/${$chat._id}/bans`, {
				headers: $authHeader,
		})
		if (!resp.ok) {
			throw new Error("Failed to fetch bans");
		}
		const data = await resp.json();
		bans = data.bans;

	}
</script>

<Container>
	<h1>Banned Users</h1>
	<hr>
	{#await fetchBans()}
		<p>Loading...</p>
	{:then}
		{#if bans.length === 0}
			<p>No banned users</p>
		{:else}
			{#each bans as ban}

				<Container><div class="inline">
					<Member member={ban.username} owner={false} />
					<p class="right_align">Reason: {ban.message} </p>
					<button
						class="unban"
						on:click={
						async () => {
							const resp = await fetch(`${apiUrl}chats/${$chat._id}/bans/${ban.username}`, {
								method: "DELETE",
								headers: $authHeader,
							});
							if (!resp.ok) {
								throw new Error("Failed to unban user");
							}
							bans = bans.filter((b) => b.username !== ban.username);
						}
					}>Unban</button>

</div>
				</Container>

			{/each}
		{/if}
	{:catch e}
		<p>{e.message}</p>
	{/await}
</Container>

<style>
	.unban {
		justify-content: right;
		flex-direction: column;

	}

	.inline {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: left;
		vertical-align: middle;
	}

	.inline p {
		flex: right;
		justify-self: right;
	}

	:global(.inline .member) {
		max-width: 25%;
	}
</style>