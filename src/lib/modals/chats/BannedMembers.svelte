<script>
	import Member from "./../../Member.svelte";
	import {authHeader, chat} from "./../../stores.js";
	import {apiUrl} from "./../../urls.js";
	import Modal from "../../Modal.svelte";
	import * as modals from "../../modals";
	import Spinner from "../../Spinner.svelte";
	import Container from "../../Container.svelte";

	async function fetchBannedMembers() {
		const resp = await fetch(`${apiUrl}chats/${$chat._id}/bans`, {
			headers: $authHeader,
		});
		if (!resp.ok) {
			if (resp.status === 429) {
				throw new Error("Too many requests! Try again later.");
			}
			throw new Error("Response code is not OK; code is " + resp.status);
		}
		$chat.banned_users = (await resp.json()).bans;
	}
</script>

<Modal on:close={modals.closeLastModal}>
	<h2 slot="header">Banned Users</h2>
	<div slot="default">
		{#await fetchBannedMembers()}
			<Spinner />
		{:then _}
			{#each $chat.banned_users as member}
				<Container>
					<Member member={member.username} owner={false} />
					<div class="inline">
						<p>Reason: {member.message}</p>

						<button
							class="delete"
							on:click={() => {
								fetch(
									`${apiUrl}chats/${$chat._id}/bans/${member.username}`,
									{
										method: "DELETE",
										headers: $authHeader,
									}
								);
								modals.closeLastModal();
							}}>Unban</button
						>
					</div>
				</Container>
			{/each}
		{/await}
	</div>
</Modal>

<style>
	p {
		display: flex;
		justify-content: center;
		text-align: center;
	}

	.delete {
		justify-content: right;
		flex: right;
		height: 100%;
	}

	.inline {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: left;
		vertical-align: middle;
	}

	.inline p {
		justify-self: center;
		align-self: center;
	}
</style>
