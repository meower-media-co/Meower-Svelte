<!--
	Profile view thing to make codebase better

	(Arrow I swear if you comment that this makes your life harder)

	Args:
		Username: The profile username
		Profile: Custom profile JSON, Optional
		Small: If True, the View will be shorter
		CanClick: If True, when you click the PFP, it will go to their profile
		CloseCurrentModal (Defaults to true): If false, the current Modal wont close when Clicking the PFP 
-->

<script>
	import Loading from "./Loading.svelte";
	import Container from "./Container.svelte";
	import PFP from "./PFP.svelte";
	import LiText from "./LiText.svelte";
	import FormattedDate from "./FormattedDate.svelte";

	import BasicModal from "./modals/Basic.svelte";
	import ModerateUserModal from "./modals/moderation/ModerateUser.svelte";
	import ReportUserModal from "./modals/safety/ReportUser.svelte";
	import AccountBannedModal from "./modals/safety/AccountBanned.svelte";

	import {relationships, authHeader, chats, ulist, user} from "./stores.js";
	import {apiUrl} from "./urls.js";
	import {userFlags} from "./bitField.js";
	import loadProfile from "./loadProfile.js";
	import * as clm from "./clmanager.js";
	import * as modals from "./modals.js";

	import {goto} from "@roxi/routify";

	export let username = "";
	export let profile = null;
	export let small = false;
	export let canClick = false;
	export let canDoActions = false;
	export let dmChat = null;

	function load() {
		if (profile) {
			return profile;
		}
		return loadProfile(username, true);
	}
</script>

