import type { Document, InSiteWatchedCollection } from "insite-db";
import type { AbilitiesSchema } from "insite-users-server";
import { CollectionMapPublication as GenericCollectionMapPublication } from "../CollectionMapPublication";
import { SubscriptionArgs } from "./types";


/* eslint-disable @typescript-eslint/no-explicit-any, no-useless-constructor */


type RestArgs<
	AS extends AbilitiesSchema = AbilitiesSchema,
	D extends Document = Document,
	RA extends unknown[] = unknown[],
	T extends abstract new (...args: any) => any = typeof GenericCollectionMapPublication<D, SubscriptionArgs<AS, RA>>
> = T extends abstract new (first: any, ...rest: infer R) => any ? R : never;


export class CollectionMapPublication<
	D extends Document = Document,
	AS extends AbilitiesSchema = AbilitiesSchema,
	RA extends unknown[] = unknown[]
> extends GenericCollectionMapPublication<D, SubscriptionArgs<AS, RA>> {
	constructor(collection: InSiteWatchedCollection<D>, ...restArgs: RestArgs<AS, D, RA>) {
		super(collection, ...restArgs);
	}
}
