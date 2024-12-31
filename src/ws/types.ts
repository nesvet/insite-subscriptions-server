import type { AbilitiesSchema } from "insite-common";
import type {
	Document,
	Filter,
	InSiteWatchedCollection,
	Sort
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

export type CollectionMapPublicationArgs<
	AS extends AbilitiesSchema,
	D extends Document,
	RA extends any[] = any[]
> = [
	collection: InSiteWatchedCollection<D>,
	name: string,
	queryProps?: ((...args: WSSubscriptionArgs<AS, RA>) => false | null | QueryProps<D> | void) | false | null | QueryProps<D>,
	transform?: (doc: TransformableDoc<D>, args: WSSubscriptionArgs<AS, RA>) => void
];


type Publish<
	AS extends AbilitiesSchema,
	RA extends any[] = any[]
> = {
	(...args: PublicationArgs<AS, RA>): Publication<AS, RA>;
};

type PublishCollection<
	AS extends AbilitiesSchema,
	D extends Document = Document,
	RA extends any[] = any[]
> = {
	(...args: CollectionMapPublicationArgs<AS, D, RA>): CollectionMapPublication<AS, D, RA>;
};


type QueryProps<D extends Document> = {
	query?: Filter<D>;
	projection?: Projection;
	sort?: Sort;
	triggers?: string[];
};


export type WithPublish<T, AS extends AbilitiesSchema> = {
	publish<RA extends any[]>(...args: PublicationArgs<AS, RA>): Publish<AS, RA>;
} & T;

export type WithPublishCollection<T, AS extends AbilitiesSchema> = {
	publish<RA extends any[], D extends Document>(...args: CollectionMapPublicationArgs<AS, D, RA>): PublishCollection<AS, D, RA>;
} & T & WithPublish<T, AS>;
