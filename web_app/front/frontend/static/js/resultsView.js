import AbstractView from './abstractView.js';

export default class extends AbstractView {
    setResponseData(data, statusCode) {
        this.responseData = data;
        this.statusCode = statusCode;
        this.render();
    }

    clearResults() {
        this.setResponseData(null, null);
    }

    getPercentage() {
        let positiveParts = 0;

        this.responseData.forEach(predict => {
            if (predict.result >= 0.5) {
                positiveParts += 1
            }
        });

        const positivePercentage = positiveParts / this.responseData.length
        return positivePercentage * 100 | 0
    }

    getView() {
        if (!this.statusCode) {
            return ''
        }

        if (this.statusCode == 200) {
            const predictionPercentage = this.getPercentage();
            console.log(predictionPercentage);
            let className;
            if (predictionPercentage < 10) {
                className = 'bg-primary';
            } else if (predictionPercentage < 20) {
                className = 'bg-warning';
            } else {
                className = 'bg-danger';
            }
            return `
                <div class="progress">
                    <div class="progress-bar ${className}"
                         role="progressbar"
                         style="width: ${predictionPercentage}%;"
                         aria-valuenow="${predictionPercentage}"
                         aria-valuemin="0"
                         aria-valuemax="100">
                    </div>
                </div>
                <div class='progress-percent'>${predictionPercentage}%</div>
            `
        } else {
            return this.getErrorView(this.responseData['error']);
        }
    }
}
