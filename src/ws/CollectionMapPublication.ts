import type { AbilitiesSchema } from "insite-common";
import type { Document, InSiteWatchedCollection } from "insite-db";
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
	AS extends AbilitiesSchema = AbilitiesSchema,
	D extends Document = Document,
	RA extends unknown[] = unknown[]
> extends GenericCollectionMapPublication<D, SubscriptionArgs<AS, RA>> {
	constructor(collection: InSiteWatchedCollection<D>, ...restArgs: RestArgs<AS, D, RA>) {
		super(collection, ...restArgs);
	}
}
