<!--
	Home but it's a group chat.
-->
<script>
	import Invites from "../../lib/settings/chats/Invites.svelte";
	import BasicModal from "../../lib/modals/Basic.svelte";
	import ChangeChatNicknameModal from "../../lib/modals/chats/ChangeChatNickname.svelte";
	import GCMemberModal from "../../lib/modals/chats/GCMember.svelte";
	import AddMemberModeModal from "../../lib/modals/chats/AddMember_Mode.svelte";
	import AccountBannedModal from "../../lib/modals/safety/AccountBanned.svelte";
	import ModerateChatModal from "../../lib/modals/moderation/ModerateChat.svelte";

	import {authHeader, chats, user, chat} from "../../lib/stores.js";
	import {
		adminPermissions,
		hasPermission,
		userRestrictions,
		isRestricted,
	} from "../../lib/bitField.js";
	import {apiUrl} from "../../lib/urls.js";
	import * as modals from "../../lib/modals.js";
	import {mobile} from "../../lib/responsiveness.js";
	import ProfileView from "../../lib/ProfileView.svelte";
	import Member from "../../lib/Member.svelte";
	import Container from "../../lib/Container.svelte";
	import * as clm from "../../lib/clmanager.js";
	import PostList from "../../lib/PostList.svelte";

	import {params, goto} from "@roxi/routify";
	import {onMount, onDestroy, prevent_default} from "svelte/internal";
	import BannedMembers from "../../lib/modals/chats/BannedMembers.svelte";

	let chatsStoreSubscription;

	let showMembers = !$mobile;

	onMount(async () => {
		if ($params.chatid === "livechat") {
			chat.set({
				_id: "livechat",
				type: 0,
				nickname: "Livechat",
				owner: "",
				members: [],
				created: 0,
				last_active: 0,
				deleted: false,
				banned_users: [],
				invites: [],
			});

			clm.link.send({
				cmd: "direct",
				val: {
					cmd: "set_chat_state",
					val: {
						state: 1,
						chatid: "livechat",
					},
				},
			});
		} else if ($params.admin) {
			try {
				const resp = await fetch(
					`${apiUrl}admin/chats/${$params.chatid}`,
					{
						headers: $authHeader,
					}
				);
				if (!resp.ok) {
					throw new Error(
						"Response code is not OK; code is " + resp.status
					);
				}
				chat.set(await resp.json());
			} catch (e) {
				modals.showModal(BasicModal, {
					title: "Failed getting chat",
					desc: `Error while getting chat ${$params.chatid}: ${e}`,
				});
			}
		} else {
			chatsStoreSubscription = chats.subscribe(async _chats => {
				let _chat = $chats.find(_chat => _chat._id === $params.chatid);
				if (_chat) {
					chat.set(_chat);
				} else if ($chat._id) {
					$goto("/chats");
				} else {
					try {
						const resp = await fetch(
							`${apiUrl}chats/${$params.chatid}`,
							{
								headers: $authHeader,
							}
						);
						if (!resp.ok) {
							if (resp.status === 404) {
								throw new Error(
									`The chat you requested (${$params.chatid}) doesn't exist or you don't have access to it.`
								);
							}
							throw new Error(
								"Response code is not OK; code is " +
									resp.status
							);
						}
						chat.set(await resp.json());
					} catch (e) {
						modals.showModal(BasicModal, {
							title: "Failed getting chat",
							desc: e,
						});
						$goto("/chats");
					}
				}
			});
		}
	});

	onDestroy(() => {
		if (chatsStoreSubscription) chatsStoreSubscription();

		if ($chat._id === "livechat") {
			clm.link.send({
				cmd: "direct",
				val: {
					cmd: "set_chat_state",
					val: {
						state: 0,
						chatid: "livechat",
					},
				},
			});
		}

		chat.set({
			_id: "",
			type: 0,
			nickname: "",
			owner: "",
			members: [],
			created: 0,
			last_active: 0,
			deleted: false,
			banned_users: [],
			invites: [],
		});
	});
</script>

<!--
	so {cmd: direct, val: {cmd: add_to_chat, val: {chatid: "", username: ""}}}?
	also  remove_from_chat
-->

