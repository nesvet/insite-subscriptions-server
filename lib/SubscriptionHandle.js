import { publications } from "./Publication";


export class SubscriptionHandle {
	constructor(publicationName, args, handler, immediately, prevent) {
		this.publication = publications.get(publicationName);
		
		if (this.publication) {
			this.args = args;
			this.handler = handler;
			
			if (!prevent) {
				this.publication.subscribe(this);
				
				if (immediately)
					this.changed(null);
			}
			
		} else if (process.env.NODE_ENV === "development")
			console.error("Unknown publication", publicationName);
		
	}
	
	async changed(changed) {
		this.handler(await this.publication.fetchSubscription(this, changed), changed);
		
	}
	
	cancel() {
		
		this.publication?.unsubscribe(this);
		
	}
	
	renew() {
		
		this.publication?.unsubscribe(this);
		
		this.publication?.subscribe(this);
		
		return this.changed(null);
	}
	
}
