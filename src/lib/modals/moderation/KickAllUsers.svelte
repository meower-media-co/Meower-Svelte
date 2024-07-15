<script>
	import Modal from "../../Modal.svelte";

	import {authHeader} from "../../stores.js";
	import {apiUrl} from "../../urls.js";
	import * as modals from "../../modals.js";

	import sleep from "../../sleep";

	let _loading, error;
</script>

<Modal on:close={modals.closeLastModal}>
	<h2 slot="header">Kick All Users</h2>
	<div slot="default">
		<form
			on:submit|preventDefault={async () => {
				_loading = true;
				try {
					const resp = await fetch(`${apiUrl}admin/server/kick-all`, {
						method: "POST",
						headers: $authHeader,
					});
					if (!resp.ok) {
						throw new Error(
							"Response code is not OK; code is " + resp.status
						);
					}
					modals.closeLastModal();
				} catch (e) {
					error = e;
					_loading = false;
				}
			}}
		>
			<p>Are you sure? This will disconnect everyone!</p>
			{#if error}
				<p style="color: crimson;">{error}</p>
			{:else}
				<br />
			{/if}
			<div class="modal-buttons">
				<button type="button" on:click={modals.closeLastModal}
					>Cancel</button
				>
				{#await sleep(1500)}
					<button disabled type="submit">Confirm</button>
				{:then}
					<button type="submit">Confirm</button>
				{/await}
			</div>
		</form>
	</div>
</Modal>
