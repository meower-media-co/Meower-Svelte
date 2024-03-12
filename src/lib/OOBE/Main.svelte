<script>
	import OOBECustomizePFP from "./CustomizePFP.svelte";
	import OOBECustomizeTheme from "./CustomizeTheme.svelte";
	import OOBEIntroduction from "./Introduction.svelte";
	import OOBEEnd from "./End.svelte";
	import OOBEEasterEgg from "./EasterEgg.svelte"
	import OOBEQuote from "./Quote.svelte"

	import {OOBERunning, OOBEPage} from "../stores.js";
	import * as clm from "../clmanager.js";

	import {onMount} from "svelte";

	$: allowPrevious = $OOBEPage > 0;
	$: allowNext = $OOBEPage < 4;

	onMount(() => {
		clm.updateProfile({});
		OOBEPage.set(0);
	});
</script>

<div class="wrapper">
	<div class="pages">
		<div class="inner">
			<div class="fullcenter">
				{#if $OOBEPage == 0}
					<OOBEIntroduction />
				{:else if $OOBEPage == 1}
					<OOBECustomizePFP />
				{:else if $OOBEPage == 2}
					<OOBEQuote />
				{:else if $OOBEPage == 3}
					<OOBECustomizeTheme />
				{:else if $OOBEPage == 4}
					<OOBEEnd />
				{:else if $OOBEPage == 8}
					<OOBEEasterEgg />
				{:else}
					<p>You aren't supposed to be here.</p>
					<p>Current Page: {$OOBEPage}</p>
				{/if}
			</div>
		</div>
	</div>
	<div class="footer">
		<button
			disabled={!allowPrevious}
			on:click={() => {
				OOBEPage.set($OOBEPage - 1);
			}}
		>
			&lt;- Back
		</button>
		<button
			on:click={() => {
				OOBERunning.set(false);
			}}>Skip</button
		>
		<button
			disabled={!allowNext}
			on:click={() => {
				OOBEPage.set($OOBEPage + 1);
			}}
		>
			Next -&gt;
		</button>
	</div>
</div>

<style>
	.wrapper {
		margin: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.pages {
		text-align: center;
		flex-grow: 1;
		flex-shrink: 1;
		overflow: hidden;
	}

	.footer {
		flex-grow: 0;
		flex-shrink: 0;
		padding-left: 1em;
		padding-right: 1em;
		height: 3em;
		display: flex;
		align-items: stretch;
		justify-content: space-between;
		background-color: var(--orange-dark);
	}

	.footer button {
		height: 80%;
		align-self: center;
		border: 0;
	}

	.inner {
		height: calc(100vh - 3em);
		overflow: auto;
	}

	.fullcenter {
		width: 100vw;
		height: calc(100vh - 4rem);
		box-sizing: border-box;

		margin: auto;
		overflow: none;

		display: table-cell;
		vertical-align: middle;
		padding: 0.5em;
	}
</style>