<div class="groupchat">
	<div id="chat" class:active={!showMembers}>
		{#if $chat.type === 0}
			<Container>
				<h1 class="chat-name">
					{$chat.nickname}
					<span class="chat-id">(<code>{$params.chatid}</code>)</span>
				</h1>
				{#if $params.admin && $chat.deleted}
					<p style="margin-bottom: 0; color: crimson;">
						<b
							>This chat is currently soft-deleted! No one can
							access it other than admins while it's soft-deleted.
							To restore it, open the chat mod panel and click
							'Restore chat'.</b
						>
					</p>
				{/if}
				{#if $chat._id !== "livechat"}
					<div class="settings-controls">
						{#if $params.admin}
							<button
								class="circle admin"
								disabled={!$chat._id}
								on:click={() =>
									modals.showModal(ModerateChatModal)}
							/>
						{/if}
						{#if $chat.owner === $user.name || ($params.admin && hasPermission(adminPermissions.EDIT_CHATS))}
							<button
								class="circle settings"
								on:click={() => {
									$goto(`/chats/${$params.chatid}/settings`);
								}}
							/>
						{/if}
						<button
							class="circle members"
							on:click={() => (showMembers = !showMembers)}
						/>
					</div>
				{/if}
			</Container>
		{:else if $chat.type === 1}
			{#if $params.admin}
				<Container>
					<h1 class="chat-name">
						DM between {$chat.members[0]} & {$chat.members[1]}
						<span class="chat-id"
							>(<code>{$params.chatid}</code>)</span
						>
					</h1>
					{#if $chat.deleted}
						<p style="margin-bottom: 0; color: crimson;">
							<b
								>This chat is currently soft-deleted! No one can
								access it other than admins while it's
								soft-deleted. To restore it, open the chat mod
								panel and click 'Restore chat'.</b
							>
						</p>
					{/if}
					<div class="settings-controls">
						<button
							class="circle admin"
							disabled={!$chat._id}
							on:click={() => modals.showModal(ModerateChatModal)}
						/>
					</div>
				</Container>
			{:else}
				<ProfileView
					username={$chat.members.filter(
						username =>
							username !==
							($params.user ? $params.user : $user.name)
					)[0]}
					small={true}
					canClick={true}
				/>
			{/if}
		{/if}
		<PostList
			fetchUrl={$params.chatid === "livechat"
				? null
				: $params.admin
				? `admin/chats/${$params.chatid}/posts`
				: `posts/${$params.chatid}`}
			postOrigin={$params.admin ? "" : $params.chatid}
			chatName={$chat.nickname}
			canPost={$chat._id === "livechat" || !$params.admin}
		/>
	</div>
	{#if showMembers && $chat._id !== "livechat" && $chat.type === 0}
		<div id="members">
			<div id="members-inner">
				{#each $chat.members as chatmember}
					<button
						class="member-button"
						on:click={() => {
							modals.showModal(GCMemberModal, {
								username: chatmember,
							});
						}}
					>
						<Member
							member={chatmember}
							owner={chatmember === $chat.owner}
						/>
					</button>
				{/each}
			</div>
			<div class="top">
				<h2 class="members-title">
					Members <span class="small">({$chat.members.length})</span>
				</h2>
				<div class="settings-controls">
					{#if !$params.admin || hasPermission(adminPermissions.EDIT_CHATS)}
						<button
							class="circle plus"
							on:click={() => {
								if (
									isRestricted(userRestrictions.NEW_CHATS) &&
									!$params.admin
								) {
									modals.showModal(AccountBannedModal, {
										ban: $user.ban,
										feature:
											"adding members to group chats",
									});
								} else if ($chat.members.length >= 256) {
									modals.showModal(BasicModal, {
										title: "Too many cats!",
										desc: "This chat has reached the maximum member limit of 256! You may not add anymore members until there are fewer than 256 members.",
									});
								} else {
									modals.showModal(AddMemberModeModal);
								}
							}}
						/>
					{/if}
					{#if $mobile && $chat._id !== "livechat"}
						<button
							class="circle join"
							on:click={() => (showMembers = !showMembers)}
						/>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.member-button {
		padding: 0;
		margin: 0;

		width: 100%;

		background-color: transparent;
		color: var(--foreground);
		border: none;

		position: relative;
		text-align: left;
	}

	/* repetition because of CSS specificity */
	:global(main.input-hover) .member-button.member-button:hover,
	.member-button.member-button:focus-visible {
		background-color: #7773;
	}
	:global(#main) .member-button.member-button:active {
		background-color: #7776;
	}
	:global(#main.layout-mobile) #chat:not(.active) {
		display: none;
	}

	.groupchat {
		display: flex;
		flex-wrap: nowrap;
		flex-direction: row;
		gap: 0.4em;
	}
	#chat {
		flex-shrink: 1;
		flex-grow: 1;
		overflow: hidden;
	}
	#members {
		height: var(--view-height);
		width: min(45%, 12em);

		background-color: var(--background);
		border: solid 2px var(--orange);
		border-radius: 5px;
		box-sizing: border-box;

		position: sticky;
		top: 0;

		flex-shrink: 0;
		flex-grow: 0;
	}
	:global(#main.layout-mobile) #members {
		width: 100%;
	}
	#members-inner {
		position: relative;

		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: none;

		height: calc(100% - 2.25em);
		margin-top: 2.25em;
	}

	.top {
		position: absolute;
		top: 0;
		width: 100%;
	}

	.chat-name {
		margin: 0;
	}
	.chat-id {
		font-weight: normal;
		color: #7f7f7f;
		font-size: 1rem;
	}

	.settings-controls {
		position: absolute;
		top: 0.25em;
		right: 0.25em;
		display: flex;
		gap: 0.25em;
	}
	.members-title {
		margin: 0.25em;
	}

	.small {
		font-size: 75%;
	}

	#HoverOver-Members {
		cursor: pointer;
	}
</style>
