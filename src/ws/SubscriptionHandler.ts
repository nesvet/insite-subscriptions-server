import type { InSiteWebSocketServer, InSiteWebSocketServerClient } from "insite-ws/server";
import { AbilitiesSchema } from "insite-users-server";
import { publications } from "../Publication";
import { CollectionMapSubscriptionHandle } from "./CollectionMapSubscriptionHandle";
import { SubscriptionHandle } from "./SubscriptionHandle";
import { Subscriptions } from "./Subscriptions";
import { WithUser } from "./types";


const types = [ "object", "map" ] as const;


export class SubscriptionHandler<AS extends AbilitiesSchema> {
	constructor(wss: InSiteWebSocketServer) {
		
		wss.on("client-connect", this.handleClientConnect);
		wss.on("client-session", this.handleClientSession);
		wss.on("client-message:s-s"/* subscription subscribe */, this.handleClientSubscribe);
		wss.on("client-message:s-u"/* subscription unsubscribe */, this.handleClientUnsubscribe);
		wss.on("client-close", this.handleClientClose);
		
		wss.on("should-renew-subscriptions", this.renewSubscriptionsFor);
		
	}
	
	private wsSubscriptionMap = new WeakMap<WithUser<InSiteWebSocketServerClient, AS>, Subscriptions<AS>>();
	
	renewSubscriptionsFor(webSockets: WithUser<InSiteWebSocketServerClient, AS>[]) {
		for (const wssc of webSockets)
			this.wsSubscriptionMap.get(wssc)?.renew();
		
	}
	
	handleClientConnect(wssc: WithUser<InSiteWebSocketServerClient, AS>) {
		this.wsSubscriptionMap.set(wssc, new Subscriptions());
		
	}
	
	handleClientSession(wssc: WithUser<InSiteWebSocketServerClient, AS>) {
		this.wsSubscriptionMap.get(wssc)?.renew();
		
	}
	
	handleClientSubscribe(
		wssc: WithUser<InSiteWebSocketServerClient, AS>,
		subscriptionType: typeof types[number],
		publicationName: string,
		i: number | string,
		args: unknown[],
		immediately?: boolean
	) {
		
		if (types.includes(subscriptionType) && publications.get(publicationName)?.type === subscriptionType) {
			const handler = (data: unknown) => wssc.sendMessage("s-c"/* subscription changed */, i, data);
			
			this.wsSubscriptionMap.get(wssc)?.subscribe(
				i,
				subscriptionType === "map" ?
					new CollectionMapSubscriptionHandle(publicationName, [ wssc, ...args ], handler, immediately) :
					new SubscriptionHandle(publicationName, [ wssc, ...args ], handler, immediately)
			);
		}
		
	}
	
	handleClientUnsubscribe(wssc: WithUser<InSiteWebSocketServerClient, AS>, i: number | string) {
		this.wsSubscriptionMap.get(wssc)?.cancel(i);
		
	}
	
	handleClientClose(wssc: WithUser<InSiteWebSocketServerClient, AS>) {
		for (const subscription of this.wsSubscriptionMap.get(wssc)?.values() ?? [])
			subscription.cancel();
		
	}
	
}
