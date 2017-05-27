import bean from "bean";
import zest from "zest";
import { Controller } from "ng-harmony-core";
import { Log, NotImplementedError, MissingBehaviourError, BehaviourError, StateTransitionError } from "ng-harmony-log";
import "ng-harmony-decorator";

export let EventedController = class EventedController extends Controller {
	constructor(...args) {
		super(...args);

		this.constructor.EVENTS.forEach(behaviour => {
			for (let [i, el] of behaviour.ev.selector ? zest(behaviour.ev.selector, this.$element.context).entries() : [this.$element.context].entries()) {
				this._closurize((_key, _fn, _el, _i) => {
					let __fn = (...args) => {
						this._preEventedFunction(behaviour.ev, args[0], _el, _i);
						_fn(_el, _i, ...args);
						this._postEventedFunction(_key, _fn, _el, _i, behaviour.ev);
					};
					bean.on(_el, behaviour.ev.type, behaviour.ev.delegate || __fn, behaviour.ev.delegate ? __fn : null);
				}, this, behaviour.ev, this[behaviour.fn].bind(this), el, i);
				this._digest();
			}
		});
	}
	_preEventedFunction(descriptor, ev, ...args) {
		if (!this._isVoid(descriptor.delegate)) {
			let el = ev.currentTarget.parentNode;
			while (!zest.matches(el, descriptor.delegate)) {
				el = el.parentNode;
			}
			let list = Array.prototype.slice.call(el.parentNode.children);
			this.$scope.n = list.indexOf(el);
		} else {
			let el = ev.currentTarget;
			let list = Array.prototype.slice.call(el.parentNode.children);
			this.$scope.n = list.indexOf(el);
		}
	}
	_postEventedFunction(key, fn, el, i, descriptor) {
		if (this.log) {
			this.log({
				level: "info",
				msg: "Method _" + key + "_ was triggered"
			});
		}
		this._emit(key, descriptor);
	}
	_emit(triggerFn, descriptor) {
		this.$scope.$emit("change", {
			scope: this,
			triggerFn: triggerFn,
			triggerTokens: descriptor
		});
	}
};
EventedController.$inject = ["$element", "$timeout"];

//# sourceMappingURL=amd_module.js.map