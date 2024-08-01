import type { InSiteWebSocketServerClient } from "insite-ws/server";
import type { AbilitiesSchema, Session, User } from "insite-users-server";


export type WithUser<T, AS extends AbilitiesSchema = AbilitiesSchema> = {
	user?: User<AS>;
	lastUserId?: string;
	session?: Session<AS>;
} & T;

export type SubscriptionArgs<
	AS extends AbilitiesSchema = AbilitiesSchema,
	RA extends unknown[] = unknown[]
> = [ WithUser<InSiteWebSocketServerClient, AS>, ...RA ];