<div>
	{#await load()}
		<div class="center">
			<Loading />
		</div>
	{:then data}
		<Container>
			<div class="settings-controls">
				{#if dmChat}
					<button
						class="circle star"
						class:filled={$user.favorited_chats.includes(
							dmChat._id
						)}
						on:click={() => {
							if ($user.favorited_chats.includes(dmChat._id)) {
								$user.favorited_chats.splice(
									$user.favorited_chats.indexOf(dmChat._id),
									1
								);
								clm.updateProfile({
									favorited_chats: $user.favorited_chats,
								});
							} else {
								$user.favorited_chats =
									$user.favorited_chats.filter(chatId => {
										return $chats.some(
											_chat => _chat._id === chatId
										);
									});
								if ($user.favorited_chats.length >= 50) {
									modals.showModal(BasicModal, {
										title: "Too many stars!",
										desc: "Sorry, you can only have up to 50 favorited chats!",
									});
								} else {
									$user.favorited_chats.push(dmChat._id);
									clm.updateProfile({
										favorited_chats: $user.favorited_chats,
									});
								}
							}
						}}
					/>
					{#if !$user.favorited_chats.includes(dmChat._id)}
						<button
							class="circle close"
							on:click={() => {
								fetch(`${apiUrl}chats/${dmChat._id}`, {
									method: "DELETE",
									headers: $authHeader,
								});
								$chats.filter(
									_chat => _chat._id !== dmChat._id
								);
							}}
						/>
					{/if}
					<button
						class="circle join"
						on:click={$goto(`/chats/${dmChat._id}`)}
					/>
				{:else if canDoActions && $user.name}
					{#if $user.permissions}
						<button
							title="Moderate {data._id}"
							class="circle admin"
							on:click={() =>
								modals.showModal(ModerateUserModal, {
									username: data._id,
								})}
						/>
					{/if}
					{#if data._id !== $user.name && (data.flags & userFlags.SYSTEM) !== userFlags.SYSTEM && (data.flags & userFlags.DELETED) !== userFlags.DELETED}
						<button
							title="Report {data._id}"
							class="circle report"
							on:click={() =>
								modals.showModal(ReportUserModal, {user: data})}
						/>
						<button
							title="Open DM with {data._id}"
							class="circle join"
							on:click={async () => {
								let chat = $chats.find(
									_chat =>
										_chat.type === 1 &&
										_chat.members.includes(data._id)
								);
								if (chat) {
									$goto(`/chats/${chat._id}`);
								} else {
									try {
										const resp = await fetch(
											`${apiUrl}users/${data._id}/dm`,
											{
												method: "GET",
												headers: $authHeader,
											}
										);
										if (!resp.ok) {
											switch (resp.status) {
												case 403:
													modals.showModal(
														AccountBannedModal,
														{
															ban: $user.ban,
															feature:
																"starting direct message chats",
														}
													);
													return;
												case 429:
													throw new Error(
														"Too many requests! Try again later."
													);
												default:
													throw new Error(
														"Response code is not OK; code is " +
															resp.status
													);
											}
										}
										const chat = await resp.json();
										if (
											$chats.findIndex(
												_chat => _chat._id === chat._id
											) === -1
										) {
											$chats.push(chat);
										}
										$goto(`/chats/${chat._id}`);
									} catch (e) {
										modals.showModal(BasicModal, {
											title: "Failed to open DM",
											desc: `Failed to open DM with ${data._id}. ${e}`,
										});
									}
								}
							}}
						/>
					{/if}
				{/if}
			</div>

			<div class="profile-header">
				{#if canClick}
					<button
						class="clickable-pfp"
						on:click={$goto(`/users/${data._id}`)}
					>
						<PFP
							online={$ulist.includes(data._id) && !($relationships[data._id] === 2 && $user.hide_blocked_users)}
							icon={data._id === $user.name
								? $user.pfp_data
								: data.pfp_data}
							alt="{data._id}'s profile picture"
							size={small ? 1 : 1.4}
						/>
					</button>
				{:else}
					<PFP
						online={$ulist.includes(data._id) && !($relationships[data._id] === 2 && $user.hide_blocked_users)}
						icon={data._id === $user.name
							? $user.pfp_data
							: data.pfp_data}
						alt="{data._id}'s profile picture"
						size={small ? 1 : 1.4}
					/>
				{/if}
				<div class="profile-header-info" class:small>
					{#if small}
						<h2 class="profile-username">
							<LiText text={data._id} />
						</h2>
					{:else}
						<h1 class="profile-username">
							<LiText text={data._id} />
						</h1>
					{/if}
					<div class="profile-active">
						{#if $relationships[data._id] === 2 && $user.hide_blocked_users}
							User Blocked
						{:else if data.banned}
							Banned
						{:else if $ulist.includes(data._id)}
							Online
						{:else if (data.flags & userFlags.SYSTEM) === userFlags.SYSTEM}
							System
						{:else if (data.flags & userFlags.DELETED) === userFlags.DELETED}
							Deleted
						{:else if data.last_seen}
							Offline since <FormattedDate
								date={data.last_seen}
							/>
						{:else}
							Offline
						{/if}
					</div>
				</div>
			</div>
		</Container>
	{:catch e}
		<Container>
			<h2>Error</h2>
			We couldn't get this user's profile info.
			<pre><code>{e}</code></pre>
			Try again. If this issue persists,
			<a
				href="https://github.com/Meower-Media-Co/Meower-Svelte/issues/new"
				>create an issue on Meower Svelte's issue tracker</a
			> with the error code shown above.
		</Container>
	{/await}
</div>

<style>
	.profile-header-info {
		display: flex;
		flex-direction: column;
		align-items: left;
		justify-content: center;
		margin-left: 1em;
		height: 6em;
	}
	.profile-header-info.small {
		height: 4.5em;
	}

	.profile-username {
		margin: 0;
		padding: 0;
		display: inline-block;
		max-width: 100%;
		font-size: 3em;
	}
	h2.profile-username {
		font-size: 200%;
	}

	.profile-active {
		margin-bottom: 0.5em;
	}

	.clickable-pfp {
		padding: 0;
		border: none;
		background: none !important;
		color: inherit;
	}
	:global(main.input-hover) .clickable-pfp:hover:not(:active) :global(.pfp),
	:global(main.input-touch) .clickable-pfp:active :global(.pfp),
	.clickable-pfp:focus-visible :global(.pfp) {
		transform: scale(1.1);
	}

	.profile-header {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}
</style>
