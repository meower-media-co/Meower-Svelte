<script>
	import {mainPage as page, profileClicked} from "../lib/stores.js";
	import {apiUrl} from "../lib/urls.js";
	import Loading from "../lib/Loading.svelte";
	import Container from "../lib/Container.svelte";

	let errors = "";
</script>

<div class="Search">
	<Container>
		<h1>Search</h1>
		meower search, statistics and more!
	</Container>
	<Container>
		<div class="settings-controls">
			<button class="circle search" disabled />
		</div>

		<h1>Search Posts</h1>
		Find posts and maybe even relics. Coming Soon™
	</Container>
	<Container>
		<div class="settings-controls">
			<button class="circle search" disabled />
		</div>

		<h1>Search Users</h1>
		Find all the legit users, memes, bots and namesnipes. Coming Soon™
	</Container>
	<Container>
		<h1>Go to User</h1>
		<form
			class="createpost"
			autocomplete="off"
			on:submit|preventDefault={async e => {
				errors = "";

				// @ts-ignore
				const input = e.target.elements.user;

				const userNotFound = () => {
					throw "This user does not exist!";
				};

				try {
					input.disabled = true;

					const username = input.value;

					if (!username) userNotFound();

					const url =
						apiUrl + "users/" + encodeURIComponent(username);

					if (
						url.includes("/..") ||
						decodeURIComponent(url).includes("/..")
					)
						userNotFound();

					const resp = await fetch(url);
					if (!resp.ok) userNotFound();

					profileClicked.set(username);
					page.set("profile");
				} catch (e) {
					errors = e;
				} finally {
					input.disabled = false;
				}
			}}
		>
			<p>
				Note that usernames are currently case-sensitive (e.g going to
				MikeDEV will work, but going to mikedev or MIKEDEV won't)!
			</p>
			<input
				type="text"
				class="white"
				placeholder="Username"
				name="user"
				autocomplete="false"
				on:keydown={e => {
					if (e.key == "Enter") {
						e.preventDefault();
						// @ts-ignore
						e.target.form.requestSubmit();
					}
				}}
			/>
			<button>Go to User</button>
		</form>
		<div class="errors">{errors}</div>
	</Container>
	<Container>
		<h1>Statistics</h1>
		{#await fetch(apiUrl + "statistics")}
			<div class="center">
				<Loading />
			</div>
		{:then resp}
			{#await resp.json()}
				<div class="center">
					<Loading />
				</div>
			{:then stats}
				There are {(stats.posts / 1000).toFixed(2)}k posts, {stats.chats}
				chats and {(stats.users / 1000).toFixed(2)}k users on Meower.
			{/await}
		{/await}
	</Container>
</div>

<style>
	.settings-controls {
		position: absolute;
		top: 0.25em;
		right: 0.25em;
	}
	.center {
		text-align: center;
	}
	.errors {
		color: red;
		font-size: 75%;
		font-weight: bold;
		margin: 0.25em 0;
	}
</style>
