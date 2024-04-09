export const publications = new Map();


export class Publication {
	constructor(name, props) {
		this.name = name;
		Object.assign(this, props);
		
		publications.set(name, this);
		
	}
	
	type = "object";
	
	subscriptions = new Set();
	
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	fetch() {}
	
	fetchSubscription(subscription) {
		return this.fetch(...subscription.args);
	}
	
	subscribe(subscription) {
		this.subscriptions.add(subscription);
		this.onSubscribe?.(subscription);
		
	}
	
	changed(changed) {
		for (const subscription of this.subscriptions)
			subscription.changed(changed);
		
	}
	
	unsubscribe(subscription) {
		this.onUnsubscribe?.(subscription);
		this.subscriptions.delete(subscription);
		
	}
	
}
