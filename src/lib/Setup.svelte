<!-- Boring orange screen with login and signup. -->
<script>
	import ServerSelectorModal from "./modals/ServerSelector.svelte";
	import BasicModal from "./modals/Basic.svelte";
	import StartupErrorModal from "./modals/StartupError.svelte";
	import AccountCreationBlockedModal from "./modals/safety/AccountCreationBlocked.svelte";

	import {screen, setupPage as page, OOBERunning, user, showMeowerDown} from "./stores.js";
	import unloadedProfile from "./unloadedprofile.js";
	import * as clm from "./clmanager.js";
	import * as modals from "./modals.js";
	const link = clm.link;
	// @ts-ignore
	window.clm = clm;

	import meowerLogo from "../assets/logo.svg";
	import meowy from "../assets/meowy.svg";

	import {tick, onMount, onDestroy} from "svelte";
	import {fade} from "svelte/transition";
	import sleep from "./sleep.js";
	import version from "./version.js";
	import * as BGM from "./BGM.js";

	import {isActive} from "@roxi/routify";

	let logo,
		setup,
		logoImg,
		serverSelectorTimeout,
		loginStatus = "";

	async function connect() {
		await clm.disconnect();
		showMeowerDown.set(false)
		clm.connect();

		await new Promise(resolve => link.once("connected", resolve));
	}

	function cancelServerSelector() {
		if (serverSelectorTimeout) {
			clearTimeout(serverSelectorTimeout);
		}
	}

	let acceptTerms = false;

	let requireLogin = false;
	$: requireLogin =
		$isActive("./inbox") || $isActive("./chats", {}, {strict: false});

	onMount(() => {
		page.subscribe(async value => {
			if (!setup) return;

			if (value === "logo") {
				try {
					loginStatus = ""
					setup.classList.remove("setup");

					await tick();
					if (!logoImg) return;

					await connect();
					setup.classList.remove("setupnobg");
					setup.classList.add("setup");
					logoImg.classList.remove("logo-img-color");
					await sleep(50);

					document.getElementById("meower-logo").remove()

					if (
						localStorage.getItem("meower_savedusername") &&
						localStorage.getItem("meower_savedpassword")
					) {
						doLogin(
							localStorage.getItem("meower_savedusername"),
							localStorage.getItem("meower_savedpassword"),
							true
						);
					} else {
						await sleep(50);
						await mainSetup();
					}
				} catch (error) {
					document.getElementById("meower-logo").remove()
					modals.showModal(StartupErrorModal, {error: error})
				}
			} else if (value === "reconnect") {
				if (document.getElementById("meower-logo")) { document.getElementById("meower-logo").remove() }
				setup.classList.remove("setupnobg");
				setup.classList.add("setup");
				loginStatus = "";
				await connect();
				await sleep(100);
				page.set("welcome");
			}
		});

		window.addEventListener("mouseup", cancelServerSelector);
	});

	onDestroy(() => {
		window.removeEventListener("mouseup", cancelServerSelector);
	});

	/**
	 * Goes to main setup screen.
	 */
	async function mainSetup() {
		localStorage.removeItem("meower_savedusername");
		localStorage.removeItem("meower_savedpassword");
		user.set(unloadedProfile());
		loginStatus = "";
		page.set("blank");
		await sleep(300);
		if (requireLogin || $isActive("./index")) {
			page.set("welcome");
		} else {
			page.set("blank");
			screen.set("main");
		}
	}

	/**
	 * Logs in.
	 *
	 * @param {string} username
	 * @param {string} password
	 */
	async function doLogin(
		username,
		password,
		autoLogin = false,
		savedLogin = false
	) {
		setTimeout(
			() => {
				if ($user.name) return;
				loginStatus = "Logging in...";
			},
			autoLogin ? 500 : 0
		);

		try {
			await clm.meowerRequest({
				cmd: "direct",
				val: {
					cmd: "authpswd",
					val: {
						username: username,
						pswd: password,
					},
				},
			});
		} catch (e) {
			if (autoLogin) return mainSetup();
			switch (e) {
				case "E:103 | ID not found":
					loginStatus = "Invalid username!";
					break;
				case "E:025 | Deleted":
					loginStatus = "This account has been deleted!";
					break;
				case "I:011 | Invalid Password":
					loginStatus = savedLogin
						? "Session expired! Please login again."
						: "Invalid password!";
					break;
				case "E:018 | Account Banned":
					loginStatus = "";
					break;
				case "E:019 | Illegal characters detected":
					loginStatus =
						"Usernames must not have spaces or other special characters!";
					break;
				case "E:106 | Too many requests":
					loginStatus = "Too many requests! Please try again later.";
					break;
				default:
					loginStatus = `Unexpected ${e} error!`;
			}
			return;
		}

		loginStatus = "";
		BGM.playBGM($user.bgm_song);
		screen.set("main");
	}
