<!--
    Generic meower attachment wrapper
-->

<script>
	import {onMount} from "svelte";
	import Container from "./Container.svelte";

	export let title;
	export let url;

	let type, typeSplit, show, error;

	onMount(async () => {
		try {
			const resp = await fetch(url);
			if (resp.ok) {
				type = resp.headers.get("Content-Type");
				typeSplit = type.split(";")[0].split("/")[0];
				show = true;
			} else {
				error = "Status Code " + resp.status;
			}
		} catch (e) {
			error = e;
		}
	});
</script>

<div class="AttachmentClass">
	{#if show}
		<a href={url} target="_blank" rel="noreferrer">
			{#if typeSplit == "image"}
				<img src={url} alt={title} {title} class="post-image" />
			{:else if typeSplit == "video"}
				<!-- svelte-ignore a11y-media-has-caption -->
				<video src={url} controls class="post-image" />
			{:else if typeSplit == "audio"}
				<audio controls>
					<source src={url} />
				</audio>
			{:else}
				Other File Type ({type})
			{/if}
		</a>
	{/if}
	{#if error}
		<Container>
			This attachment had an error loading. Reason:
			<br />
			{error}
			<br /><br />
			View the Attachment
			<a href={url} target="_blank" rel="noreferrer">here</a> instead.
		</Container>
	{/if}
</div>

<style>
	.post-image {
		max-height: 12em;
		max-width: 100%;
		border-radius: 5px;
	}
</style>
