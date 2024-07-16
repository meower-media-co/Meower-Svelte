<script>
    import {OOBERunning, OOBEPage} from "../stores.js";
    import {goto} from "@roxi/routify";

    let tosettings = true
</script>

<h1>Thats it for now.</h1>
<p>You can customize more things via the settings</p>
<p>To access settings, click on your pfp (Profile picture) icon in the bottom left.</p>
<p>or, you can optionally go to the settings here</p>
<div id="exitthingy">
    <label for="SettingsONExit">Exit the OOBE to settings</label>
    <input
        type="checkbox"
        id="SettingsONExit"
        bind:checked={tosettings}
    /> 
</div>
<br />
<button
    on:click={() => {
        if (tosettings) {
            $goto("/settings")
        } else {
            $goto("/home")
        }
        OOBERunning.set(false);
    }}>Exit the OOBE</button
>

<style>
    #exitthingy label {
        bottom: 0.65em;
        position: relative;
    }
</style>