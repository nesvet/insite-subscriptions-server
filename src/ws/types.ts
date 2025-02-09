import type { AbilitiesSchema } from "insite-common";
import {
	Collection,
	type Document,
	type Filter,
	type WatchedCollection,
	type Sort
} from "insite-db";
import type { WSSCWithUser } from "insite-users-server-ws";
import type { Projection, PublicationProps, TransformableDoc } from "../types";
import type { CollectionMapPublication } from "./CollectionMapPublication";
import type { Publication } from "./Publication";


/* eslint-disable @typescript-eslint/no-explicit-any */


export type WSSubscriptionArgs<
	AS extends AbilitiesSchema,
	RA extends any[] = any[]
> = [ WSSCWithUser<AS>, ...RA ];


export type PublicationArgs<
	AS extends AbilitiesSchema,
	RA extends any[] = any[]
> = [
	name: string,
	props?: PublicationProps<WSSubscriptionArgs<AS, RA>>
];

export type WithPublish<T, AS extends AbilitiesSchema> = T & {
	publish<RA extends any[]>(...args: PublicationArgs<AS, RA>): Publication<AS, RA>;
};


type QueryProps<D extends Document> = {
	query?: Filter<D>;
	projection?: Projection;
	sort?: Sort;
	triggers?: string[];
};

export type CollectionMapPublicationArgs<
	AS extends AbilitiesSchema,
	D extends Document,
	RA extends any[] = any[]
> = [
	collection: WatchedCollection<D>,
	name: string,
	queryProps?: ((...args: WSSubscriptionArgs<AS, RA>) => false | null | QueryProps<D> | void) | false | null | QueryProps<D>,
	transform?: (doc: TransformableDoc<D>, args: WSSubscriptionArgs<AS, RA>) => void
];

export type WithPublishCollection<T, AS extends AbilitiesSchema> = T & WithPublish<T, AS> & {
	publish<RA extends any[], D extends Document>(...args: CollectionMapPublicationArgs<AS, D, RA>): CollectionMapPublication<AS, D, RA>;
};


export function isPublicationCollectionMap<
	AS extends AbilitiesSchema,
	D extends Document
>(
	publication: CollectionMapPublication<AS, D> | Publication<AS>
): publication is CollectionMapPublication<AS, D> {
	return publication.type === "map";
}

export function isCollectionMapPublicationArgs<
	AS extends AbilitiesSchema,
	D extends Document,
	RA extends any[] = any[]
>(args: CollectionMapPublicationArgs<AS, D, RA> | PublicationArgs<AS, RA>): args is CollectionMapPublicationArgs<AS, D, RA> {
	return args[0] instanceof Collection;
}
