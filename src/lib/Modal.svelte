<script>
	import {createEventDispatcher, onDestroy} from "svelte";
	import {scale, fade, slide} from "svelte/transition";
	import {expoOut} from "svelte/easing";
	import {mobile} from "./responsiveness.js";

	const dispatch = createEventDispatcher();
	const close = () => dispatch("close");

	export let showClose = false;

	let modal;

	const handle_keydown = e => {
		if (e.key === "Escape") {
			close();
			return;
		}

		if (e.key === "Tab") {
			// trap focus
			const nodes = modal.querySelectorAll("*");
			const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);

			let index = tabbable.indexOf(document.activeElement);
			if (index === -1 && e.shiftKey) index = 0;

			index += tabbable.length + (e.shiftKey ? -1 : 1);
			index %= tabbable.length;

			tabbable[index].focus();
			e.preventDefault();
		}
	};

	const previously_focused =
		typeof document !== "undefined" && document.activeElement;

	if (previously_focused) {
		onDestroy(() => {
			// @ts-ignore
			previously_focused.focus();
		});
	}

	let animation, animationProps;
	$: {
		animation = $mobile ? slide : scale;
		animationProps = $mobile ?
			{duration: 500, easing: expoOut} :
			{start: 0.8, duration: 200, easing: expoOut};
	};
</script>

<svelte:window on:keydown={handle_keydown} />

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div
	class="modal-background"
	on:click={close}
	transition:fade={{duration: 100, easing: expoOut}}
/>

<div
	class:modal={!$mobile}
	class:bottom-sheet={$mobile}
	role="dialog"
	aria-modal="true"
	bind:this={modal}
	transition:animation={animationProps}
>
	<div class="settings-controls">
		{#if showClose}
			<button class="circle close" title="Close modal" on:click={close} />
		{/if}
	</div>

	<slot name="header" />
	<slot />
</div>

<style>
	.modal-background {
		z-index: 9999;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
	}

	.modal {
		z-index: 9999;
		position: fixed;
		left: 50%;
		top: 50%;
		width: calc(100vw - 4em);
		max-width: 32em;
		max-height: calc(100vh - 4em);
		overflow: auto;
		transform: translate(-50%, -50%);
		padding: 1em;
		background-color: var(--background);
		border-top: solid 5px var(--orange);
		border-bottom: solid 5px var(--background);
		border-radius: 5px;
		box-shadow: 0 0 10px rgba(0,0,0,.1);
	}

    .bottom-sheet {
        z-index: 9999;
        position: fixed;
        left: 50%;
        bottom: 0;
        transform: translate(-50%);
        width: 91vw;
        max-height: calc(100vh - 4em);
        overflow: auto;
        margin: 0;
        padding: 1em;
        background-color: var(--background);
        border-radius: 30px 30px 0px 0px;
		border-bottom: solid 5px var(--background);
    }

    .settings-controls {
	    top: 0.8em;
	    right: 1em;
	    gap: 0.25em;
    }
</style>
