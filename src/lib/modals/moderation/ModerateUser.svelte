<script>
	import Modal from "../../Modal.svelte";
	import Container from "../../Container.svelte";
	import Loading from "../../Loading.svelte";
	import FormattedDate from "../../FormattedDate.svelte";
	import AdminNotes from "../../AdminNotes.svelte";

	import ModerateUserModal from "./ModerateUser.svelte";
	import ModerateIPModal from "./ModerateIP.svelte";
	import EditRestrictionsModal from "./EditRestrictions.svelte";
	import ViewPostsModal from "./ViewPosts.svelte";
	import ClearQuoteModal from "./ClearQuote.svelte";
	import SetAdminPermissionsModal from "./SetAdminPermissions.svelte";
	import DeleteAccountModal from "./DeleteAccount.svelte";

	import network from "../../../assets/network.svg";
	import shieldx from "../../../assets/shield-x.svg";
	import userx from "../../../assets/user-x.svg";

	import {authHeader, pendingBanState} from "../../stores.js";
	import {
		userFlags,
		adminPermissions,
		userRestrictions,
		hasPermission,
	} from "../../bitField.js";
	import {apiUrl} from "../../urls.js";
	import * as modals from "../../modals.js";

	import {tick} from "svelte";

	export let modalData;

	let {username} = modalData;

	let user;
	let system, deleted, userProtected;
	let alertText, alertStatus;
	let banState, banExpired, formattedBanExpires, banSaving, banSaveError;
	let kickStatus;

	$: {
		if (banState && banState.expires) {
			banExpired =
				banState.state.includes("temp") &&
				banState.expires < Date.now() / 1000;

			const date = new Date(banState.expires * 1000); // Convert to milliseconds
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			const hours = String(date.getHours()).padStart(2, "0");
			const minutes = String(date.getMinutes()).padStart(2, "0");
			formattedBanExpires = `${year}-${month}-${day}T${hours}:${minutes}`;
		}
	}

	async function getUserdata() {
		const resp = await fetch(`${apiUrl}admin/users/${username}`, {
			headers: $authHeader,
		});
		if (!resp.ok) {
			if (resp.status === 404)
				throw new Error(`${username} does not exist!`);
			throw new Error("Response code is not OK; code is " + resp.status);
		}
		user = await resp.json();
		system = (user.flags & userFlags.SYSTEM) === userFlags.SYSTEM;
		deleted = (user.flags & userFlags.DELETED) === userFlags.DELETED;
		userProtected =
			(user.flags & userFlags.PROTECTED) === userFlags.PROTECTED;
		if (user.ban) {
			banState = Object.assign({}, user.ban);
			if ($pendingBanState) banState = $pendingBanState;
		}
	}

	async function sendAlert() {
		alertStatus = "Sending alert...";
		try {
			const resp = await fetch(`${apiUrl}admin/users/${user._id}/alert`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...$authHeader,
				},
				body: JSON.stringify({content: alertText}),
			});
			if (!resp.ok) {
				throw new Error(
					"Response code is not OK; code is " + resp.status
				);
			}
			alertStatus = "Alert sent!";
		} catch (e) {
			alertStatus = "Error sending alert: " + e;
		}
	}

	async function saveBanState() {
		banSaving = true;
		try {
			const resp = await fetch(`${apiUrl}admin/users/${user._id}/ban`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...$authHeader,
				},
				body: JSON.stringify({
					state: banState.state,
					restrictions: banState.restrictions,
					expires: banState.expires,
					reason: banState.reason,
				}),
			});
			if (!resp.ok) {
				throw new Error(
					"Response code is not OK; code is " + resp.status
				);
			}
			user.ban = Object.assign({}, banState);
			banSaving = false;
		} catch (e) {
			banSaveError = e;
			banSaving = false;
		}
	}

	async function kick() {
		kickStatus = "Kicking...";
		try {
			const resp = await fetch(`${apiUrl}admin/users/${user._id}/kick`, {
				method: "POST",
				headers: $authHeader,
			});
			if (!resp.ok) {
				throw new Error(
					"Response code is not OK; code is " + resp.status
				);
			}
			kickStatus = "Kicked!";
		} catch (e) {
			kickStatus = e;
		}
	}
