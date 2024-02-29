<script>
	import {authHeader} from "./../../stores.js";
	import Modal from "../../Modal.svelte";
	import * as modals from "../../modals.js";
	import {chat} from "../../stores";
	import {apiUrl} from "../../urls";

	export let modalData;

	let {username} = modalData;

	let reason = "";
</script>

<Modal on:close={modals.closeLastModal}>
	<h2 slot="header">Remove {username}</h2>

	<div slot="default">
		Are you sure you want to ban {username} from this chat?
		<form
			on:submit|preventDefault={() => {
				fetch(`${apiUrl}chats/${$chat._id}/bans/${username}`, {
					method: "PUT",
					headers: {
						...$authHeader,
					},
					body: reason,
				});
				modals.closeLastModal();
			}}
		>
			<label for="reason">Reason</label>
			<input type="text" id="reason" bind:value={reason} />

			<button type="submit">Ban</button>
		</form>
	</div>
</Modal>
