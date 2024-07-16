<script>
	import PFP from "../../lib/PFP.svelte";
	import * as clm from "../../lib/clmanager.js";

	import {user} from "../../lib/stores.js";

	import {profileCache} from "../../lib/loadProfile.js";

	const PFP_COUNT = 34;

	const pfps = new Array(PFP_COUNT).fill().map((_, i) => i + 1);

	let pfpOverflow = false;
	$: {
		const pfp = $user.pfp_data;
		pfpOverflow = pfp < 0 || pfp > PFP_COUNT;
	}
</script>

<div class="pfps">
	<h1>Select a profile picture</h1>
	<p>Select a profile picture to make yourself stand out.</p>
	<div class="pfp-outer">
		<div class="pfp-list">
			{#if pfpOverflow && $user.pfp_data < 0}
				<button class="pfp selected"
					><PFP
						online={false}
						icon={$user.pfp_data}
						alt="Profile picture {$user.pfp_data}"
					/></button
				>
			{/if}
			{#each pfps as pfp}
				<button
					on:click={() => {
						if ($profileCache[$user.name])
							delete $profileCache[$user.name];
						clm.updateProfile({pfp_data: pfp});
					}}
					class="pfp"
					class:selected={$user.pfp_data === pfp}
					><PFP
						online={false}
						icon={pfp}
						alt="Profile picture {pfp}"
					/></button
				>
			{/each}
			{#if pfpOverflow && $user.pfp_data > 0}
				<button class="pfp selected"
					><PFP
						online={false}
						icon={$user.pfp_data}
						alt="Profile picture {$user.pfp_data}"
					/></button
				>
			{/if}
		</div>
	</div>
</div>

<style>
	.pfps {
		/* this is kind of a hack, whatever */
		overflow-x: hidden;
		height: calc(100% - 0.25em);
		width: 100%;

		margin-bottom: 1em;
		box-sizing: border-box;

		position: relative;
		left: 50%;
		transform: translate(-50%, 0);
	}

	.pfp-outer {
		overflow-y: none;
	}

	.pfp {
		padding: 0.2em;
		margin: 0.2em;
		border-radius: 1.45em;
		display: inline-block;
		background: none;
		border: none;
	}
	:global(main.input-hover) .pfp:hover,
	:global(main.input-touch) .pfp:active {
		background-color: var(--orange-light);
	}
	/* cst todo: fix shadow appearing when activating then unhovering because i gtg*/
	:global(:root main.input-hover) .pfp:active {
		background-color: var(--orange-dark);
	}
	:global(main) .pfp.selected {
		background-color: var(--orange);
	}
	.pfp-list {
		display: flex;
		flex-wrap: wrap;
	}
</style>
