<script>
	export let src;
	export let alt = "";

	import {onMount} from "svelte";

	let img;
	onMount(() => {
		img.classList.add("rescaleble-image");
		img.style.backgroundImage = `url(${src})`;
		img.title = alt;
	});
</script>

<div id="img" bind:this={img} {...$$restProps} />

<style>
	.rescaleble-image {
		display: flex;
		flex-grow: 1;
		min-width: 25%;
		height: 500px;
		background-image: url("https://meower.org/assets/cat_disks.jpg");
		background-repeat: no-repeat;
		object-fit: contain;
		background-size: contain;
	}
</style>
