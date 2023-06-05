import FileLoaderView from './fileLoaderView.js';
import ImagePreviewView from './imagePreviewView.js';
import SubmitView from './submitView.js';
import ResultsView from './resultsView.js';

document.addEventListener('DOMContentLoaded', () => {
    const fileLoaderView = new FileLoaderView('#file-loader');
    const imagePreviewView = new ImagePreviewView('#file-preview', { imageSize: 16 });
    const submitView = new SubmitView('#file-submit')
    const resultsView = new ResultsView('#prediction-results')

    fileLoaderView.on('fileChange', (file, imageParts) => {
        // imagePreviewView.renderFilePreview(file);
        imagePreviewView.renderPartsPreview(imageParts);
        resultsView.clearResults();
    });
    submitView.on('submitClicked', async () => {
        // const filesData = [fileLoaderView.selectedFile];
        const filesData = fileLoaderView.getImagePartsFiles();
        if (filesData.length == 0 || !filesData[0]) {
            return
        }

        const formData = new FormData();

        filesData.forEach((file) => {
            formData.append('files[]', file);
        });
        submitView.startLoading();
        const [data, statusCode] = await submitView.sendRequest(formData);
        imagePreviewView.updatePartsResults(data, statusCode);
        resultsView.setResponseData(data, statusCode);
        submitView.stopLoading();
    });

    fileLoaderView.render();
    imagePreviewView.render();
    submitView.render();
    resultsView.render();
});
