import type { Document } from "insite-db";
import type { AbilitiesSchema } from "insite-users-server";
import {
	CollectionMapSubscriptionHandle as GenericCollectionMapSubscriptionHandle
} from "../CollectionMapSubscriptionHandle";
import { SubscriptionArgs } from "./types";


export class CollectionMapSubscriptionHandle<
	AS extends AbilitiesSchema = AbilitiesSchema,
	D extends Document = Document,
	RA extends unknown[] = unknown[]
> extends GenericCollectionMapSubscriptionHandle<D, SubscriptionArgs<AS, RA>> {
	// eslint-disable-next-line no-useless-constructor
	constructor(...args: ConstructorParameters<typeof GenericCollectionMapSubscriptionHandle<D, SubscriptionArgs<AS, RA>>>) {
		super(...args);
	}
}
