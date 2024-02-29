<script>
	import {chat, authHeader} from "../../stores.js";
	import Spinner from "../../Spinner.svelte";
	import {apiUrl} from "../../urls";
	import Modal from "../../Modal.svelte";
	import * as modals from "../../modals";
	import {writable} from "svelte/store";
	import Container from "../../Container.svelte";

	if (!$chat.invites) $chat.invites = [];
	// @ts-ignore
	if (typeof $chat.invites != "Array") $chat.invites = [];

	async function fetchInvites() {
		let data = await (
			await fetch(`${apiUrl}chats/${$chat._id}/invites`, {
				headers: $authHeader,
			})
		).json();
		console.log(data);
		$chat.invites = data.invites;
	}
</script>

<Container>
	<h1>Invites</h1>

		{#await fetchInvites()}
			<Spinner />
		{/await}
		<hr />

		{#each $chat.invites as invite}
				<div class="inline">
					<a
						href="{window.location.protocol}://{window.location.host}/invite/{invite._id}"
						target="_blank"
					>
						{window.location.protocol}//{window.location.host}/invite/{invite._id}
					</a>
					<div class="delete">
						<button
							class="right_align"
							on:click|preventDefault={() => {
								fetch(`${apiUrl}chats/invites/${invite._id}`, {
									method: "DELETE",
									headers: $authHeader,
								});
							}}
						>
							Revoke Invite
						</button>
					</div>
				</div>
		{/each}
		<hr />
		<button
			on:click|preventDefault={async () => {
				let invite = await (
					await fetch(`${apiUrl}chats/${$chat._id}/invites`, {
						method: "POST",
						headers: $authHeader,
					})
				).json();

				$chat.invites = [
					...$chat.invites,
					{_id: invite.invite, chat_id: $chat._id},
				];
			}}>Create Invite</button
		>
</Container>

<style>
	.right_align {
		align-self: right;
	}

	.delete {
		justify-content: right;
		flex: right;
		margin-top: 1rem;
	}

	.inline {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: left;
		vertical-align: middle;
	}

	.inline a {
		justify-self: center;
		align-self: center;
	}
</style>
