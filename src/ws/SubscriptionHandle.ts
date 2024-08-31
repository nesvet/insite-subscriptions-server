import type { AbilitiesSchema } from "insite-common";
import { SubscriptionHandle as GenericSubscriptionHandle } from "../SubscriptionHandle";
import { SubscriptionArgs } from "./types";


export class SubscriptionHandle<
	AS extends AbilitiesSchema = AbilitiesSchema,
	RA extends unknown[] = unknown[]
> extends GenericSubscriptionHandle<SubscriptionArgs<AS, RA>> {
	// eslint-disable-next-line no-useless-constructor
	constructor(...args: ConstructorParameters<typeof GenericSubscriptionHandle<SubscriptionArgs<AS, RA>>>) {
		super(...args);
	}
}
