import AbstractView from './abstractView.js';

export default class extends AbstractView {
    initialize() {
        this.selectedFile = null;
        this.imageParts = [];
        this.targetPieceSize = this.params.imageSize || 16;
        this.maxImgWidth = 600;
        this.maxImgHeight = 400;
    }

    onRender() {
        this.queryElement('#upload').onchange = async () => {
            this.selectedFile = await this.getFile();
            this.trigger('fileChange', this.selectedFile, this.imageParts);
        }
    }

    async getFile() {
        const input = this.queryElement('#upload');
        if (input.files && input.files[0]) {
            this.updateFileName(input.files[0].name);
            const file = await this.resizeImageToMinSize(input.files[0]);
            await this.cutImagePieces(file);
            return file;
        }
        this.updateFileName(null);
        this.imageParts = [];
        return null;
    }

    async resizeImageToMinSize(file) {
        const img = new Image();
        img.src = await this.fileToBase64(file);
        await img.decode();
        const canvas = document.createElement('canvas'),
              ctx = canvas.getContext('2d');

        const { width, height } = this.calculateAspectRatioFit(img.width, img.height, this.maxImgWidth, this.maxImgHeight);
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        return this.dataURIToBlob(canvas.toDataURL());
    }

    calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
        const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        let width = srcWidth <= maxWidth ? srcWidth : srcWidth*ratio;
        let height = srcHeight <= maxHeight ? srcHeight : srcHeight*ratio;
        return { width, height };
    }

    dataURIToBlob(dataURI) {
        const splitDataURI = dataURI.split(',')
        const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
        const mimeString = splitDataURI[0].split(':')[1].split(';')[0]

        const ia = new Uint8Array(byteString.length)
        for (let i = 0; i < byteString.length; i++)
            ia[i] = byteString.charCodeAt(i)

        return new Blob([ia], { type: mimeString })
    }

    async fileToBase64(file) {
        return await Promise.all([this.getBase64(file)]);
    }

    getBase64(file) {
        const reader = new FileReader();
        return new Promise(resolve => {
          reader.onload = ev => {
            resolve(ev.target.result);
          }
          reader.readAsDataURL(file);
        });
    }

    getImagePartsFiles() {
        const imageBlobs = [];
        this.imageParts.flat().forEach((fileBase64) => {
            imageBlobs.push(this.dataURIToBlob(fileBase64));
        });
        return imageBlobs;
    }

    async cutImagePieces(file) {
        this.imageParts = [];
        const img = new Image();
        img.src = await this.fileToBase64(file);
        await img.decode();
        let numColsToCut = Math.trunc(img.width / this.targetPieceSize);
        let numRowsToCut = Math.trunc(img.height / this.targetPieceSize);

        for (let y = 0; y < numRowsToCut; ++y) {
            let row = [];
            for (let x = 0; x < numColsToCut; ++x) {
                const canvas = document.createElement('canvas');
                canvas.width = this.targetPieceSize;
                canvas.height = this.targetPieceSize;
                const context = canvas.getContext('2d');
                context.drawImage(img, x * this.targetPieceSize, y * this.targetPieceSize, this.targetPieceSize, this.targetPieceSize, 0, 0, canvas.width, canvas.height);
                row.push(canvas.toDataURL());
            }
            this.imageParts.push(row);
        }
        this.trigger('piecesReady');
    }

    updateFileName(fileName) {
        let text = 'Choose file';
        if (fileName) {
            text = `File name: ${fileName}`;
        }
        this.queryElement('#upload-label').textContent = text;
    }

    getView() {
        return `
            <div class="input-group mb-3 px-2 py-2 rounded-pill bg-white shadow-sm">
                <input class="form-control border-0" id="upload" name="file" type="file">
                <label class="font-weight-light text-muted" for="upload" id="upload-label">Choose file</label>
                <div class="input-group-append">
                    <label class="btn btn-light m-0 rounded-pill px-4" for="upload">
                        <i class="fa fa-cloud-upload mr-2 text-muted"></i>
                        <small class="text-uppercase font-weight-bold text-muted">Choose file</small>
                    </label>
                </div>
            </div>
        `
    }
}
