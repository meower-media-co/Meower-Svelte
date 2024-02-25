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
</script>

<svelte:window on:keydown={handle_keydown} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="modal-background"
	on:click={close}
	transition:fade={{duration: 100, easing: expoOut}}
/>

{#if $mobile}
    <div
	    class="bottom-sheet"
	    role="dialog"
	    aria-modal="true"
	    bind:this={modal}
	    transition:slide={{duration: 500, easing: expoOut}}
    >
        <div class="settings-controls">
            {#if showClose}
                <button class="circle close" title="Close modal" on:click={close} />
            {/if}
        </div>

        <slot name="header" />
        <slot />
    </div>
{:else}
    <div
	    class="modal"
	    role="dialog"
	    aria-modal="true"
	    bind:this={modal}
        transition:scale={{start: 0.8, duration: 200, easing: expoOut}}
    >
        <div class="settings-controls">
            {#if showClose}
                <button class="circle close" title="Close modal" on:click={close} />
            {/if}
        </div>

        <slot name="header" />
        <hr />
        <slot />
    </div>
{/if}

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
		border: solid 2px var(--orange);
		border-radius: 5px;
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
    }

    .settings-controls {
	    top: 0.8em;
	    right: 1em;
	    gap: 0.25em;
    }
</style>
