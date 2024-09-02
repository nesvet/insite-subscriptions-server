import type { AbilitiesSchema } from "insite-common";
import { Publication as GenericPublication } from "../Publication";
import type { WSSubscriptionArgs } from "./types";


/* eslint-disable @typescript-eslint/no-explicit-any, no-useless-constructor */


export class Publication<
	AS extends AbilitiesSchema = AbilitiesSchema,
	RA extends any[] = any[]
> extends GenericPublication<WSSubscriptionArgs<AS, RA>> {
	constructor(...args: ConstructorParameters<typeof GenericPublication<WSSubscriptionArgs<AS, RA>>>) {
		super(...args);
	}
}
