<script>
	import Container from "../lib/Container.svelte";
	import Loading from "../lib/Loading.svelte";
	import version from "../lib/version.js";
	import logo from "../assets/logo.svg";
	import meowy from "../assets/meowy.svg";

	import Contributor from "../lib/Contributor.svelte";

	const REPO_OWNER = "meower-media-co";
	const REPO_NAME = "Meower-Svelte";

	async function fetchContributors() {
		const res = await fetch(
			`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contributors`
		);
		if (!res.ok) {
			throw new Error(
				`Received response code: ${res.status} ${res.statusText}`
			);
		}
		const json = await res.json();

		const shuffled = [];
		while (json.length > 0) {
			const index = Math.floor(Math.random() * json.length);
			shuffled.push(json[index]);
			json.splice(index, 1);
		}
		return shuffled;
	}
</script>

<h1 class="logo center">
	<img src={logo} alt="Meower" height="80" />
</h1>
<b class="center friendlier">The friendlier social media for everyone.</b>
<div class="center">Svelte Client, version {version}</div>
<div class="center links">
	<a href="https://meower.org" target="_blank" rel="noreferrer">Learn more</a>
	|
	<a
		href="https://github.com/meower-media-co"
		target="_blank"
		rel="noreferrer">Source code</a
	>
</div>

<Container>
	<h2>The Council</h2>
	<p>These people have the highest authority of the Meower project.</p>
	<div class="contributors-list">
		<Contributor username="MikeDEV" pfp={26} isMeower={true}>
			Current owner of Meower
		</Contributor>
		<Contributor username="tnix" pfp={20} isMeower={true}>
			Backend developer
		</Contributor>
		<Contributor username="silvxrcat" pfp={-3} isMeower={true}>
			Original owner of Meower
		</Contributor>
		<Contributor username="CST1229" pfp={-1} isMeower={true}>
			Frontend developer
		</Contributor>
		<Contributor username="zed" pfp={22} isMeower={true}>
			Designer
		</Contributor>
		<Contributor username="DaCatBlock" pfp={23} isMeower={true}>
			Web developer
		</Contributor>
		<Contributor username="Voxalice" pfp={28} isMeower={true}>
			Musician
		</Contributor>
	</div>
