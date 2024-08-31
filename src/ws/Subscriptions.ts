import type { AbilitiesSchema } from "insite-common";
import type { CollectionMapSubscriptionHandle } from "./CollectionMapSubscriptionHandle";
import type { SubscriptionHandle } from "./SubscriptionHandle";


export class Subscriptions<AS extends AbilitiesSchema> extends Map<number | string, CollectionMapSubscriptionHandle<AS> | SubscriptionHandle<AS>> {
	
	subscribe = this.set;
	
	renew() {
		return Promise.all([ ...this.values() ].map(subscription => subscription.renew()));
	}
	
	cancel(key: number | string) {
		this.get(key)?.cancel();
		this.delete(key);
		
	}
	
}
