import type { Document } from "insite-db";
import type { AbilitiesSchema } from "insite-users-server";
import { CollectionMapPublication as GenericCollectionMapPublication } from "../CollectionMapPublication";
import { SubscriptionArgs } from "./types";


export class CollectionMapPublication<
	D extends Document = Document,
	AS extends AbilitiesSchema = AbilitiesSchema,
	RA extends unknown[] = unknown[]
> extends GenericCollectionMapPublication<D, SubscriptionArgs<AS, RA>> {
	// eslint-disable-next-line no-useless-constructor
	constructor(...args: ConstructorParameters<typeof GenericCollectionMapPublication<D, SubscriptionArgs<AS, RA>>>) {
		super(...args);
	}
}
