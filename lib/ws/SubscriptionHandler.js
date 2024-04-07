import { CollectionMapSubscriptionHandle } from "../CollectionMapSubscriptionHandle";
import { publications } from "../Publication";
import { SubscriptionHandle } from "../SubscriptionHandle";
import { Subscriptions } from "./Subscriptions";


const handlesByType = {
	object: SubscriptionHandle,
	map: CollectionMapSubscriptionHandle
};


export class SubscriptionHandler {
	constructor(wss, options = {}) {
		
		const {
			users
		} = options;
		
		if (users)
			users.on("user-permissions-change", SubscriptionHandler.handleUserPermissionsChange);
		
		wss.on("client-connect", SubscriptionHandler.handleClientConnect);
		wss.on("client-session", SubscriptionHandler.handleClientSession);
		wss.on("client-message:s-s"/* subscription subscribe */, SubscriptionHandler.handleClientSubscribe);
		wss.on("client-message:s-u"/* subscription unsubscribe */, SubscriptionHandler.handleClientUnsubscribe);
		wss.on("client-close", SubscriptionHandler.handleClientClose);
		
	}
	
	
	static handleUserPermissionsChange(user) {
		if (user.webSockets)
			for (const ws of user.webSockets)
				ws.subscriptions.renew();
		
	}
	
	static handleClientConnect(ws) {
		ws.subscriptions = new Subscriptions();
		
	}
	
	static handleClientSession(ws) {
		ws.subscriptions.renew();
		
	}
	
	static handleClientSubscribe(ws, subscriptionType, publicationName, i, args, immediately) {
		const Handle = handlesByType[subscriptionType];
		
		if (Handle && publications.get(publicationName)?.type === subscriptionType) {
			const handler = data => ws.sendMessage("s-c"/* subscription changed */, i, data);
			ws.subscriptions.subscribe(i, new Handle(publicationName, [ ws, ...args ], handler, immediately));
		}
		
	}
	
	static handleClientUnsubscribe(ws, i) {
		ws.subscriptions.cancel(i);
		
	}
	
	static handleClientClose(ws) {
		for (const subscription of ws.subscriptions.values())
			subscription.cancel();
		
	}
	
}
