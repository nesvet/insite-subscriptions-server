import type { AbilitiesSchema } from "insite-common";
import { SubscriptionHandle as GenericSubscriptionHandle } from "../SubscriptionHandle";
import type { WSSubscriptionArgs } from "./types";


/* eslint-disable @typescript-eslint/no-explicit-any, no-useless-constructor */


export class SubscriptionHandle<
	AS extends AbilitiesSchema = AbilitiesSchema,
	RA extends any[] = any[]
> extends GenericSubscriptionHandle<WSSubscriptionArgs<AS, RA>> {
	constructor(...args: ConstructorParameters<typeof GenericSubscriptionHandle<WSSubscriptionArgs<AS, RA>>>) {
		super(...args);
	}
}
