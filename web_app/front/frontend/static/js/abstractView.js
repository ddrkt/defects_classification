export default class {
    apiHost = 'http://localhost:5000'

    constructor(container = '#app', params = {}, callback = () => {}) {
        this.params = params;
        this._renderContainer = document.querySelector(container);
        this._callback = callback;

        this.listeners = new Map();
        this.onceListeners = new Map();
        this.triggerdLabels = new Map()
        this.initialize();
    }

    initialize() {
    }

    getApiHost() {
        return this.apiHost
    }

    async makeRequest(endpoint, method, data) {
        const response =  await fetch(`${this.getApiHost()}/${endpoint}`, {
            method: method,
            mode: 'cors',
            headers: {
                'license_id': 2,
                'license_key': 'JF3Jmac56tBjLMw'
            },
            body: data
        });
        return [await response.json(), response.status]
    }

    getErrorView(error) {
        return `
            <p class="error-message">Error occurred: <b>${error}</b></p>
        `;
    }

    async getView() {
        return ``;
    }

    onRender() {
    }

    queryElement(selector) {
        return this._renderContainer.querySelector(selector)
    }

    queryElements(selector) {
        return this._renderContainer.querySelectorAll(selector)
    }

    async _renderView() {
        this._renderContainer.innerHTML = await this.getView();
    }

    async render() {
        await this._renderView();
        this.onRender();
        this._callback();
    }

    unbind() {
        this._renderContainer.innerHTML = '';
        this.listeners = new Map();
        this.onceListeners = new Map();
        this.triggerdLabels = new Map()
    }

    _fCheckPast(label, callback) {
        if (this.triggerdLabels.has(label)) {
            callback(this.triggerdLabels.get(label));
            return true;
        } else {
            return false;
        }
    }

    on(label, callback, checkPast = false) {
        this.listeners.has(label) || this.listeners.set(label, []);
        this.listeners.get(label).push(callback);
        if (checkPast) {
            this._fCheckPast(label, callback);
        }
    }

    onReady(label, callback) {
        this.on(label, callback, true);
    }

    once(label, callback, checkPast = false) {
        this.onceListeners.has(label) || this.onceListeners.set(label, []);
        if (!(checkPast && this._fCheckPast(label, callback))) {
            this.onceListeners.get(label).push(callback);
        }
    }

    onceReady(label, callback) {
        this.once(label, callback, true);
    }

    off(label, callback = true) {
        if (callback === true) {
            this.listeners.delete(label);
            this.onceListeners.delete(label);
        } else {
            let _off = (inListener) => {
                let listeners = inListener.get(label);
                if (listeners) {
                    inListener.set(label, listeners.filter((value) => !(value === callback)));
                }
            };
            _off(this.listeners);
            _off(this.onceListeners);
        }
    }

    trigger(label, ...args) {
        let res = false;
        this.triggerdLabels.set(label, ...args);
        let _trigger = (inListener, label, ...args) => {
            let listeners = inListener.get(label);
            if (listeners && listeners.length) {
                listeners.forEach((listener) => {
                    listener(...args);
                });
                res = true;
            }
        };
        _trigger(this.onceListeners, label, ...args);
        _trigger(this.listeners, label, ...args);
        this.onceListeners.delete(label);
        return res;
    }
}
