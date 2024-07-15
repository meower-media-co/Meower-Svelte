<script>
	import Modal from "../../Modal.svelte";

	import {user, customTheme} from "../../stores.js";
	import {
		stringToTheme,
		themeToString,
		get_True_Fallback,
		applyTheme,
		removeTheme,
	} from "../../CustomTheme.js";
	import * as modals from "../../modals.js";
	import * as clm from "../../clmanager.js";

	let jsonInput, error;

	let theme = $customTheme;

	$: {
		try {
			applyTheme(theme);
			error = "";
		} catch (e) {
			error = e;
		}

		if (jsonInput) jsonInput.value = JSON.stringify(theme);
	}
</script>

<Modal
	on:close={() => {
		if ($user.theme.includes("custom:")) {
			try {
				applyTheme(stringToTheme($user.theme));
			} catch (e) {
				console.error(`Failed to apply custom theme: ${e}`);
				removeTheme();
			}
		} else {
			removeTheme();

		}
		modals.closeLastModal();
	}}
>
	<h2 slot="header">Custom Theme</h2>
	<div slot="default">
		<label for="MainColor">Main Color: </label>
		<input type="color" id="MainColor" bind:value={theme.orange} />
		<br />
		<label for="Tint">Tinting: </label>
		<input type="color" id="Tint" bind:value={theme.tinting} />
		<br />
		<label for="Bg">Background: </label>
		<input type="color" id="Bg" bind:value={theme.background} />
		<br />
		<label for="Fg">Foreground: </label>
		<input type="color" id="Fg" bind:value={theme.foreground} />
		<br />
		<label for="Fg2">Foreground 2: </label>
		<input type="color" id="Fg2" bind:value={theme.foregroundOrange} />
		<br /><br />
		<button on:click={() => {theme = get_True_Fallback()}}>Reset to default theme</button>
		<button on:click={() => {
			if ($user.theme.includes("custom:")) {
				theme = stringToTheme($user.theme)
			}
		}} disabled = {!$user.theme.includes("custom:")}>Reset to saved theme</button>
		<br /><br />
		{#if error}
			<label for="json" style="color: crimson;"
				><b>JSON: </b> <i>{error}</i></label
			>
		{:else}
			<label for="json"><b>JSON</b></label>
		{/if}
		<input
			style="width: 100%;"
			type="text"
			id="json"
			placeholder="Testing..."
			bind:this={jsonInput}
			on:change={() => {
				try {
					theme = JSON.parse(jsonInput.value);
				} catch (e) {
					error = e;
				}
			}}
		/>
		<br /><br />
		<div class="modal-buttons">
			<button
				on:click={() => {
					if ($user.theme.includes("custom:")) {
						try {
							applyTheme(stringToTheme($user.theme));
						} catch (e) {
							console.error(`Failed to apply custom theme: ${e}`);
							removeTheme();
						}
					} else {
						removeTheme();
					}
					modals.closeLastModal();
				}}>Cancel</button
			>
			<button
				disabled={error}
				on:click={() => {
					applyTheme(theme);
					$user.theme = themeToString(theme);
					clm.updateProfile({theme: $user.theme, mode: $user.mode});
					modals.closeLastModal();
				}}>Save</button
			>
		</div>
	</div>
</Modal>
