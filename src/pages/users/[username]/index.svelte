<!-- The profile page, now with viewing others' profiles. -->
<script>
	import {
		userToMod,
		modPanelOpen,
		user,
	} from "../../../lib/stores.js";
	import * as Modals from "../../../lib/modals.js";

	import {profileCache} from "../../../lib/loadProfile.js";

	import ProfileView from "../../../lib/ProfileView.svelte";

	import PFP from "../../../lib/PFP.svelte";
	import Loading from "../../../lib/Loading.svelte";
	import Container from "../../../lib/Container.svelte";
	import * as clm from "../../../lib/clmanager.js";
	import {apiUrl, encodeApiURLParams} from "../../../lib/urls.js";

    import {params, goto} from '@roxi/routify';

	const PFP_COUNT = 34;

	const pfps = new Array(PFP_COUNT).fill().map((_, i) => i + 1);
	let pfpSwitcher = false;

	async function loadProfile() {
		let path = `users/${$params.username}`;
		if (encodeApiURLParams) path = encodeURIComponent(path);
		const resp = await fetch(`${apiUrl}${path}`);
		if (!resp.ok) {
			throw new Error("Response code is not OK; code is " + resp.status);
		}
		const json = await resp.json();
		return json;
	}

	/**
	 * Saves the user profile, and also clears its cache entry.
	 */
	function save() {
		if ($profileCache[$user.name]) {
			const _profileCache = $profileCache;
			delete _profileCache[$user.name];
			profileCache.set(_profileCache);
		}

		clm.updateProfile();
	}

	let pfpOverflow = false;
	$: {
		const pfp = $user.pfp_data;
		pfpOverflow = pfp < 0 || pfp > PFP_COUNT;
	}
</script>

<div class="OtherProfile">
	{#await loadProfile()}
		<div class="fullcenter">
			<Loading />
		</div>
	{:then data}
		<ProfileView username={$params.username} />

        {#if $user.name == $params.username}
            <Container>
                <h3>Quote</h3>
                <input
                    type="text"
                    class="modal-input white"
                    style="font-style: italic"
                    placeholder="Write something..."
                    maxlength="360"
                    bind:value={$user.quote}
                    on:change={async () => {
                        await clm.updateProfile();
                    }}
                />
            </Container>
        {:else}
            {#if data.quote}
                <Container>
                    <h3>Quote</h3>
                    <p>"<i>{data.quote}</i>"</p>
                </Container>
            {/if}
        {/if}

		{#if pfpSwitcher}
			<Container>
				<h2>Profile Picture</h2>
				<div id="pfp-list">
					{#if pfpOverflow && $user.pfp_data < 0}
						<button
							on:click={() => {
								pfpSwitcher = false;
							}}
							class="pfp selected"
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
								pfpSwitcher = false;
								$user.pfp_data = pfp;
								save();
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
						<button
							on:click={() => {
								pfpSwitcher = false;
							}}
							class="pfp selected"
							><PFP
								online={false}
								icon={$user.pfp_data}
								alt="Profile picture {$user.pfp_data}"
							/></button
						>
					{/if}
				</div>
			</Container>
		{:else if $params.username === $user.name}
			<button
				class="long"
				title="Change Profile Picture"
				on:click={() => (pfpSwitcher = true)}
				>Change Profile Picture</button
			>
		{/if}

		<button
			class="long"
			title="View Recent Posts"
			on:click={() => {$goto("./posts")}}>View Recent Posts</button
		>

		{#if $user.name && $params.username !== $user.name}
			<button
				class="long"
				on:click={() => {
					Modals.showModal("addMember2");
				}}>Add to Chat</button
			>
			{#if $user.lvl < 1}
				<button
					class="long"
					title="Report User"
					on:click={() => {
						Modals.showModal("reportUser");
					}}>Report User</button
				>
			{:else}
				<button
					class="long"
					title="Moderate User"
					on:click={() => {
						$userToMod = $params.username;
						$modPanelOpen = true;
					}}>Moderate User</button
				>
			{/if}
		{/if}
	{:catch e}
		<ProfileView username={$params.username} />
	{/await}
</div>

<style>
	.fullcenter {
		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;

		width: 100vw;
		height: 100vh;

		position: fixed;
		top: 0;
		left: 0;
	}

	.long {
		width: 100%;
		margin: 0;
		margin-bottom: -2px;
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
	#pfp-list {
		display: flex;
		flex-wrap: wrap;
	}
</style>