</script>

<div bind:this={setup} in:fade={{duration: 250}} out:fade={{duration: 250}} class="setup setupnobg">
	{#if $page === "logo"}
		<div out:fade={{duration: 300}}>
			<img
				bind:this={logoImg}
				alt="Meower"
				src={meowerLogo}
				class="logo-img logo-img-color presvl-fullcenter"
			/>
		</div>
	{:else if $page === "reconnect"}
		<div class="fullcenter">Reconnecting...</div>
	{:else if $page === "welcome"}
		<div class="fullcenter">
			<div class="column-ui">
				<div>
					<img
						alt="Meower"
						src={meowerLogo}
						class="logo-img"
						height="70"
					/>
					<br /><br />
				</div>
				<button
					on:click={() => page.set("login")}
					on:mousedown={() => {
						serverSelectorTimeout = setTimeout(() => {
							modals.showModal(ServerSelectorModal);
						}, 1000);
					}}>Log in</button
				>
				<br />
				<button on:click={() => page.set("join")}
					>Create an account</button
				> <br />
				{#if localStorage.getItem("meower_savedusername")}
					<button
						on:click={() => {
							doLogin(
								localStorage.getItem("meower_savedusername"),
								localStorage.getItem("meower_savedpassword"),
								false,
								true
							);
						}}
						>Use saved login ({localStorage.getItem(
							"meower_savedusername"
						)})</button
					>
					<p class="small">{loginStatus}</p>
				{/if}
				{#if !requireLogin}
					<button
						on:click={() => {
							loginStatus = "";
							page.set("blank");
							screen.set("main");
						}}>Skip</button
					>
					<p class="small">
						(Several features will be unavailable while not logged
						in.)
					</p>
				{:else}
					<p class="small">
						(You need to be logged in for this page.)
					</p>
				{/if}
				<div>
					<p class="small">Meower Svelte v{version}</p>
					<img src={meowy} alt="" height="64" />
				</div>
			</div>
		</div>
	{:else if $page === "login"}
		<div class="fullcenter">
			<h1>Login to Meower</h1>

			<form
				class="column-ui"
				on:submit|preventDefault={e => {
					if (!(e.target[0].value && e.target[1].value)) {
						loginStatus =
							"You must specify a username and a password to login!";
						return false;
					}
					doLogin(e.target[0].value, e.target[1].value);
					return false;
				}}
			>
				<input type="text" placeholder="Username" maxlength="20" />
				<input type="password" placeholder="Password" maxlength="255" />
				<span class="login-status">{loginStatus}</span>
				<div class="buttons">
					<button
						type="button"
						on:click|preventDefault={() => {
							page.set("welcome");
							loginStatus = "";
							return false;
						}}>Go back</button
					>
					<button type="submit">Log in</button>
				</div>
			</form>
		</div>
	{:else if $page === "join"}
		<div class="fullcenter">
			<h1>Welcome to Meower</h1>

			<form
				class="column-ui"
				on:submit|preventDefault={e => {
					const username = e.target[0].value;
					const password = e.target[1].value;
					const confirmPassword = e.target[2].value;
					if (!(username && password)) {
						loginStatus =
							"You must specify a username and a password to create an account!";
						return false;
					}
					if (password !== confirmPassword) {
						loginStatus =
							"Passwords do not match! Make sure you have entered your password correctly.";
						return false;
					}

					loginStatus = "Creating account...";

					clm.meowerRequest({
						cmd: "direct",
						val: {
							cmd: "gen_account",
							val: {
								username: username,
								pswd: password,
							},
						},
						listener: "join",
					})
						.then(async val => {
							user.update(v =>
								Object.assign(v, {
									name: val.payload.username,
									unread_inbox: true,
									layout: "new",
								})
							);
							loginStatus = "";
							OOBERunning.set(true);
							screen.set("main");
						})
						.catch(code => {
							switch (code) {
								case "I:015 | Account exists":
									loginStatus = `${username} is taken!`;
									break;
								case "E:019 | Illegal characters detected":
									loginStatus =
										"Usernames must not have spaces or other special characters!";
									break;
								case "E:106 | Too many requests":
									loginStatus =
										"Too many requests! Please try again later.";
									break;
								case "E:119 | IP Blocked":
									modals.showModal(
										AccountCreationBlockedModal
									);
									loginStatus = "";
									break;
								case "E:122 | Command disabled by sysadmin":
									modals.showModal(BasicModal, {
										title: "Registration Disabled",
										desc: "Unfortunately, you may not create a new account at this time. An administrator has disabled registration. Please try again later.",
									});
									loginStatus = "";
									break;
								default:
									loginStatus = `Unexpected ${code} error!`;
							}
						});
				}}
			>
				<input type="text" placeholder="Username" maxlength="20" />
				<input
					type="password"
					placeholder="Password"
					minlength="8"
					maxlength="255"
				/>
				<input
					type="password"
					placeholder="Confirm password"
					maxlength="255"
					autocomplete="new-password"
				/>
				<p class="checkboxes">
					<input
						id="accept-terms"
						type="checkbox"
						bind:checked={acceptTerms}
					/>
					<label for="accept-terms">
						I agree to <a
							href="https://meower.org/legal"
							target="_blank"
							rel="noreferrer"
							>Meower's Terms of Service and Privacy Policy</a
						>
					</label>
				</p>
				<span class="login-status">{loginStatus}</span>
				<div class="buttons">
					<button
						type="button"
						on:click|preventDefault={() => {
							page.set("welcome");
							loginStatus = "";
							return false;
						}}>Go back</button
					>
					<button type="submit" disabled={!acceptTerms}>Join!</button>
				</div>
			</form>
		</div>
	{:else if $page === "blank"}
		<div />
	{:else if $page === "go"}
		<div class="fullcenter">Let's go!</div>
	{:else}
		<div class="fullcenter">
			<div class="column-ui">
				Somehow, you got to a page that doesn't exist...
				<br />
				(Current page: {$page})

				<div class="buttons">
					<button on:click={() => page.set("logo")}>Go back!</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.setup {
		background-color: var(--orange);
		color: var(--foreground-orange);
		font-size: 150%;
		transition: 0.25s;

		text-align: center;

		position: absolute;
		top: 0;
		left: 0;
		z-index: 1000;

		width: 100%;
		min-height: 100vh;
		height: 100%;

		display: table;
	}
	.setupnobg {
		background-color: #0A0A0A;
		color: #FFFFFF;
		font-size: 150%;

		text-align: center;

		position: absolute;
		top: 0;
		left: 0;
		z-index: 1000;

		width: 100%;
		min-height: 100vh;
		height: 100%;

		display: table;
	}
	.fullcenter {
		width: 100%;
		height: 100%;
		box-sizing: border-box;

		margin: auto;
		overflow: auto;

		display: table-cell;
		vertical-align: middle;
		padding: 0.5em;
	}
	.presvl-fullcenter {
		width: 40vh;
		height: 40vh;
		box-sizing: border-box;
		position: absolute; 
		z-index: -2;

		top: 50%;
		left: 50%;
		transform: translate(-50%,-50%);

		margin: auto;
		overflow: auto;

		display: table-cell;
		vertical-align: middle;
		padding: 0.5em;
	}

	.setup.white {
		background-color: var(--background);
		color: var(--orange-button);
	}
	.logo-img {
		transition: height 0.3s cubic-bezier(0, 1, 1, 1);
		user-select: none;
	}
	.setup:not(.white) .logo-img {
		filter: brightness(0) invert(1);
	}


	.logo-img-color {
		filter: brightness(10) !important;
	}

	.small {
		font-size: 75%;
	}

	.column-ui {
		width: 24em;
		max-width: calc(100vw - 2em);
		min-height: 8em;

		position: relative;

		margin: auto;
	}
	.column-ui > * {
		width: 100%;
	}
	.column-ui .buttons {
		display: flex;
		width: 24em;
		max-width: 100%;

		margin-top: 2em;
	}
	.column-ui .buttons * {
		flex-grow: 1;
		flex-shrink: 1;
		padding-left: 0;
		padding-right: 0;
	}

	.login-status {
		height: 0;
		overflow: visible;
	}

	label,
	.checkboxes input {
		vertical-align: middle;
	}

	.checkboxes {
		text-align: left;
		font-size: 90%;
	}

	button,
	input {
		margin-bottom: 0.2cm;
	}

	.buttons {
		display: grid;
		grid-auto-flow: column;
		grid-column-gap: 8px;
	}
</style>
