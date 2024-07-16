<script>
	import Container from "../Container.svelte";

	import SwitchThemeModal from "../modals/settings/SwitchTheme.svelte";
	import SwitchBGMSFXModal from "../modals/settings/SwitchBGMSFX.svelte";

	import {user} from "../stores.js";
	import * as clm from "../clmanager.js";
	import * as modals from "../modals.js";
</script>

<Container>
	<h1>Personalization</h1>
	Here you can change the look and feel of the Meower client.
</Container>

<Container>
	<div class="settings-controls">
		<button
			class="circle settings"
			on:click={() =>
				clm.updateProfile({
					layout: $user.layout === "new" ? "old" : "new",
				})}
		/>
	</div>

	<h2>Layout</h2>
	You are currently using the "{$user.layout}" layout
</Container>
<Container>
	<div class="settings-controls">
		<button
			class="circle settings"
			on:click={() => modals.showModal(SwitchThemeModal)}
		/>
	</div>

	<h2>Theme</h2>
	{#if !$user.theme.startsWith("custom:")}
		The theme is currently set to {$user.theme} ({$user.mode
			? "light"
			: "dark"}).
	{:else}
		You are currently using a custom theme! How cool is that!
	{/if}
</Container>
<Container>
	<div class="settings-controls">
		<input
			type="checkbox"
			bind:checked={$user.sfx}
			on:change={() => clm.updateProfile({sfx: $user.sfx})}
		/>
	</div>

	<h2>Sound Effects</h2>
	Sound effects (for new messages) are currently {!$user.sfx
		? "disabled"
		: "enabled"}.
</Container>
<Container>
	<div class="settings-controls">
		{#if $user.bgm}
			<button
				class="circle settings"
				on:click={() => modals.showModal(SwitchBGMSFXModal)}
			/>
		{/if}
		<input
			type="checkbox"
			bind:checked={$user.bgm}
			on:change={() => clm.updateProfile({bgm: $user.bgm})}
		/>
	</div>

	<h2>Background Music</h2>
	Background music is currently {!$user.bgm ? "disabled" : "enabled"}.
	{#if $user.bgm}
		Click the cog button to change the song.
	{/if}
</Container>