</Container>
<Container>
	<h2>Client Contributors</h2>
	<p>(This list uses GitHub usernames/PFPs and the order is randomized.)</p>
	{#await fetchContributors()}
		<Loading />
	{:then contributors}
		<div class="contributors-list">
			{#each contributors as contributor}
				{#if contributor.type === "User"}
					<Contributor
						username={contributor.login}
						url={contributor.html_url}
						pfp={contributor.avatar_url}
					>
						{contributor.contributions} commit{contributor.contributions ===
						1
							? ""
							: "s"}
					</Contributor>
				{/if}
			{/each}
		</div>
	{:catch e}
		<p>An error occurred!</p>
		<pre><code>{e}</code></pre>
	{/await}
</Container>
<Container>
	<h2>Special Thanks</h2>
	<div class="contributors-list">
		<Contributor
			username="trappist-1e"
			url="https://scratch.mit.edu/users/trappist-1e/"
			pfp="https://uploads.scratch.mit.edu/get_image/user/61483990_100x100.png"
		>
			<img class="inline-meowy" src={meowy} height="24" alt="Meowy" /> Original
			creator of Meowy
		</Contributor>
	</div>
</Container>
<Container>
	<h2>Changelog</h2>
	<Container>
		<h2>1.8.2</h2>
		<ul>
			<li>
				Moved from using CL3 to the REST API for creating posts,
				emitting typing events, and updating user config
			</li>
			<li>Improved and optimized the posts list</li>
			<li>Added support for webhooks v2</li>
			<li>
				Fixed a bug that would cause the client to crash if the logged
				in user had an invalid theme saved
			</li>
			<li>Fixed a few other bugs</li>
		</ul>
	</Container>
	<Container>
		<h2>1.8.1</h2>
		<ul>
			<li>Made the initial logo animation a little shorter</li>
			<li>
				Fixed a bug that caused new home posts to appear while viewing a
				user's recent posts
			</li>
			<li>
				Fixed a bug that caused animations to lag when a user was logged
				in on more than 1 tab
			</li>
		</ul>
	</Container>
	<Container>
		<h2>1.8.0</h2>
		<ul>
			<li>
				Added the ability to include markdown within posts (such as
				headings, <b>bold</b>, <i>italics</i>, etc.)
			</li>
			<li>Added the ability to edit posts</li>
			<li>Added custom themes</li>
			<li>Added the ability to direct message users</li>
			<li>
				Added the ability for group chat owners to delete other members'
				posts
			</li>
			<li>
				Added the ability for group chat owners to change the nickname
				of their chat
			</li>
			<li>
				Added the ability for group chat owners to transfer ownership to
				another member of their chat
			</li>
			<li>
				Added the ability to favorite chats (this will push them to the
				top of your chats list)
			</li>
			<li>
				Added the ability to block users (along with being able to hide
				posts made by blocked users)
			</li>
			<li>
				Added the ability to leave a reason and comment when reporting a
				post or user
			</li>
			<li>
				Added the ability for moderators to issue feature restrictions
				and temporary account bans in response to ToS violations
			</li>
			<li>
				Added a 7-day delay when deleting an account, rather than it
				being instant
			</li>
			<li>Fixed numerous bugs</li>
		</ul>
	</Container>
	<Container>
		<h2>1.7.1</h2>
		<ul>
			<li>Fixed repair mode check on connection failed modal</li>
		</ul>
	</Container>
	<Container>
		<h2>1.7.0</h2>
		<ul>
			<li>
				Routing (you can now share links to specific pages on Meower!)
			</li>
			<li>Better auto-reconnection</li>
			<li>User config syncing across logged in clients</li>
			<li>Fixed some bugs with background music randomly restarting</li>
			<li>
				Made it so if you change settings as a guest and then create a
				new account, these settings will be carried across into your new
				account
			</li>
			<li>
				Removed option to not save your login (this is to support the
				better auto-reconnection system)
			</li>
			<li>Slightly different colors for dark mode themes</li>
			<li>Some other minor optimizations and refinements</li>
		</ul>
	</Container>
	<Container>
		<h2>1.6.2</h2>
		<ul>
			<li>
				Fixed the group chats list going blank when leaving a group chat
			</li>
			<li>Made everything else rounded instead of just containers</li>
			<li>Added an updated logo</li>
		</ul>
	</Container>
	<Container>
		<h2>1.6.1</h2>
		<ul>
			<li>
				Fixed a bug where the profile dropdown menu wasn't able to be
				opened on some iOS browsers and Safari for macOS
			</li>
			<li>no select the kitty >:/</li>
		</ul>
	</Container>
	<Container>
		<h2>1.6.0</h2>
		Way too many minor changes to list, so here are some of the highlights:
		<ul>
			<li>Added post and user searching</li>
			<li>Moved some of the less-used sidebar buttons into a dropdown</li>
			<li>Twemojis are now used for sent emojis</li>
			<li>Added an actual moderator panel (for moderators)</li>
			<li>
				Added an out-of-box experience screen when creating an account
			</li>
			<li>
				New "Add image" button next to the Post button (to make adding
				images easier and more known)
			</li>
			<li>
				Server auto-reconnection when a connection is unexpectedly
				dropped
			</li>
			<li>Background music (disabled by default for new accounts)</li>
			<li>Previews of themes while selecting a new theme</li>
			<li>
				Ability to add users to group chats through their profile page
			</li>
			<li>
				New search option for adding users to group chats (no more
				having to copy and paste usernames!)
			</li>
			<li>
				Fixed some problems with notification sounds playing at random
			</li>
			<li>Crown icon on group chat owners</li>
			<li>
				Members list for group chats is now full-screen when toggled and
				completely hidden when not toggled on mobile
			</li>
		</ul>
	</Container>
	<Container>
		<h2>1.5.4</h2>
		<ul>
			<li>Require password confirmation for changing account password</li>
			<li>Require password confirmation for deleting account</li>
		</ul>
	</Container>
	<Container>
		<h2>1.5.3</h2>
		<ul>
			<li>
				Replace the grey cat profile picture per request of the original
				artist
			</li>
		</ul>
	</Container>
	<Container>
		<h2>1.5.2</h2>
		<ul>
			<li>Fix the image host whitelist not working</li>
		</ul>
	</Container>
	<Container>
		<h2>1.5.1</h2>
		<ul>
			<li>
				Fix the dango profile picture appearing twice when you have it
				selected
			</li>
		</ul>
	</Container>
	<Container>
		<h2>1.5</h2>
		<ul>
			<li>
				Beta 4-style sidebar transition (except a bit less cooler due to
				the logo not moving)
			</li>
			<li>Work-in-progress search page</li>
			<li>
				Images now show up in posts (like [title: https://url]). There
				is an image host whitelist of a few sites (Meower, Tenor,
				Scratch, cubeupload, Discord and imgBB)
			</li>
			<li>
				New profile pictures from the <a href="https://bettermeower.app"
					>BetterMeower</a
				> project
			</li>
			<li>Badges now also look nicer and are next to the username now</li>
			<li>Adjusted date styling (no longer underlined, help cursor)</li>
			<li>Fixes to buttons on touchscreens</li>
			<li>Fixed the group chat page expanding with long messages</li>
			<li>Some minor polishing and bugfixes</li>
		</ul>

		<br />

		<details>
			<summary>Betas</summary>
			<h3>Hotfix</h3>
			<ul>
				<li>
					Disable bot badges (they aren't officially supported, and
					the CL4 port will add them)
				</li>
			</ul>

			<h3>Release</h3>
			<ul>
				<li>Banned status</li>
				<li>Reallow reporting posts from verified bots</li>
				<li>
					Made badges look nicer and put then next to the username
				</li>
				<li>Fixes to buttons on touchscreens</li>
				<li>Fixed the group chat page expanding with long messages</li>
				<li>
					Adjusted date styling (no longer underlined, help cursor)
				</li>
				<li>Disabled several features (rip)</li>
				<li>Updates to images in posts</li>
				<li>Some general polishing and bugfixes</li>
			</ul>

			<h3>Dev Preview 3</h3>
			<ul>
				<li>I don't really know</li>
				<li>Sidebar transition</li>
			</ul>

			<h3>Preview 2.5</h3>
			<ul>
				<li>Added http.meower.org as an allowed image hosting site</li>
				<li>
					Fixed an issue where images will break if they aren't on an
					allowed image hosting site
				</li>
			</ul>

			<h3>Preview 2</h3>
			<ul>
				<li>Added going to a profile by username</li>
				<li>Crash bug fix (hopefully)</li>
				<li>Unfinished mod panel</li>
				<li>Changelog page (this one!)</li>
				<!--
					it's roblox kid
					<li>
						Added "Badge" to Roblox888i for 200th chat (please dont beg for
						badges)
					</li>
				-->
				<li>Search bar only when logged in fix</li>
			</ul>

			<h3>Dev Preview 1</h3>
			<ul>
				<li>Search page</li>
				<li>BetterMeower profile picture support</li>
				<li>Statisics</li>
				<li>Bot tags (verified, unverified, bot owner)</li>
				<li>Don't allow verified bot posts to be reported</li>
				<li>Image links showing as images</li>
			</ul>
		</details>
	</Container>
	<Container>
		<h2>1.4.3</h2>
		<ul>
			<li>Support webhook posts from @Webhooks bot</li>
		</ul>
	</Container>
	<Container>
		<h2>1.4.2</h2>
		<ul>
			<li>
				Allow the sidebar to show on mobile (you can restore the old
				behavior by switching to old layout)
			</li>
		</ul>
		(these changes were made before, but are considered part of 1.4.2:)
		<ul>
			<li>
				Fix an issue that caused posts to sometimes not show up in home
			</li>
			<li>Add credentials when fetching home (to view pages past 1)</li>
			<li>
				Rename page title from "Meower Svelte" to "Meower" to reflect it
				becoming the official main client
			</li>
		</ul>
	</Container>
	<Container>
		<h2>1.4.1</h2>
		<ul>
			<li>Fixed posts sometimes not showing up in home</li>
		</ul>
	</Container>
	<Container>
		<h2>Notice</h2>
		<ul><li>Versions earlier then this may not be 100% accurate, as these are based off commit history</li></ul>

		<br />

		<details>
			<summary>Earlier Versions</summary>

			<li>Setup: The screen where login, sign up and stuff are</li>
			<br />

			<h3>1.4.0</h3>
			<ul>
				<li>
					Quotes
				</li>
				<li>
					Reporting users
				</li>
				<li>
					Bridged posts rework a little
				</li>
				<li>
					Linebreak support for posting
				</li>
				<li>
					Fix spam by holding down enter while ratelimited
				</li>
				<li>
					Modals
				</li>
				<li>
					Typing indicator
				</li>
				<li>
					Group chat members, add members via name and removing members
				</li>
				<li>
					Replies
				</li>
				<li>
					Alot of fixes and other things
				</li>
			</ul>

			<h3>1.3.0</h3>
			<ul>
				<li>
					Bridged posts
				</li>
				<li>
					Change passwords
				</li>
				<li>
					Linebreaks (only in posts until 1.4)
				</li>
				<li>
					Reporting/Deleting posts
				</li>
				<li>
					Inbox
				</li>
				<li>
					Group chats / Chat list
				</li>
				<li>
					SFX
				</li>
				<li>
					Shift-click group chats to access group cat
				</li>
			</ul>

			<h3>1.2.0</h3>
			<ul>
				<li>
					Store tokens instead of passwords
				</li>
				<li>
					Basic NoJS screen
				</li>
				<li>
					Add text to group cat (Yes very important to tell you this)
				</li>
				<li>
					View other user Profiles
				</li>
				<li>
					Add buttons to report a user, view recent posts, and add to chats
				</li>
			</ul>

			<h3>1.1.4</h3>
			<ul>
				<li>
					Dark mode toggle hell
				</li>
				<li>
					Remove start screen
				</li>
				<li>
					More setup improvements
				</li>
			</ul>

			<h3>1.1.3</h3>
			<ul>
				<li>
					Rework checkboxes
				</li>
				<li>
					Fix broken PFPs
				</li>
			</ul>

			<h3>1.1.2</h3>
			<ul>
				<li>
					Group cat
				</li>
			</ul>

			<h3>1.1.1</h3>
			<ul>
				<li>
					Fix background color on white inputs
				</li>
				<li>
					Fix dates being over-italic on firefox
				</li>
			</ul>

			<h3>1.1</h3>
			<ul>
				<li>
					Account deletion
				</li>
				<li>
					Login saving 
				</li>
				<li>
					Fix only being able to log in once per session
				</li>
				<li>
					Add TOS/Privacy Policy confirmation when creating an account
				</li>
				<li>
					Fix "Let's Go!" text in setup
				</li>
				<li>
					Reworked setup
				</li>
			</ul>

			<h3>1.0.1</h3>
			<ul>
				<li>
					Center setup
				</li>
				<li>
					Add limits to how many characters the username and password have
				</li>
			</ul>

			<h3>1.0</h3>
			<ul>
				<li>
					Inital Release
				</li>
				<li>
					PFP Hotfix
				</li>
				<li>
					"How can lastpass fill passwords into a PLAIN TEXTBOX"
				</li>
			</ul>
		</details>
	</Container>
</Container>

<style>
	.center {
		text-align: center;
		display: block;
	}
	.logo {
		margin-bottom: 0;
	}
	.friendlier {
		font-size: 1.25em;
	}

	.links {
		margin-bottom: 1em;
	}

	#long {
		width: 100%;
	}

	.contributors-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15em, 1fr));
		grid-gap: 0.5em;
	}

	.inline-meowy {
		vertical-align: middle;
	}

	h3 {
		margin-top: 0.5ex;
		margin-bottom: 0.5ex;
	}
</style>
