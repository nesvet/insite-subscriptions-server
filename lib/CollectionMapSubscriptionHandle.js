import { SubscriptionHandle } from "./SubscriptionHandle";


export class CollectionMapSubscriptionHandle extends SubscriptionHandle {
	constructor(publicationName, args, handler, immediately) {
		super(publicationName, args, handler, immediately, true);
		
		if (this.publication) {
			this.publication.subscribe(this);
			
			this.skipSymbol = this.publication.skipSymbol;
			
			if (immediately)
				this.changed(null);
		}
		
	}
	
	ids = new Set();
	
	async changed(next) {
		this.handler([ await this.publication.fetchSubscription(this, next) ]);
		
	}
	
	updates = [];
	flushTimeout = null;
	
	handleUpdatedFieldsSome = field => this.fields.has(field);
	
	flushUpdates = () => {
		
		if (this.updates.length) {
			this.handler(this.updates);
			this.updates = [];
		}
		
	};
	
	collectionChangeListener = async next => {
		
		if (
			!next[this.skipSymbol] &&
			(this.ids.has(next.documentKey._id) ? (
				next.operationType !== "update" ||
				!this.fields ||
				Object.keys(next.updateDescription.updatedFields).some(this.handleUpdatedFieldsSome)
			) : this.match(next.fullDocument))
		) {
			clearTimeout(this.flushTimeout);
			
			this.updates.push(await this.publication.fetchSubscription(this, next));
			
			this.flushTimeout = setTimeout(this.flushUpdates, 1);
		}
		
	};
	
	
}
