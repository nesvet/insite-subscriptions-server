import type { InSiteWebSocketServer } from "insite-ws/server";
import type { AbilitiesSchema } from "insite-common";
import { Collection, type Document } from "insite-db";
import type { WSSCWithUser } from "insite-users-server-ws";
import { publications } from "../Publication";
import { CollectionMapPublication } from "./CollectionMapPublication";
import { CollectionMapSubscriptionHandle } from "./CollectionMapSubscriptionHandle";
import { Publication } from "./Publication";
import { SubscriptionHandle } from "./SubscriptionHandle";
import { Subscriptions } from "./Subscriptions";


const types = [ "object", "map" ] as const;

function isPublicationCollectionMap<AS extends AbilitiesSchema>(publication: CollectionMapPublication<AS> | Publication<AS>): publication is CollectionMapPublication<AS> {
	return publication.type === "map";
}

export type WithPublish<T, AS extends AbilitiesSchema> = {
	publish(...args: ConstructorParameters<typeof Publication>): Publication<AS>;
} & T;

export type WithPublishCollection<T, AS extends AbilitiesSchema> = {
	publish<D extends Document>(...args: ConstructorParameters<typeof CollectionMapPublication<AS, D>>): CollectionMapPublication<AS, D>;
} & WithPublish<T, AS>;

function isCollectionMapPublicationArgs(args: ConstructorParameters<typeof CollectionMapPublication> | ConstructorParameters<typeof Publication>): args is ConstructorParameters<typeof CollectionMapPublication> {
	return args[0] instanceof Collection;
}


export class SubscriptionHandler<AS extends AbilitiesSchema> {
	constructor(wss: InSiteWebSocketServer, withCollections?: boolean) {
		
		wss.on("client-connect", this.handleClientConnect);
		wss.on("client-session", this.handleClientSession);
		wss.on("client-message:s-s"/* subscription subscribe */, this.handleClientSubscribe);
		wss.on("client-message:s-u"/* subscription unsubscribe */, this.handleClientUnsubscribe);
		wss.on("client-close", this.handleClientClose);
		
		wss.on("should-renew-subscriptions", this.renewSubscriptionsFor);
		
		Object.assign(wss, {
			publish: withCollections ?
				function publishWithCollections(...args: ConstructorParameters<typeof CollectionMapPublication> | ConstructorParameters<typeof Publication>) {
					if (isCollectionMapPublicationArgs(args))
						return new CollectionMapPublication<AS>(...args);
					
					return new Publication<AS>(...args);
				} :
				function (...args: ConstructorParameters<typeof Publication>) {
					return new Publication<AS>(...args);
				}
		});
		
	}
	
	private wsSubscriptionMap = new WeakMap<WSSCWithUser<AS>, Subscriptions<AS>>();
	
	renewSubscriptionsFor = (webSockets: WSSCWithUser<AS>[]) => {
		for (const wssc of webSockets)
			this.wsSubscriptionMap.get(wssc)?.renew();
		
	};
	
	private handleClientConnect = (wssc: WSSCWithUser<AS>) =>
		this.wsSubscriptionMap.set(wssc, new Subscriptions());
	
	private handleClientSession = (wssc: WSSCWithUser<AS>) =>
		this.wsSubscriptionMap.get(wssc)?.renew();
	
	private handleClientSubscribe = (
		wssc: WSSCWithUser<AS>,
		subscriptionType: typeof types[number],
		publicationName: string,
		i: number | string,
		args: unknown[],
		immediately?: boolean
	) => {
		
		if (types.includes(subscriptionType)) {
			const publication = publications.get(publicationName) as CollectionMapPublication<AS> | Publication<AS> | undefined;
			
			if (publication?.type === subscriptionType) {
				const handler = (data: unknown) => wssc.sendMessage("s-c"/* subscription changed */, i, data);
				
				let subscriptionHandle;
				if (isPublicationCollectionMap(publication)) {
					type D = typeof publication extends CollectionMapPublication<AS, infer DD> ? DD : never;
					subscriptionHandle = new CollectionMapSubscriptionHandle<AS, D>(publicationName, [ wssc, ...args ], handler, immediately);
				} else
					subscriptionHandle = new SubscriptionHandle<AS>(publicationName, [ wssc, ...args ], handler, immediately);
				
				this.wsSubscriptionMap.get(wssc)?.subscribe(i, subscriptionHandle);
			}
		}
		
	};
	
	private handleClientUnsubscribe = (wssc: WSSCWithUser<AS>, i: number | string) =>
		this.wsSubscriptionMap.get(wssc)?.cancel(i);
	
	private handleClientClose = (wssc: WSSCWithUser<AS>) => {
		for (const subscription of this.wsSubscriptionMap.get(wssc)?.values() ?? [])
			subscription.cancel();
		
	};
	
}
