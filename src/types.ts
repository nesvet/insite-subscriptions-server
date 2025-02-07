import type { Document } from "insite-db";
import type { SubscriptionHandle } from "./SubscriptionHandle";


/* eslint-disable @typescript-eslint/no-explicit-any */


export type PartialWithId<D extends Document> = { _id: string } & Partial<D>;

export type TransformableDoc<D extends Document> = { [key: string]: any } & PartialWithId<D>;

export type PublicationProps<SA extends SubscriptionArgs> = {
	type?: "object";
	fetch?: (...args: SA) => unknown;
	fetchSubscription?: (subscription: SubscriptionHandle<SA>) => unknown;
	onSubscribe?: (subscription: SubscriptionHandle<SA>) => void;
	onUnsubscribe?: (subscription: SubscriptionHandle<SA>) => void;
};

export type SubscriptionArgs = unknown[];

export type SubscriptionHandler = (fetched: unknown, reason?: unknown) => void;

export type Projection = {
	[key: string]: boolean | number | Projection;
};
