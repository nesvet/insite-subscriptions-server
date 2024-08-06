import type { AbilitiesSchema } from "insite-users-server";
import type { WSSCWithUser } from "insite-users-server-ws";


export type SubscriptionArgs<
	AS extends AbilitiesSchema = AbilitiesSchema,
	RA extends unknown[] = unknown[]
> = [ WSSCWithUser<AS>, ...RA ];
