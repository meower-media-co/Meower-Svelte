<!--
	The home page!
	It features live post updates and a load more button which is pretty nice.
-->
<script>
	import {
		ulist,
		mainPage as page,
	} from "../lib/stores.js";
	import Container from "../lib/Container.svelte";
	import PostList from "../lib/PostList.svelte";
</script>

<div class="home">
	<Container>
		<h1>Home</h1>
		There are currently {$ulist.length} user(s) online{#if $ulist.length}{" "}({$ulist.join(
				", "
			)}){/if}.
	</Container>
	<PostList
		fetchUrl="home"
		postOrigin="home"
		canPost={true}
	/>
</div>

<style>
	.home {
		height: 100%;
	}
</style>
