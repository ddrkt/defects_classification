import AbstractView from './abstractView.js';

export default class extends AbstractView {
    initialize() {
        this.image = this.params.image || '#';
        this.result = this.params.result || null;
    }

    onRender() {
        const closeButton = this.queryElement(".close");
        const overlay = this.queryElement('.overlay');

        overlay.onclick = (e) => {
            if (!e.target.classList.contains('overlay')) {
                e.preventDefault();
            } else {
                this.unbind();
            }
        }
        closeButton.onclick = () => this.unbind();
    }

    getView() {
        return `
            <div id="popup1" class="overlay">
                <div class="popup">
                    <a class="close">&times;</a>
                    <div class="content">
                        <div class="content popup-image">
                            <img src="${this.image}" style="width: 240px; height: 240px;">
                            <p>Result: ${this.result == null ? 'Unknown' : (this.result * 100 | 0) + '%' }</p>
                        </div>
                    </div>
                </div>
            </div>
        `
    }
}