</script>

<Modal
	showClose={true}
	on:close={() => {
		pendingBanState.set(null);
		modals.closeLastModal();
	}}
>
	<h2 slot="header">Moderate {username}</h2>
	<div slot="default">
		{#await getUserdata()}
			<Loading />
		{:then}
			{#if userProtected}
				<Container warning={true}>
					This account is protected. If you are not a sysadmin, some
					options will be unavailable.
				</Container>
			{/if}
			{#if deleted}
				<Container warning={true}>
					This account has been deleted. Deleted accounts cannot be
					recovered. {#if hasPermission(adminPermissions.DELETE_USERS)}You
						may release the username by purging the account.{/if}
				</Container>
			{:else if user.delete_after}
				<Container warning={true}>
					This account is scheduled to be deleted after <FormattedDate
						date={user.delete_after}
					/>.
				</Container>
			{/if}
			<h2>User Info</h2>
			<b>Username:</b>
			{user._id}<br />
			<b>UUID:</b>
			{user.uuid}<br />
			{#if !system && !deleted}
				<b>Pfp:</b>
				{user.pfp_data}<br />
				<b>Quote:</b> <i>"{user.quote}"</i><br />
				<b>Permissions:</b>
				{user.permissions}<br />
			{/if}
			<b>Created:</b>
			<FormattedDate date={user.created} /><br />
			{#if user.last_seen}
				<b>Last seen:</b>
				<FormattedDate date={user.last_seen} /><br />
			{/if}
			{#if user.settings}
				<b>Unread inbox?</b>
				{user.settings.unread_inbox ? "yes" : "no"}
			{/if}

			<br /><br />

			{#if user.alts}
				<h2>Alts</h2>
				This list is based on users from their recent IPs. This list may
				not be accurate.
				<ul>
					{#each user.alts as username}
						<li>
							<a
								href="/"
								on:click|preventDefault={async () => {
									modals.closeLastModal();
									await tick();
									modals.showModal(ModerateUserModal, {
										username,
									});
								}}>{username}</a
							>
						</li>
					{/each}
				</ul>

				<br /><br />
			{/if}

			{#if user.recent_ips}
				<h2>Recent IPs</h2>
				<table>
					<tr>
						<th>IP Address</th>
						<th>Last Used</th>
						<th>Flags</th>
					</tr>
					{#each user.recent_ips as ip}
						<tr>
							<td>
								<a
									href="/"
									on:click|preventDefault={() =>
										modals.showModal(ModerateIPModal, {
											ip: ip.ip,
										})}>{ip.ip}</a
								>
							</td>
							<td
								><FormattedDate
									date={ip.last_used}
									relative={true}
								/></td
							>
							<td>
								<div class="flags">
									{#if ip.netinfo.vpn}
										<img
											src={network}
											alt="Detected VPN/proxy"
											title="Detected VPN/proxy"
										/>
									{/if}
									{#if ip.blocked}
										<img
											src={shieldx}
											alt="Blocked"
											title="Blocked"
										/>
									{/if}
									{#if ip.registration_blocked}
										<img
											src={userx}
											alt="Registration blocked"
											title="Registration blocked"
										/>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</table>

				<br /><br />
			{/if}

			{#if hasPermission(adminPermissions.VIEW_NOTES)}
				<h2>Notes</h2>
				<AdminNotes identifier={user.uuid} />
				<br /><br />
			{/if}

			{#if !system && !deleted && hasPermission(adminPermissions.SEND_ALERTS)}
				<h2>Send Alert</h2>
				<textarea
					class="white"
					placeholder="Write something..."
					bind:value={alertText}
					on:change={() => (alertStatus = "")}
				/>
				{#if alertStatus}
					<b>{alertStatus}</b>
				{/if}
				<button
					style="float: right;"
					disabled={!alertText || alertStatus === "Alert sent!"}
					on:click={sendAlert}>Send</button
				>

				<br /><br />
			{/if}

			{#if banState}
				<h2>Ban State</h2>
				{#if !banExpired && user.ban.state !== "none" && JSON.stringify(banState) === JSON.stringify(user.ban)}
					<Container warning={true}>
						{user._id} is
						{#if user.ban.state.includes("perm")}
							permanently
						{/if}
						{#if user.ban.state.includes("restriction")}
							restricted
						{:else if user.ban.state.includes("ban")}
							banned
						{/if}
						{#if user.ban.state.includes("temp")}
							until <FormattedDate date={user.ban.expires} />
						{/if}
					</Container>
				{/if}
				<label for="state"><b>State</b></label><br />
				<select
					id="state"
					class="grow"
					style="width: 100%; margin-bottom: 0.25em;"
					disabled={!hasPermission(
						adminPermissions.EDIT_BAN_STATES
					) ||
						(userProtected &&
							!hasPermission(adminPermissions.SYSADMIN))}
					bind:value={banState.state}
					on:change={() => {
						if (
							banState.state.includes("restriction") &&
							!banState.restrictions
						) {
							banState.restrictions =
								userRestrictions.HOME_POSTS |
								userRestrictions.CHAT_POSTS |
								userRestrictions.NEW_CHATS |
								userRestrictions.EDITING_CHAT_NICKNAMES |
								userRestrictions.EDITING_QUOTE;
						}
					}}
				>
					<option value="none" selected={banState.state === "none"}>
						None
					</option>

					<option
						value="temp_restriction"
						selected={banState.state === "temp_restriction"}
					>
						Temporarily restricted
					</option>
					<option
						value="perm_restriction"
						selected={banState.state === "perm_restriction"}
					>
						Permanently restricted
					</option>

					<option
						value="temp_ban"
						selected={banState.state === "temp_ban"}
					>
						Temporarily banned
					</option>
					<option
						value="perm_ban"
						selected={banState.state === "perm_ban"}
					>
						Permanently banned
					</option>
				</select><br />
				{#if banState.state === "none"}
					This applies no restrictions to the user.
				{:else if banState.state.includes("ban")}
					This prevents the user from logging in.
				{/if}

				{#if banState.state.includes("restriction")}
					<br />
					<label for="restrictions"><b>Restrictions</b></label><br />
					<button
						class="long"
						on:click={() => {
							pendingBanState.set(banState);
							modals.showModal(EditRestrictionsModal, {
								username: user._id,
							});
						}}
						>Edit Restrictions
					</button>
					<ul id="restrictions">
						{#if (banState.restrictions & userRestrictions.HOME_POSTS) === userRestrictions.HOME_POSTS}
							<li>Block home posts</li>
						{/if}
						{#if (banState.restrictions & userRestrictions.CHAT_POSTS) === userRestrictions.CHAT_POSTS}
							<li>Block chat posts</li>
						{/if}
						{#if (banState.restrictions & userRestrictions.NEW_CHATS) === userRestrictions.NEW_CHATS}
							<li>Block new chats</li>
						{/if}
						{#if (banState.restrictions & userRestrictions.EDITING_CHAT_NICKNAMES) === userRestrictions.EDITING_CHAT_NICKNAMES}
							<li>Block editing group chat nicknames</li>
						{/if}
						{#if (banState.restrictions & userRestrictions.EDITING_QUOTE) === userRestrictions.EDITING_QUOTE}
							<li>Block editing quote</li>
						{/if}
					</ul>
				{/if}

				{#if banState.state.includes("temp")}
					<br /><br />
					<label
						for="expires"
						style={banExpired ? "color: crimson;" : ""}
					>
						<b>Expires (in your local timezone)</b>
						{#if banExpired}<i> - this time has passed</i>{/if}
					</label><br />
					<input
						id="expires"
						class="grow"
						style="width: 100%;"
						type="datetime-local"
						disabled={!hasPermission(
							adminPermissions.EDIT_BAN_STATES
						) ||
							(userProtected &&
								!hasPermission(adminPermissions.SYSADMIN))}
						value={formattedBanExpires}
						on:change={() => {
							banState = Object.assign(banState, {
								expires: Math.floor(
									new Date(formattedBanExpires).getTime() /
										1000
								),
							});
						}}
					/>
				{/if}

				{#if banState.state !== "none"}
					<br /><br />
					<label for="reason"
						><b>Reason (will be shown to user)</b></label
					><br />
					<textarea
						id="reason"
						class="white"
						placeholder="Reason text here..."
						disabled={!hasPermission(
							adminPermissions.EDIT_BAN_STATES
						) ||
							(userProtected &&
								!hasPermission(adminPermissions.SYSADMIN))}
						bind:value={banState.reason}
					/>
				{/if}

				{#if JSON.stringify(banState) !== JSON.stringify(user.ban)}
					<br /><br />
					<Container warning={true}>
						<b>WARNING!</b><br />
						The ban state has changed. You must save the new ban state
						before it's applied.
						<br /><br />
						<button
							class="long"
							disabled={banSaving}
							on:click={saveBanState}
						>
							Save ban state
						</button>
						{#if banSaveError}
							<p>{banSaveError}</p>
						{/if}
					</Container>
				{/if}

				<br /><br />
			{/if}

			{#if !system && (!deleted || hasPermission(adminPermissions.DELETE_USERS))}
				<h2>Other Actions</h2>
				{#if !system && !deleted && hasPermission(adminPermissions.VIEW_POSTS)}
					<button
						class="action-button"
						on:click={() =>
							modals.showModal(ViewPostsModal, {
								username,
								userProtected,
							})}
					>
						View posts
					</button>
				{/if}
				{#if !system && !deleted && hasPermission(adminPermissions.KICK_USERS)}
					<button class="action-button" on:click={kick}>
						Kick
					</button>
				{/if}
				{#if !system && !deleted && hasPermission(adminPermissions.CLEAR_USER_QUOTES)}
					<button
						class="action-button"
						disabled={userProtected &&
							!hasPermission(adminPermissions.SYSADMIN)}
						on:click={() =>
							modals.showModal(ClearQuoteModal, {username})}
					>
						Clear quote
					</button>
				{/if}
				{#if !system && !deleted}
					<button
						class="action-button"
						on:click={() =>
							modals.showModal(SetAdminPermissionsModal, {user})}
					>
						{#if hasPermission(adminPermissions.SYSADMIN)}
							Set permissions
						{:else}
							View permissions
						{/if}
					</button>
				{/if}
				{#if hasPermission(adminPermissions.DELETE_USERS)}
					<button
						class="action-button"
						disabled={userProtected &&
							!hasPermission(adminPermissions.SYSADMIN)}
						on:click={() =>
							modals.showModal(DeleteAccountModal, {user})}
					>
						Delete account
					</button>
				{/if}

				{#if kickStatus}
					<br />
					<b>{kickStatus}</b>
				{/if}

				<br /><br />
			{/if}
		{:catch error}
			{error}
		{/await}
		<div />
	</div>
</Modal>

<style>
	textarea {
		width: 100%;
		margin-bottom: 0.25em;
	}

	.action-button {
		margin-right: 0.25em;
		margin-bottom: 0.25em;
	}

	table {
		width: 100%;
		max-width: 100%;
		text-align: center;
		border-collapse: collapse;
		overflow: hidden;
	}

	th,
	td {
		border: solid 2px var(--orange);
		padding: 0.35em;
		outline: none;
		word-break: break-all;
	}

	.flags {
		display: flex;
		align-items: center;
		justify-content: space-evenly;
	}

	.long {
		width: 100%;
		margin: 0;
		margin-bottom: 0.2em;
	}
</style>
