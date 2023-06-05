import AbstractView from './abstractView.js';
import ImagePartDetailView from './imagePartDetailView.js';

export default class extends AbstractView {

    renderFilePreview(file) {
        const previewElement = this.queryElement('#imageResult');
        previewElement.innerHTML = '';

        if (!file) {
            return
        }
        const reader = new FileReader();

        reader.onload = (e) => {
            previewElement.innerHTML = `<img alt="" class="img-fluid rounded shadow-sm mx-auto d-block" id="imagePreview" src="${e.target.result}">`;
        }
        reader.readAsDataURL(file);
    }

    renderPartsPreview(imageParts) {
        console.log('render')
        const previewElement = this.queryElement('#imageResult');
        previewElement.innerHTML = '';

        if (imageParts.length == 0) {
            return
        }
        previewElement.innerHTML = this.getImagePartsPreview(imageParts);
        this.subscribePartsDetails();
    }

    subscribePartsDetails() {
        this.queryElements('.image-cell').forEach(element => {
            const imageSource = element.querySelector('img').src;
            const imageId = element.getAttribute('data-imageId');

            element.onclick = (e) => {
                if (this.imageDetailView) {
                    this.imageDetailView.unbind();
                }
                const result = this.findImagePartElement(imageId).getAttribute('data-result');

                this.imageDetailView = new ImagePartDetailView('#imageDetail', { image: imageSource, result: result })
                this.imageDetailView.render();
            }
        });
    }

    findImagePartElement(fileId) {
        return this.queryElement(`[data-imageId="${fileId}"]`)
    }

    updatePartsResults(results, statusCode) {
        if (statusCode != 200) {
            return;
        }

        results.forEach(pred => {
            const imageElement = this.findImagePartElement(pred.id);
            imageElement.setAttribute('data-result', pred.result);

            if (pred.result >= 0.3) {
                imageElement.classList.remove('image-cell-negative');
                imageElement.classList.add('image-cell-positive');
            } else {
                imageElement.classList.remove('image-cell-positive');
                imageElement.classList.add('image-cell-negative');
            }
        });
    }

    getImagePartsPreview(imageParts) {
        let view  = '<div class="image-preview">';
        let index = 0;
        imageParts.forEach((row) => {
            view += `<div class='image-row container'>`
            row.forEach((col) => {
                view += `<div class='image-cell' data-imageId="${index}"><img src="${col}"></div>`
                ++index;
            });
            view += `</div>`
        });
        view += '</div>'
        return view;
    }

    getView() {
        return `
            <p class="font-italic text-white text-center">
                The image uploaded will be rendered inside the box below.
            </p>
            <div class="mt-4 image-area">
                <div id="imageResult"></div>
            </div>
            <div id="imageDetail"></div>
        `
    }
}
