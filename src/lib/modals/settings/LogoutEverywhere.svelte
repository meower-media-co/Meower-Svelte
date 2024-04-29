<script>
	import Modal from "../../Modal.svelte";

	import * as modals from "../../modals.js";
	import * as clm from "../../clmanager.js";

	import {goto, focus} from "@roxi/routify";

	let loading, _error;
</script>

<Modal on:close={modals.closeLastModal}>
	<h2 slot="header">Logout Everywhere</h2>
	<div slot="default">
		<form
			on:submit|preventDefault={async () => {
				loading = true;
				try {
					await clm.meowerRequest({
						cmd: "direct",
						val: {
							cmd: "del_tokens",
							val: "",
						},
					});
					$goto("/logout");
				} catch (code) {
					loading = false;
					switch (code) {
						case "E:106 | Too many requests":
							_error =
								"Too many requests! Please try again later.";
							break;
						default:
							_error = "Unexpected " + code + " _error!";
					}
				}
			}}
		>
			<p>Are you sure you want to logout everywhere?</p>
			<div class="modal-buttons">
				<button
					type="button"
					disabled={loading}
					on:click={modals.closeLastModal}>Cancel</button
				>
				<button type="submit" disabled={loading} use:focus
					>Confirm</button
				>
			</div>
		</form>
	</div>
</Modal>
