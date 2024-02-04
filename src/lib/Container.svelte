<!--
	The typical Meower container, used literally everywhere.
-->
<script>
	import { onMount } from "svelte";

	export let warning = false;
	export let fill_content = false;

	let content = null;
	onMount(() => {
		if (fill_content) {
			content.classList.add("fit");
		}
	});


</script>

<div class={warning ? "warning" : ""} bind:this={content}><slot /></div>

<style>
	div {
		background-color: var(--background);
		border: solid 2px var(--orange);
		border-radius: 5px;
		padding: 0.6em;
		margin-bottom: 0.4em;
		overflow-wrap: break-word;
		position: relative;
		overflow: auto;
	}

	:global(.fit) {
		height: min-content !important;
		overflow: hidden;
		margin-bottom: 0.8em;
		padding-bottom: 0em;
	}

	.warning {
		background-color: #eb4e33;
		border: none;
		color: white;
	}
</style>
