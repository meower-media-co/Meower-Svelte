<script>
	import Container from "../../Container.svelte";
	import Member from "../../Member.svelte";
	import ProfileView from "../../ProfileView.svelte";
	import { chat } from "../../stores";
	import * as modals from "../../modals.js";
	import GCMemberModal from "../../modals/chats/GCMember.svelte";

</script>

<Container>
	<h1>Members</h1>
	<hr>

	<div id="members">
		<div id="members-inner">

			{#each $chat.members as chatmember}
			<Container>
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
			</Container>
			{/each}

		</div>
</Container>

<style>


	#members {


		position: sticky;
		top: 0;

		flex-shrink: 0;
		flex-grow: 0;
		width: 100%;
		overflow-y: hidden !important;
		overflow-x: hidden;
		overscroll-behavior: none;
	}
	#members-inner {
		position: relative;

		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: none;

		height: calc(100% - 2.50em);
		width: 100%;

	}
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
</style>