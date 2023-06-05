import AbstractView from './abstractView.js';

export default class extends AbstractView {

    initialize() {
        this.isLoading = false;
    }

    onRender() {
        const submitButton = this.queryElement('#submit-button');
        if (!submitButton) {
            return;
        }

        submitButton.onclick = () => {
            this.trigger('submitClicked');
            console.log('submit clicked');
        }
    }

    startLoading() {
        this.isLoading = true;
        this.render();
    }

    stopLoading() {
        this.isLoading = false;
        this.render();
    }

    async sendRequest(data) {
        return await this.makeRequest('predict', 'POST', data);
    }

    getView() {
        let view = `
            <div class="container">
                <div class="row">
        `

        if (this.isLoading) {
            view += `
                <div class="spinner-border mx-auto" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            `
        } else {
            view += `
                <div class="col text-center">
                    <button id="submit-button" class="btn btn-primary my-3">Submit</button>
                </div>
            `
        }
        view += `</div></div>`
        return view
    }
}
