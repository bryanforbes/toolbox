define([
	'./monitor'
], function (monitor) {
	function equals(a, b) {
		if (a === b) {
			return true;
		}
		if (typeof a === 'number' && isNaN(a) && typeof b === 'number' && isNaN(b)) {
			return true;
		}
		if (a && typeof a === 'object' && b && typeof b === 'object') {
			if (a.getTime && b.getTime) {
				return a.getTime() === b.getTime();
			}
			if (a.equals) {
				return a.equals(b);
			}
			if (b.equals) {
				return b.equals(a);
			}
		}
		return false;
	}

	function sync(source, sourceProperty, target, targetProperty) {
		return monitor(
			source,
			sourceProperty,
			function (value, oldValue) {
				if (!sync.equals(value, oldValue)) {
					target.set(targetProperty, value);
				}
			},
			{
				reset: function () {
					target.reset && target.reset();
				},
				initialize: function (object, key, initialValue) {
					target.set(targetProperty, initialValue);
					return target.watch(targetProperty, function (name, oldValue, value) {
						if (!sync.equals(value, oldValue)) {
							object.set(key, value);
						}
					});
				}
			}
		);
	}

	sync.equals = equals;
	return sync;
});
