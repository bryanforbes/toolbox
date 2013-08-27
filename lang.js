define([
	'exports',
	'dojo/_base/lang'
], function (exports, lang) {
	var slice = [].slice,
		objectToString = {}.toString,
		regExpToString = (/s/).toString;

	exports.getProperty = function (object, name, create) {
		if (typeof object !== 'object' || !object) {
			throw new TypeError('object must be a non-null object');
		}
		return lang.getObject(name, create, object);
	};

	exports.setProperty = function (object, name, value) {
		if (typeof object !== 'object' || !object) {
			throw new TypeError('object must be a non-null object');
		}
		return lang.setObject(name, value, object);
	};

	exports.deepMixIn = function (target, source) {
		/* jshint maxcomplexity: 11 */
		if (!target || typeof target !== 'object') {
			target = {};
		}

		if (objectToString.call(source) === '[object Array]') {
			target.length = source.length;
		}

		for (var key in source) {
			var targetValue = target[key],
				sourceValue = source[key];

			if (typeof sourceValue !== 'object' || !sourceValue) {
				// null, undefined, boolean, string, number, function
				if (targetValue !== sourceValue) {
					target[key] = sourceValue;
				}
			}
			else if (targetValue !== sourceValue) {
				// non-null object
				if (sourceValue instanceof Date) {
					target[key] = new Date(+sourceValue);
				}
				else if (sourceValue instanceof RegExp) {
					target[key] = new RegExp(regExpToString(sourceValue));
				}
				else {
					target[key] = exports.deepMixIn(targetValue, sourceValue);
				}
			}
		}

		return target;
	};

	exports.deepDelegate = function (source, properties) {
		properties = properties || {};

		var target = lang.delegate(source);

		for (var name in source) {
			var value = source[name];

			if (value && typeof value === 'object') {
				target[name] = exports.deepDelegate(value, properties[name]);
			}
		}
		return exports.deepMixIn(target, properties);
	};

	exports.createHandle = function () {
		var handles = slice.call(arguments, 0);

		return {
			remove: function () {
				var handle;
				while ((handle = handles.pop())) {
					handle.remove();
				}
			}
		};
	};
});
