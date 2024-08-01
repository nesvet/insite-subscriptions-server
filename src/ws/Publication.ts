import type { AbilitiesSchema } from "insite-users-server";
import { Publication as GenericPublication } from "../Publication";
import { SubscriptionArgs } from "./types";


export class Publication<
	AS extends AbilitiesSchema = AbilitiesSchema,
	RA extends unknown[] = unknown[]
> extends GenericPublication<SubscriptionArgs<AS, RA>> {
	// eslint-disable-next-line no-useless-constructor
	constructor(...args: ConstructorParameters<typeof GenericPublication<SubscriptionArgs<AS, RA>>>) {
		super(...args);
	}
}
