define([
	'dojo/_base/lang',
	'dojo/_base/array'
], function (lang, array) {
	function monitor(source, sourceProperty, callback, options) {
		//	summary:
		//		Observes an object at `source[sourceProperty]` and calls
		//		`callback` upon any changes

		var bindKey = sourceProperty.split('.'),
			watchHandles = [],
			reset = options.reset,
			initialize = options.initialize;

		function rebind(object, i) {
			//	summary:
			//		Rebinds object watchers when an intermediate object
			//		in the bound chain has been modified
			//	object:
			//		The new object bound to the key at index `i`.
			//	i:
			//		The index of the key that has changed.

			// Stop watching any objects that are no longer part of the bound object chain
			array.forEach(watchHandles.splice(i), function (handle) { handle.remove && handle.remove(); });

			// trying to rebind an object set to null, skip it
			if (!object) {
				reset && reset.call(source);
				return;
			}

			// If any of the intermediate objects between `object` and the key we are actually binding
			// change, we need to rebind the entire object chain from the changed object
			for (var key; (key = bindKey[i]) && i < bindKey.length - 1; ++i) {
				// If the watched key changes, rebind that object
				watchHandles.push(object.watch(key, lang.partial(function (i, key, oldValue, value) {
					rebind(value, i + 1);
				}, i)));

				// If there is no object here, we cannot rebind any further; presumably, at some point in
				// the future, an object might exist here
				if (!(object = object.get(key))) {
					break;
				}

			}

			// This is the final object in the chain, the one on which we are actually looking for values
			if (object) {
				// If the values on this final object change we only need to call the callback, not rebind
				// any intermediate objects
				watchHandles.push(object.watch(key, function (name, oldValue, value) {
					callback.call(source, value, oldValue);
				}));
				callback.call(source, object.get(key), undefined);
				if (initialize) {
					watchHandles.push(
						initialize.call(source, object, key, object.get(key))
					);
				}
			}
		}

		// Perform the object-to-widget binding
		rebind(source, 0);

		return {
			remove: function () {
				var handle;
				while ((handle = watchHandles.pop())) {
					handle.remove && handle.remove();
				}
				source = watchHandles = null;
			}
		};
	}

	return monitor;
});
