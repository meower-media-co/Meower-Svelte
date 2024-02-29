<script>
	import Modal from "../../Modal.svelte";
	import ProfileView from "../../ProfileView.svelte";

	import RemoveMemberModal from "./RemoveMember.svelte";
	import TransferChatOwnershipModal from "./TransferChatOwnership.svelte";

	import {user, chat} from "../../stores.js";
	import {adminPermissions, hasPermission} from "../../bitField.js";
	import * as modals from "../../modals.js";

	import {params, goto} from "@roxi/routify";
	import BanMember from "./BanMember.svelte";

	export let modalData;

	let {username} = modalData;

	$: {
		if (!$chat.members.includes(username)) modals.closeLastModal();
	}
</script>

<Modal showClose={true} on:close={modals.closeLastModal}>
	<h2 slot="header">{username}'s Profile</h2>
	<div slot="default">
		<ProfileView {username} canClick={true} canDoActions={true} />
		<button
			class="long"
			on:click={() => {
				modals.closeLastModal();
				$goto(`/users/${username}`);
			}}>View full profile</button
		>
		{#if ($chat.owner == $user.name && username != $user.name) || ($params.admin && hasPermission(adminPermissions.EDIT_CHATS))}
			<button
				class="long"
				on:click={() =>
					modals.replaceLastModal(RemoveMemberModal, {username})}
			>
				Remove from chat
			</button>
			<button
				class="long"
				on:click={() =>
					modals.replaceLastModal(TransferChatOwnershipModal, {
						username,
					})}
			>
				Make owner of chat
			</button>
			<button
				class="long"
				on:click={() => {
					modals.replaceLastModal(BanMember, {
						username,
					});
				}}
			>
				Ban user from chat
			</button>
		{/if}
	</div>
</Modal>

<style>
	.long {
		width: 100%;
		margin: 0;
		margin-bottom: 0.2em;
	}
</style>
