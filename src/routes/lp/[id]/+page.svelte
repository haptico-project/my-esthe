<!-- /lp/XXXX … 店舗コードをパスで受け取り、LP へ ?agencyCode=XXXX で送る（/XXXX と同じ仕様） -->
<script lang="ts">
	import AgencyCodeRedirect from '$lib/agency/AgencyCodeRedirect.svelte';
</script>

<AgencyCodeRedirect to="/lp" />
