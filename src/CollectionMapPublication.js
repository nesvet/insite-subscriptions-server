import sift from "sift";
import { Publication } from "./Publication";


function projectDocument(document, projection, isInclusive = true, isTop = true) {
	if (projection)
		if (isInclusive) {
			const projected = {};
			for (const key in projection) {
				const subprojection = projection[key];
				projected[key] =
					typeof subprojection == "object" ?
						Array.isArray(document[key]) ?
							document[key].map(item => projectDocument(item, subprojection, true, false)) :
							projectDocument(document[key], subprojection, true, false) :
						document[key];
			}
			if (isTop && projection._id === 0)
				delete projected._id;
			
			return projected;
		} else {
			const projected = { ...document };
			for (const key in projection) {
				const subprojection = projection[key];
				if (typeof subprojection == "object")
					projected[key] =
						Array.isArray(document[key]) ?
							document[key].map(item => projectDocument(item, subprojection, false, false)) :
							projectDocument(document[key], subprojection, false, false);
				 else
					delete projected[key];
			}
			
			return projected;
		}
	
	return document;
}


export class CollectionMapPublication extends Publication {
	constructor(name, collection, queryProps, transform) {
		super(name, { collection, queryProps, transform });
		
	}
	
	type = "map";
	
	skipSymbol = Symbol("skip");
	
	skip(next) {
		next[this.skipSymbol] = true;
		
	}
	
	makeQueryProps(args) {
		const { query = null, projection = null, sort = null, triggers } = (typeof this.queryProps == "function" ? this.queryProps(...args) : this.queryProps) || {};
		
		let isProjectionInclusive = null;
		let fields = null;
		if (projection) {
			for (const key in projection) {
				isProjectionInclusive = !!projection[key];
				if (key !== "_id")
					break;
			}
			if (isProjectionInclusive) {
				fields = new Set([ ...Object.keys(query), ...Object.keys(projection), ...triggers ?? [] ]);
				fields.delete("_id");
				if (projection._id !== 0)
					projection._id = 1;
			}
		}
		
		return { query, projection, isProjectionInclusive, fields, sort, args };
	}
	
	async fetchSubscription(subscription, next) {
		if (subscription.query) {
			if (next) {
				const { _id } = next.documentKey;
				
				if (next.operationType === "insert" || (next.operationType != "delete" && subscription.match(next.fullDocument))) {
					const doc = projectDocument(next.fullDocument, subscription.projection, subscription.isProjectionInclusive);
					this.transform?.(doc, subscription.args);
					if (subscription.ids.has(_id))
						return [ "u"/* update */, doc, next.updateDescription && Object.keys(next.updateDescription.updatedFields) ];
					
					subscription.ids.add(_id);
					
					return [ "c"/* create */, doc ];
					
				}
				subscription.ids.delete(_id);
				
				return [ "d"/* delete */, _id ];
				
			}
			const cursor = this.collection.find(subscription.query);
			
			if (subscription.projection)
				cursor.project(subscription.projection);
			
			if (subscription.sort)
				cursor.sort(subscription.sort);
			
			const array = await cursor.toArray();
			
			if (subscription.ids) {
				subscription.ids.clear();
				if (this.transform)
					for (const item of array) {
						subscription.ids.add(item._id);
						this.transform(item, subscription.args);
					}
				else
					for (const item of array)
						subscription.ids.add(item._id);
			} else if (this.transform)
				for (const item of array)
					this.transform(item, subscription.args);
			
			return [ "i"/* initial */, array, subscription.sort ];
			
		}
		
		return null;
	}
	
	async fetch(...args) {
		return [ await this.fetchSubscription(this.makeQueryProps(args), null) ];
	}
	
	changed(changed) {
		return Promise.all(this.subscriptions.map(subscription => subscription.changed(changed)));
	}
	
	onSubscribe(subscription) {
		Object.assign(subscription, this.makeQueryProps(subscription.args));
		
		if (subscription.query) {
			subscription.match = sift(subscription.query);
			this.collection.changeListeners.add(subscription.collectionChangeListener);
		}
		
	}
	
	flushInitial() {
		return Promise.all(this.subscriptions.map(async subscription => {
			subscription.handler([ await this.fetchSubscription(subscription) ]);
			subscription.updates = [];
			
		}));
	}
	
	onUnsubscribe(subscription) {
		if (subscription.query)
			this.collection.changeListeners.delete(subscription.collectionChangeListener);
		
	}
	
}
