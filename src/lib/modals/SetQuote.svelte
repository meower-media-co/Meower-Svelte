<script>
	import Modal from "../Modal.svelte";

	import {user, modalShown, mainPage as page} from "../stores.js";
	import {shiftHeld} from "../keyDetect.js";

	import * as clm from "../clmanager.js";

	import {tick} from "svelte";

	import {autoresize} from "svelte-textarea-autoresize";
</script>

<Modal
	on:close={() => {
		$modalShown = false;
	}}
>
	<h2 slot="header">Set Quote</h2>
	<div slot="default">
		<form
			on:submit|preventDefault={async e => {
				modalShown.set(false);

				await clm.updateProfile();

				page.set("blank");
				tick().then(() => page.set("profile"));
			}}
		>
			<span
				>Your quote is a small piece of text that will be displayed
				publicly on your profile.</span
			><br /><br />
			<input
				type="text"
				class="modal-input white"
				placeholder="Write something..."
				maxlength="360"
				bind:value={$user.quote}
			/><br /><br />
			<div class="modal-buttons">
				<button
					type="button"
					on:click={() => {
						$modalShown = false;
					}}>Cancel</button
				>
				<button type="submit">Set Quote</button>
			</div>
		</form>
	</div>
</Modal>
