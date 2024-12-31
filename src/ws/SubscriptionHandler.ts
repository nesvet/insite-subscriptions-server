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
import type { CollectionMapPublicationArgs, PublicationArgs, WSSubscriptionArgs } from "./types";


/* eslint-disable @typescript-eslint/no-explicit-any */


const types = [ "object", "map" ] as const;


function isPublicationCollectionMap<
	AS extends AbilitiesSchema,
	D extends Document
>(
	publication: CollectionMapPublication<AS, D> | Publication<AS>
): publication is CollectionMapPublication<AS, D> {
	return publication.type === "map";
}

function isCollectionMapPublicationArgs<
	AS extends AbilitiesSchema,
	D extends Document,
	RA extends any[] = any[]
>(args: CollectionMapPublicationArgs<AS, D, RA> | PublicationArgs<AS, RA>): args is CollectionMapPublicationArgs<AS, D, RA> {
	return args[0] instanceof Collection;
}


export class SubscriptionHandler<AS extends AbilitiesSchema> {
	constructor(wss: InSiteWebSocketServer, withCollections?: boolean) {
		
		wss.on("client-connect", this.#handleClientConnect);
		wss.on("client-session", this.#handleClientSession);
		wss.on("client-message:s-s"/* subscription subscribe */, this.#handleClientSubscribe);
		wss.on("client-message:s-u"/* subscription unsubscribe */, this.#handleClientUnsubscribe);
		wss.on("client-close", this.#handleClientClose);
		
		wss.on("should-renew-subscriptions", this.renewSubscriptionsFor);
		
		Object.assign(wss, withCollections ? {
			publish<RA extends any[], D extends Document>(...args: CollectionMapPublicationArgs<AS, D, RA> | PublicationArgs<AS, RA>) {
				return isCollectionMapPublicationArgs(args) ?
					new CollectionMapPublication<AS, D, RA>(...args) :
					new Publication<AS, RA>(...args);
			}
		} : {
			publish<RA extends any[]>(...args: PublicationArgs<AS, RA>) {
				return new Publication<AS, RA>(...args);
			}
		});
		
	}
	
	#wsSubscriptionMap = new WeakMap<WSSCWithUser<AS>, Subscriptions<AS>>();
	
	renewSubscriptionsFor = (webSockets: WSSCWithUser<AS>[]) => {
		for (const wssc of webSockets)
			this.#wsSubscriptionMap.get(wssc)?.renew();
		
	};
	
	#handleClientConnect = (wssc: WSSCWithUser<AS>) =>
		this.#wsSubscriptionMap.set(wssc, new Subscriptions());
	
	#handleClientSession = (wssc: WSSCWithUser<AS>) =>
		this.#wsSubscriptionMap.get(wssc)?.renew();
	
	#handleClientSubscribe = (
		wssc: WSSCWithUser<AS>,
		subscriptionType: typeof types[number],
		publicationName: string,
		i: number | string,
		restArgs: any[],
		immediately?: boolean
	) => {
		
		if (types.includes(subscriptionType)) {
			const publication = publications.get(publicationName) as CollectionMapPublication<AS> | Publication<AS> | undefined;
			
			if (publication?.type === subscriptionType) {
				const subscriptionHandleArgs = [
					publicationName,
					[ wssc, ...restArgs ] as WSSubscriptionArgs<AS>,
					(data: unknown) => wssc.sendMessage("s-c"/* subscription changed */, i, data),
					immediately
				] as const;
				
				this.#wsSubscriptionMap
					.get(wssc)
					?.subscribe(i,
						isPublicationCollectionMap(publication) ?
							new CollectionMapSubscriptionHandle<AS>(...subscriptionHandleArgs) :
							new SubscriptionHandle<AS>(...subscriptionHandleArgs)
					);
			}
		}
		
	};
	
	#handleClientUnsubscribe = (wssc: WSSCWithUser<AS>, i: number | string) =>
		this.#wsSubscriptionMap.get(wssc)?.cancel(i);
	
	#handleClientClose = (wssc: WSSCWithUser<AS>) => {
		for (const subscription of this.#wsSubscriptionMap.get(wssc)?.values() ?? [])
			subscription.cancel();
		
	};
	
}
