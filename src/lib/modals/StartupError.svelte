<script>
	import Modal from "../Modal.svelte";

	import * as modals from "../modals.js";

	export let modalData;

	let {error} = modalData;
</script>

<Modal>
	<h2 slot="header">Error</h2>
	<div slot="default">
		<p>{"We encountered an error while starting Meower, Here's some info that may help: "+error}</p>
        <p>Try reloading, and if this happens again, <a
				href="https://github.com/Meower-Media-Co/Meower-Svelte/issues/new"
				>create an issue on Meower Svelte's issue tracker</a
			> with the info shown above.
        </p>
		<div class="modal-buttons">
			<button on:click={() => {window.location.reload()}}>Reload</button>
		</div>
	</div>
</Modal>