export class Subscriptions extends Map {
	
	subscribe = this.set;
	
	renew() {
		return Promise.all(this.mapValues(subscription => subscription.renew()));
	}
	
	cancel(key) {
		this.get(key)?.cancel();
		this.delete(key);
		
	}
	
}
